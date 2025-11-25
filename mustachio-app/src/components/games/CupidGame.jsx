import React, { useState, useEffect } from 'react';
import { update, ref, set } from 'firebase/database';
import { db } from '../../firebase';
import './CupidGame.css';

const CupidGame = ({ room, isMyTurn, onNext, playerId }) => {
  const [step, setStep] = useState('selecting'); // selecting, finished
  const [selectedLovers, setSelectedLovers] = useState([]);
  const [lovers, setLovers] = useState(null);

  useEffect(() => {
    if (room.miniGameState) {
      setStep(room.miniGameState.step || 'selecting');
      if (room.miniGameState.lovers) {
        setLovers(room.miniGameState.lovers);
      }
    }
  }, [room.miniGameState]);

  const handleTogglePlayer = (pid) => {
    if (!isMyTurn || step !== 'selecting') return;
    
    setSelectedLovers(prev => {
      if (prev.includes(pid)) {
        return prev.filter(id => id !== pid);
      }
      if (prev.length >= 2) {
        return prev;
      }
      return [...prev, pid];
    });
  };

  const handleConfirm = async () => {
    if (!isMyTurn || selectedLovers.length !== 2) return;

    const loversData = selectedLovers.map(pid => ({
      id: pid,
      name: room.players[pid].name
    }));

    // Update miniGameState AND room.lovers for persistent display if needed later
    await update(ref(db, `rooms/${room.code}/miniGameState`), {
      step: 'finished',
      lovers: loversData
    });

    // Also update global room lovers state if we want it persistent on board
    // Use set because we are replacing the entire node with an array/object
    await set(ref(db, `rooms/${room.code}/lovers`), loversData);
  };

  const renderSelection = () => {
    if (!isMyTurn) {
      const cupidName = room.players[room.order[room.currentTurnIndex]].name;
      return (
        <div className="waiting-cupid">
          <div className="cupid-icon">💘</div>
          <p>{cupidName} prépare ses flèches...</p>
          <p className="sub-text">Qui seront les élus ?</p>
        </div>
      );
    }

    return (
      <div className="selection-phase">
        <h3>Forme un couple !</h3>
        <p>Choisis 2 joueurs à unir par les liens du mariage (et de la soif).</p>
        
        <div className="players-grid">
          {Object.entries(room.players).map(([pid, player]) => (
            <div 
              key={pid} 
              className={`player-card-select ${selectedLovers.includes(pid) ? 'selected' : ''}`}
              onClick={() => handleTogglePlayer(pid)}
            >
              <div className="player-avatar" style={{ backgroundColor: `hsl(${(player.avatar || 0) * 18}, 70%, 50%)` }}>
                <img src="/assets/avatar.png" alt="Avatar" />
              </div>
              <div className="player-name">{player.name}</div>
              {selectedLovers.includes(pid) && <div className="heart-badge">❤️</div>}
            </div>
          ))}
        </div>

        <button 
          className="btn btn-primary confirm-btn" 
          disabled={selectedLovers.length !== 2}
          onClick={handleConfirm}
        >
          Valider le couple ({selectedLovers.length}/2)
        </button>
      </div>
    );
  };

  const renderResult = () => {
    if (!lovers) return null;

    return (
      <div className="result-phase pop-in">
        <h3>Vive les mariés ! 💍</h3>
        
        <div className="lovers-display">
          <div className="lover">
            <span className="lover-name">{lovers[0].name}</span>
          </div>
          <div className="heart-animation">❤️</div>
          <div className="lover">
            <span className="lover-name">{lovers[1].name}</span>
          </div>
        </div>

        <p className="lovers-rule">
          Désormais, quand l'un boit, l'autre boit aussi !
        </p>

        {isMyTurn && (
          <button className="btn btn-secondary" onClick={onNext}>
            Terminer
          </button>
        )}
      </div>
    );
  };

  return (
    <div className="cupid-game-container glass-card">
      <h2 className="game-title">Cupidon</h2>
      {step === 'selecting' && renderSelection()}
      {step === 'finished' && renderResult()}
    </div>
  );
};

export default CupidGame;
