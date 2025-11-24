import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Home.css';
import { createRoom } from '../services/roomService';
import { useToast } from '../components/Toast';

const Home = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const [username, setUsername] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const handleCreateGame = async () => {
    if (!username) {
      toast.warning('Veuillez entrer un pseudo');
      return;
    }
    
    setIsCreating(true);
    try {
      const { roomCode, playerId } = await createRoom(username);
      navigate(`/lobby/${roomCode}`, { state: { playerId } });
    } catch (error) {
      console.error(error);
      toast.error(`Erreur lors de la création de la partie: ${error.message}`);
    } finally {
      setIsCreating(false);
    }
  };

  const handleJoinGame = () => {
    if (!username) {
      toast.warning('Veuillez entrer un pseudo');
      return;
    }
    navigate('/join', { state: { username } });
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
