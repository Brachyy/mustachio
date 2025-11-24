import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Trophy, Home } from 'lucide-react';
import './EndGame.css';

const EndGame = ({ room }) => {
  const navigate = useNavigate();
  const players = Object.values(room.players || {});

  return (
    <div className="endgame-container">
      <div className="endgame-content glass-card">
        <div className="trophy-icon">
          <Trophy size={80} />
        </div>
        
        <h1 className="endgame-title">Partie Terminée !</h1>
        
        <div className="endgame-message">
          <p>Le deck est vide, la partie est finie !</p>
          <p className="subtitle">Merci d'avoir joué au Mustachio 🥸</p>
        </div>

        <div className="players-summary">
          <h3>Participants ({players.length})</h3>
          <div className="players-list">
            {players.map((player) => (
              <div key={player.id} className="player-item">
                <div 
                  className="player-avatar-small" 
                  style={{ backgroundColor: `hsl(${player.avatar * 18}, 70%, 50%)` }}
                >
                  👨🏻
                </div>
                <span className="player-name">{player.name}</span>
                {player.isHost && <span className="host-badge-small">Hôte</span>}
              </div>
            ))}
          </div>
        </div>

        <button 
          className="btn btn-primary endgame-btn" 
          onClick={() => navigate('/')}
        >
          <Home size={20} />
          Retour à l'accueil
        </button>
      </div>
    </div>
  );
};

export default EndGame;
