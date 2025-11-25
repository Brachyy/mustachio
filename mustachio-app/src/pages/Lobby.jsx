import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { subscribeToRoom, startGame, leaveRoom } from '../services/roomService';
import Game from './Game';
import './Lobby.css';
import { Copy, Users, Play, ArrowLeft, LogOut, Settings } from 'lucide-react';
import { useToast } from '../components/Toast';
import Loader from '../components/Loader';
import { soundService } from '../services/soundService';
import GameSettings from '../components/GameSettings';

const Lobby = () => {
  const { roomCode } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();
  const [room, setRoom] = useState(null);
  const [playerId, setPlayerId] = useState(location.state?.playerId);
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    if (!roomCode) return;
    
    const unsubscribe = subscribeToRoom(roomCode, (data) => {
      if (data) {
        setRoom(data);
      } else {
        toast.error("La salle a été fermée");
        navigate('/');
      }
    });

    return () => unsubscribe();
  }, [roomCode, navigate, toast]);

  // Play sound when players join/leave
  const prevPlayerCountRef = React.useRef(0);
  useEffect(() => {
    if (room?.players) {
      const count = Object.keys(room.players).length;
      if (prevPlayerCountRef.current > 0 && count > prevPlayerCountRef.current) {
        soundService.playJoin();
      } else if (prevPlayerCountRef.current > 0 && count < prevPlayerCountRef.current) {
        soundService.playLeave();
      }
      prevPlayerCountRef.current = count;
    }
  }, [room?.players]);

  const copyCode = () => {
    navigator.clipboard.writeText(roomCode);
    toast.success('Code copié !');
  };

  const handleLeave = async () => {
    if (window.confirm('Voulez-vous vraiment quitter la partie ?')) {
      try {
        await leaveRoom(roomCode, playerId);
        toast.info('Vous avez quitté la partie');
        navigate('/');
      } catch (error) {
        toast.error('Erreur lors de la déconnexion');
      }
    }
  };

  if (!room) return <Loader text="Chargement du salon..." fullScreen />;

  if (room.status === 'playing') {
    return <Game room={room} playerId={playerId} />;
  }

  const players = Object.values(room.players || {});
  const isHost = room.players[playerId]?.isHost;

  return (
    <div className="lobby-container">
      <div className="lobby-header">
        <button className="btn-icon" onClick={handleLeave} title="Quitter la partie">
          <LogOut size={24} />
        </button>
        
        <h2>Salle d'attente</h2>
        
        <div className="header-right">
          <div className="room-code-display" onClick={copyCode}>
            <span>CODE: {roomCode}</span>
            <Copy size={20} />
          </div>
          {isHost && (
            <button className="btn-icon" onClick={() => setShowSettings(true)} title="Paramètres">
              <Settings size={24} />
            </button>
          )}
        </div>
      </div>

      <div className="players-list">
        <div className="list-header">
          <Users size={24} />
          <h3>Moustachus ({players.length})</h3>
        </div>
        <div className="players-grid">
          {players.map((player) => (
            <div key={player.id} className="player-card bounce-in">
              <div className="player-avatar" style={{ backgroundColor: getAvatarColor(player.avatar) }}>
                <img src="/assets/avatar.png" alt="Avatar" />
              </div>
              <span className="player-name">{player.name}</span>
              {player.isHost && <span className="host-badge">Hôte</span>}
            </div>
          ))}
        </div>
        
        {!isHost && (
          <div className="waiting-host-inline">
            <Loader size="small" />
            <p>En attente de l'hôte...</p>
          </div>
        )}
      </div>

      {isHost && (
        <button 
          className="btn btn-primary start-btn"
          onClick={() => startGame(roomCode)}
          disabled={players.length < 2}
        >
          <Play size={24} />
          Démarrer la partie
        </button>
      )}

      {showSettings && (
        <GameSettings room={room} onClose={() => setShowSettings(false)} />
      )}
    </div>
  );
};

// Helper for avatar colors (should match other components)
const getAvatarColor = (id) => {
  const colors = [
    '#e74c3c', '#3498db', '#2ecc71', '#f1c40f', '#9b59b6', 
    '#e67e22', '#1abc9c', '#34495e', '#ff0066', '#00ccff',
    '#cc00ff', '#ffcc00', '#00ffcc', '#ff00cc', '#ccff00',
    '#00cc00', '#0000cc', '#cc0000', '#666666', '#999999'
  ];
  return colors[id % colors.length];
};

export default Lobby;

