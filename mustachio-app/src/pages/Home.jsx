import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Home.css';

import { createRoom } from '../services/roomService';

const Home = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const handleCreateGame = async () => {
    if (!username) return alert('Veuillez entrer un pseudo');
    
    setIsCreating(true);
    try {
      const { roomCode, playerId } = await createRoom(username);
      navigate(`/lobby/${roomCode}`, { state: { playerId } });
    } catch (error) {
      console.error(error);
      alert(`Erreur lors de la création de la partie: ${error.message}`);
    } finally {
      setIsCreating(false);
    }
  };

  const handleJoinGame = () => {
    if (!username) return alert('Veuillez entrer un pseudo');
    // Pass username to Join page if needed, or just navigate
    navigate('/join');
  };

  return (
    <div className="home-container">
      <div className="logo-container">
        <img src="/mustachio-logo.png" alt="Mustachio" className="logo" />
        <h1>Mustachio</h1>
      </div>
      
      <div className="input-container">
        <input
          type="text"
          placeholder="Ton pseudo de Moustachu"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="username-input"
        />
      </div>

      <div className="actions-container">
        <button onClick={handleCreateGame} className="btn btn-primary">
          Créer une Table
        </button>
        <button onClick={handleJoinGame} className="btn btn-secondary">
          Rejoindre une Table
        </button>
      </div>
    </div>
  );
};

export default Home;
