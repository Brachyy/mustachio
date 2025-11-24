import React, { useState, useEffect } from 'react';
import { update, ref } from 'firebase/database';
import { db } from '../../firebase';
import './FingerLottoGame.css';

const FingerLottoGame = ({ room, isMyTurn, onNext, playerId }) => {
  const [step, setStep] = useState('betting');
  const [myBet, setMyBet] = useState(null);
  const [myFingers, setMyFingers] = useState(null);
  const [results, setResults] = useState(null);
  const [revealedCount, setRevealedCount] = useState(0);
  const [runningTotal, setRunningTotal] = useState(0);

  useEffect(() => {
    if (room.miniGameState) {
      setStep(room.miniGameState.step || 'betting');
      // ... existing logic
    }
  }, [room.miniGameState]);

  // Sequential reveal animation
  useEffect(() => {
    if (step === 'revealing') {
      const votes = Object.values(room.miniGameState.votes || {});
      const totalPlayers = votes.length;
      
      if (revealedCount < totalPlayers) {
        const timer = setTimeout(() => {
          const nextVote = votes[revealedCount];
          setRunningTotal(prev => prev + nextVote.fingers);
          setRevealedCount(prev => prev + 1);
          soundService.playTick(); // Add sound effect
        }, 1000); // 1.5s delay between reveals
        return () => clearTimeout(timer);
      }
    } else {
      // Reset if not revealing
      setRevealedCount(0);
      setRunningTotal(0);
    }
  }, [step, revealedCount, room.miniGameState]);

  const handleBet = async (type, value) => {
    if (!isMyTurn) return;
    await update(ref(db, `rooms/${room.code}/miniGameState`), {
      step: 'voting',
      bet: { type, value },
      votes: {}
    });
  };

  const handleVote = async (fingers) => {
    if (isMyTurn) return;
    setMyFingers(fingers);
    await update(ref(db, `rooms/${room.code}/miniGameState/votes/${playerId}`), {
      fingers,
      name: room.players[playerId].name
    });
  };

  const handleReveal = async () => {
    if (!isMyTurn) return;
    
    const votes = room.miniGameState.votes || {};
    const totalFingers = Object.values(votes).reduce((sum, v) => sum + v.fingers, 0);
    const bet = room.miniGameState.bet;
    
    let won = false;
    let sips = 0;
    let distribution = 0;

    if (bet.type === 'exact') {
      won = totalFingers === parseInt(bet.value);
      sips = won ? 0 : 3;
      distribution = won ? (Object.keys(room.players).length - 1) * 2 : 0;
    } else if (bet.type === 'range2') {
      const min = parseInt(bet.value);
      won = totalFingers >= min && totalFingers <= min + 2;
      sips = won ? 0 : 2;
      distribution = won ? Math.ceil((Object.keys(room.players).length - 1) / 1.5) : 0;
    } else if (bet.type === 'range4') {
      const min = parseInt(bet.value);
      won = totalFingers >= min && totalFingers <= min + 4;
      sips = won ? 0 : 1;
      distribution = won ? 1 : 0;
    }

    await update(ref(db, `rooms/${room.code}/miniGameState`), {
      step: 'revealing',
      result: { totalFingers, won, sips, distribution }
    });
  };

  const renderBetting = () => {
    const currentPlayerName = room.players[room.order[room.currentTurnIndex]].name;
    if (!isMyTurn) return <p>{currentPlayerName} parie sur le nombre de doigts...</p>;
    
    const otherPlayersCount = Object.keys(room.players).length - 1;
    const gainExact = otherPlayersCount * 2;
    const gainRange2 = Math.ceil(otherPlayersCount / 1.5);
    const gainRange4 = 1;

    return (
      <div className="betting-options">
        <h3>Fais ton pari !</h3>
        
        <div className="bet-section glass-panel">
          <div className="bet-header">
            <h4>🎯 Nombre Exact</h4>
            <span className="gain-badge">Gain: {gainExact} 🍺</span>
          </div>
          <div className="input-row">
            <input type="number" id="exact-input" placeholder="Ex: 5" className="glass-input" />
            <button className="btn btn-primary" onClick={() => handleBet('exact', document.getElementById('exact-input').value)}>Valider</button>
          </div>
          <small>Risque : 3 gorgées</small>
        </div>

        <div className="bet-section glass-panel">
          <div className="bet-header">
            <h4>⚖️ Borne de 2</h4>
            <span className="gain-badge">Gain: {gainRange2} 🍺</span>
          </div>
          <div className="input-row">
            <input type="number" id="range2-input" placeholder="Min (ex: 4)" className="glass-input" />
            <button className="btn btn-primary" onClick={() => handleBet('range2', document.getElementById('range2-input').value)}>Valider</button>
          </div>
          <small>Risque : 2 gorgées. (Ex: 4 gagne sur 4, 5, 6)</small>
        </div>

        <div className="bet-section glass-panel">
          <div className="bet-header">
            <h4>🌊 Borne de 4</h4>
            <span className="gain-badge">Gain: {gainRange4} 🍺</span>
          </div>
          <div className="input-row">
            <input type="number" id="range4-input" placeholder="Min (ex: 2)" className="glass-input" />
            <button className="btn btn-primary" onClick={() => handleBet('range4', document.getElementById('range4-input').value)}>Valider</button>
          </div>
          <small>Risque : 1 gorgée. (Ex: 2 gagne sur 2, 3, 4, 5, 6)</small>
        </div>
      </div>
    );
  };

  // Auto-reveal when everyone voted
  useEffect(() => {
    if (step === 'voting' && isMyTurn) {
      const votes = room.miniGameState?.votes || {};
      const voteCount = Object.keys(votes).length;
      const totalPlayers = Object.keys(room.players).length - 1;

      if (voteCount >= totalPlayers) {
        handleReveal();
      }
    }
  }, [room.miniGameState, step, isMyTurn]);

  const renderVoting = () => {
    const votes = room.miniGameState?.votes || {};
    const voteCount = Object.keys(votes).length;
    const totalPlayers = Object.keys(room.players).length - 1;

    if (isMyTurn) {
      return (
        <div className="waiting-votes">
          <p>Les autres choisissent leurs doigts... ({voteCount}/{totalPlayers})</p>
          <div className="loading-spinner"></div>
        </div>
      );
    }

    if (myFingers !== null) return <p>Tu as choisi {myFingers} doigt(s). Attends le résultat.</p>;

    return (
      <div className="voting-options">
        <h3>Combien de doigts ?</h3>
        <div className="finger-buttons">
          <button className="btn finger-btn" onClick={() => handleVote(0)}>
            <span className="emoji">✊</span>
            <span className="number">0</span>
          </button>
          <button className="btn finger-btn" onClick={() => handleVote(1)}>
            <span className="emoji">☝️</span>
            <span className="number">1</span>
          </button>
          <button className="btn finger-btn" onClick={() => handleVote(2)}>
            <span className="emoji">✌️</span>
            <span className="number">2</span>
          </button>
        </div>
      </div>
    );
  };

  const renderResult = () => {
    const res = room.miniGameState?.result;
    if (!res) return null;

    const votes = Object.values(room.miniGameState.votes || {});
    const isFinished = revealedCount >= votes.length;
    const bet = room.miniGameState.bet;

    const getBetLabel = () => {
      if (!bet) return "";
      if (bet.type === 'exact') return `Nombre Exact : ${bet.value}`;
      if (bet.type === 'range2') return `Borne de 2 : ${bet.value} à ${parseInt(bet.value) + 2}`;
      if (bet.type === 'range4') return `Borne de 4 : ${bet.value} à ${parseInt(bet.value) + 4}`;
      return "";
    };

    const currentPlayerName = room.players[room.order[room.currentTurnIndex]].name;

    return (
      <div className="result-screen">
        <h3>Révélation !</h3>
        
        <div className="bet-display glass-panel">
          <p>{currentPlayerName} a parié sur :</p>
          <div className="bet-value">{getBetLabel()}</div>
        </div>

        <div className="reveal-grid">
          {votes.map((vote, idx) => (
            <div key={idx} className={`reveal-card ${idx < revealedCount ? 'revealed' : ''}`}>
              <span className="player-name">{vote.name}</span>
              {idx < revealedCount ? (
                <span className="finger-emoji">
                  {vote.fingers === 0 ? '✊' : vote.fingers === 1 ? '☝️' : '✌️'}
                </span>
              ) : (
                <span className="waiting-emoji">❓</span>
              )}
            </div>
          ))}
        </div>

        <div className="total-display">
          Total : <span className="count">{runningTotal}</span>
        </div>

        {isFinished && (
          <div className="final-verdict pop-in">
            {res.won ? (
              <div className="win-msg">
                <p>GAGNÉ ! 🎉</p>
                <p>{isMyTurn ? 'Tu distribues' : `${room.players[room.order[room.currentTurnIndex]].name} distribue`} {res.distribution} gorgées !</p>
              </div>
            ) : (
              <div className="lose-msg">
                <p>PERDU ! 💩</p>
                <p>{isMyTurn ? 'Tu bois' : `${room.players[room.order[room.currentTurnIndex]].name} boit`} {res.sips} gorgées !</p>
              </div>
            )}
            {isMyTurn && <button className="btn btn-secondary" onClick={onNext}>Suivant</button>}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="finger-lotto-container">
      <h2 className="game-title">Loto des Doigts</h2>
      {step === 'betting' && renderBetting()}
      {step === 'voting' && renderVoting()}
      {step === 'revealing' && renderResult()}
    </div>
  );
};

export default FingerLottoGame;
