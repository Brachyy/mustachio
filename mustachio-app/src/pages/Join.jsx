import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { joinRoom } from '../services/roomService';
import './Home.css'; // Reuse Home styles

const Join = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [username, setUsername] = useState(location.state?.username || '');
  const [roomCode, setRoomCode] = useState('');
  const [error, setError] = useState('');

  const handleJoin = async () => {
    if (!username || !roomCode) {
      setError('Veuillez remplir tous les champs');
      return;
    }

    try {
      const { playerId } = await joinRoom(roomCode.toUpperCase(), username);
      navigate(`/lobby/${roomCode.toUpperCase()}`, { state: { playerId } });
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="home-container">
      <div className="logo-container">
        <h1>Rejoindre</h1>
      </div>
      
      <div className="input-container">
        {location.state?.username ? (
          <div className="username-input" style={{ 
            marginBottom: '10px', 
            background: 'rgba(255, 255, 255, 0.15)',
            cursor: 'default'
          }}>
            {username}
          </div>
        ) : (
          <input
            type="text"
            placeholder="Ton pseudo"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="username-input"
            style={{ marginBottom: '10px' }}
          />
        )}
        <input
          type="text"
          placeholder="Code de la salle"
          value={roomCode}
          onChange={(e) => setRoomCode(e.target.value)}
          className="username-input"
          maxLength={6}
        />
      </div>

      {error && <div style={{ color: '#ff4444', marginBottom: '15px' }}>{error}</div>}

      <div className="actions-container">
        <button onClick={handleJoin} className="btn btn-primary">
          Valider
        </button>
        <button onClick={() => navigate('/')} className="btn btn-secondary">
          Retour
        </button>
      </div>
    </div>
  );
};

export default Join;
