import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { subscribeToRoom, startGame, leaveRoom } from '../services/roomService';
import Game from './Game';
import './Lobby.css';
import { Copy, Users, Play, ArrowLeft, LogOut } from 'lucide-react';
import { useToast } from '../components/Toast';

const Lobby = () => {
  const { roomCode } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();
  const [room, setRoom] = useState(null);
  const [playerId, setPlayerId] = useState(location.state?.playerId);

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

  if (!room) return <div className="loading">Chargement...</div>;

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
        <div className="room-code-display" onClick={copyCode}>
          <span>CODE: {roomCode}</span>
          <Copy size={20} />
        </div>
      </div>

      <div className="players-list">
        <div className="list-header">
          <Users size={24} />
          <h3>Moustachus ({players.length})</h3>
        </div>
        <div className="players-grid">
          {players.map((player) => (
            <div key={player.id} className="player-card">
              <div className="avatar" style={{ backgroundColor: `hsl(${player.avatar * 18}, 70%, 50%)` }}>
                <div className="mustache-icon">👨🏻</div>
              </div>
              <span className="player-name">{player.name}</span>
              {player.isHost && <span className="host-badge">Hôte</span>}
            </div>
          ))}
        </div>
      </div>

      {isHost ? (
        <div className="host-controls">
          <button className="btn btn-primary start-btn" onClick={() => startGame(roomCode)}>
            <Play size={24} />
            Démarrer la Partie
          </button>
        </div>
      ) : (
        <div className="guest-message">
          En attente de l'hôte pour démarrer...
        </div>
      )}
    </div>
  );
};

export default Lobby;
