import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { ref, onValue, update, remove } from 'firebase/database';
import { db } from '../firebase';
import { startGame } from '../services/roomService';
import { Copy, Users, Play, LogOut, Settings } from 'lucide-react';
import { useToast } from '../components/Toast';
import Loader from '../components/Loader';
import GameSettings from '../components/GameSettings';
import Game from './Game';
import './Lobby.css';

const Lobby = () => {
  const { roomCode } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();
  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  
  // Get playerId from location state or localStorage
  const playerId = location.state?.playerId || localStorage.getItem(`mustachio_player_${roomCode}`);

  useEffect(() => {
    if (!roomCode || !playerId) {
      navigate('/');
      return;
    }

    const roomRef = ref(db, `rooms/${roomCode}`);
    const unsubscribe = onValue(roomRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setRoom(data);
        setLoading(false);
      } else {
        toast.error('La partie n\'existe plus');
        navigate('/');
      }
    });

    return () => unsubscribe();
  }, [roomCode, playerId, navigate, toast]);

  const copyCode = () => {
    navigator.clipboard.writeText(roomCode);
    toast.success('Code copié !');
  };

  const handleLeave = async () => {
    if (window.confirm('Voulez-vous vraiment quitter ?')) {
      try {
        if (room.players && Object.keys(room.players).length <= 1) {
          await remove(ref(db, `rooms/${roomCode}`));
        } else {
          await remove(ref(db, `rooms/${roomCode}/players/${playerId}`));
        }
        navigate('/');
      } catch (error) {
        console.error("Error leaving room:", error);
      }
    }
  };

  if (loading) return <Loader />;
  if (!room) return null;

  if (room.status === 'playing') {
    return <Game room={room} playerId={playerId} />;
  }

  const players = Object.values(room.players || {});
  const isHost = room.players[playerId]?.isHost;

  return (
    <div className="lobby-container">
      {/* Header: Back Button (Left) & Settings (Right) */}
      <header className="lobby-header">
        <button className="btn-icon back-btn" onClick={handleLeave} title="Quitter">
          <LogOut size={24} />
        </button>
        
        {isHost && (
          <button className="btn-icon settings-btn" onClick={() => setShowSettings(true)} title="Paramètres">
            <Settings size={24} />
          </button>
        )}
      </header>

      {/* Main Content */}
      <main className="lobby-content">
        {/* Room Code Section */}
        <div className="room-info">
          <h2>Code de la salle</h2>
          <div className="code-badge" onClick={copyCode}>
            <span className="code">{roomCode}</span>
            <Copy size={18} />
          </div>
        </div>

        {/* Players Grid */}
        <div className="players-section">
          <div className="section-header">
            <Users size={20} />
            <span>Joueurs ({players.length})</span>
          </div>
          
          <div className="players-grid">
            {players.map((player) => (
              <div key={player.id} className="player-card">
                <div className="avatar-wrapper" style={{ borderColor: getAvatarColor(player.avatar) }}>
                  <img src="/assets/avatar.png" alt="Avatar" />
                </div>
                <span className="player-name">{player.name}</span>
                {player.isHost && <span className="host-tag">Hôte</span>}
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Footer Actions */}
      <footer className="lobby-footer">
        {isHost ? (
          <button 
            className="btn btn-primary start-btn"
            onClick={() => startGame(roomCode)}
            disabled={players.length < 2}
          >
            <Play size={24} fill="currentColor" />
            <span>Lancer la partie</span>
          </button>
        ) : (
          <div className="waiting-status">
            <Loader size="small" />
            <span>En attente de l'hôte...</span>
          </div>
        )}
      </footer>

      {/* Settings Modal */}
      {showSettings && (
        <GameSettings room={room} onClose={() => setShowSettings(false)} />
      )}
    </div>
  );
};

// Helper for avatar colors
const getAvatarColor = (id) => {
  const colors = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEEAD', 
    '#D4A5A5', '#9B59B6', '#3498DB', '#E67E22', '#2ECC71'
  ];
  return colors[id % colors.length];
};

export default Lobby;
