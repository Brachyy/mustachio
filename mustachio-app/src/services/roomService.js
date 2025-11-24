import { db } from '../firebase';
import { ref, set, get, update, onValue, push, child } from 'firebase/database';

export const createRoom = async (hostName) => {
  const roomCode = Math.random().toString(36).substring(2, 8).toUpperCase();
  const roomRef = ref(db, `rooms/${roomCode}`);
  
  const newRoom = {
    code: roomCode,
    hostId: 'host', // In a real app with Auth, this would be the UID
    name: `${hostName}'s Table`, // Added to satisfy validation rules
    status: 'waiting',
    createdAt: Date.now(),
    players: {
      host: {
        id: 'host',
        name: hostName,
        isHost: true,
        avatar: Math.floor(Math.random() * 20) // Random avatar index
      }
    }
  };

  await set(roomRef, newRoom);
  return { roomCode, playerId: 'host' };
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

  const playerId = push(child(ref(db), 'players')).key; // Generate unique ID
  const playerRef = ref(db, `rooms/${roomCode}/players/${playerId}`);

  await set(playerRef, {
    id: playerId,
    name: playerName,
    isHost: false,
    avatar: Math.floor(Math.random() * 20)
  });

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
