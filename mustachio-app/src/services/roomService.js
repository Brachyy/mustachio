import { db } from '../firebase';
import { ref, set, get, update, onValue, push, child, remove, onDisconnect } from 'firebase/database';

const MAX_PLAYERS = 10;

// Unambiguous characters (no 0, O, I, 1, etc.)
const ROOM_CODE_CHARS = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';

// Generate room code without ambiguous characters
const generateRoomCode = () => {
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += ROOM_CODE_CHARS[Math.floor(Math.random() * ROOM_CODE_CHARS.length)];
  }
  return code;
};

// Generate deterministic avatar from username
const hashCode = (str) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash);
};

const getAvatarFromName = (name) => {
  return hashCode(name) % 20;
};

export const createRoom = async (hostName) => {
  const roomCode = generateRoomCode();
  const roomRef = ref(db, `rooms/${roomCode}`);
  
  // Generate a unique ID for the host
  const hostId = push(child(ref(db), 'players')).key;
  
  const newRoom = {
    code: roomCode,
    hostId: hostId,
    name: `${hostName}'s Table`,
    status: 'waiting',
    createdAt: Date.now(),
    players: {
      [hostId]: {
        id: hostId,
        name: hostName,
        isHost: true,
        avatar: getAvatarFromName(hostName)
      }
    }
  };

  await set(roomRef, newRoom);
  
  // Setup disconnect handler for host
  const hostPlayerRef = ref(db, `rooms/${roomCode}/players/${hostId}`);
  onDisconnect(hostPlayerRef).remove();
  
  return { roomCode, playerId: hostId };
};

export const joinRoom = async (roomCode, playerName) => {
  const roomRef = ref(db, `rooms/${roomCode}`);
  const snapshot = await get(roomRef);

  if (!snapshot.exists()) {
    throw new Error("La salle n'existe pas");
  }

  const roomData = snapshot.val();
  if (roomData.status !== 'waiting') {
    throw new Error("La partie a déjà commencé");
  }

  // Check player limit
  const currentPlayerCount = Object.keys(roomData.players || {}).length;
  if (currentPlayerCount >= MAX_PLAYERS) {
    throw new Error(`La salle est pleine (maximum ${MAX_PLAYERS} joueurs)`);
  }

  const playerId = push(child(ref(db), 'players')).key;
  const playerRef = ref(db, `rooms/${roomCode}/players/${playerId}`);

  await set(playerRef, {
    id: playerId,
    name: playerName,
    isHost: false,
    avatar: getAvatarFromName(playerName)
  });
  
  // Setup disconnect handler - auto remove player on disconnect
  onDisconnect(playerRef).remove();

  return { roomCode, playerId };
};

export const subscribeToRoom = (roomCode, callback) => {
  const roomRef = ref(db, `rooms/${roomCode}`);
  return onValue(roomRef, (snapshot) => {
    callback(snapshot.val());
  });
};

export const startGame = async (roomCode) => {
  const roomRef = ref(db, `rooms/${roomCode}`);
  const snapshot = await get(roomRef);
  const room = snapshot.val();
  
  if (!room) throw new Error("Room not found");

  const deck = (await import('../utils/deck')).generateDeck();
  const playerIds = Object.keys(room.players);
  
  await update(roomRef, {
    status: 'playing',
    deck: deck,
    currentTurnIndex: 0,
    activeCard: null,
    order: playerIds // Define turn order
  });
};

export const endTurn = async (roomCode) => {
  const roomRef = ref(db, `rooms/${roomCode}`);
  const snapshot = await get(roomRef);
  const room = snapshot.val();

  if (!room) return;

  const nextTurnIndex = (room.currentTurnIndex + 1) % room.order.length;

  await update(roomRef, {
    activeCard: null,
    currentTurnIndex: nextTurnIndex,
    lastAction: Date.now(),
    miniGameState: null
  });
};

export const drawCard = async (roomCode) => {
  const roomRef = ref(db, `rooms/${roomCode}`);
  const snapshot = await get(roomRef);
  const room = snapshot.val();

  if (!room.deck || room.deck.length === 0) {
    // End game when deck is empty
    await update(roomRef, {
      status: 'finished',
      activeCard: null,
      miniGameState: null,
      endedAt: Date.now()
    });
    return;
  }

  const newDeck = [...room.deck];
  const card = newDeck.pop();
  
  const updates = {
    deck: newDeck,
    activeCard: card,
    lastAction: Date.now(),
    miniGameState: null 
  };

  // Handle Mustachio (King)
  if (card.value === 'K') {
    updates.mustachio = room.order[room.currentTurnIndex];
  }

  await update(roomRef, updates);
};

export const leaveRoom = async (roomCode, playerId) => {
  const playerRef = ref(db, `rooms/${roomCode}/players/${playerId}`);
  await remove(playerRef);
  
  // After a player leaves (or disconnects), ensure a host exists
  await reassignHostIfNeeded(roomCode);

  // Check if room is empty
  const roomRef = ref(db, `rooms/${roomCode}`);
  const snapshot = await get(roomRef);
  const room = snapshot.val();
  
  if (room && Object.keys(room.players || {}).length === 0) {
    // Delete empty room
    await remove(roomRef);
  }
};

export const reassignHostIfNeeded = async (roomCode) => {
  const roomRef = ref(db, `rooms/${roomCode}`);
  const snapshot = await get(roomRef);
  const room = snapshot.val();
  if (!room) return;
  const hostId = room.hostId;
  if (!room.players || !room.players[hostId]) {
    // No host present – pick the first remaining player as new host
    const playerIds = Object.keys(room.players || {});
    if (playerIds.length > 0) {
      const newHostId = playerIds[0];
      await update(roomRef, {
        hostId: newHostId,
        [`players/${newHostId}/isHost`]: true
      });
    }
  }
};
