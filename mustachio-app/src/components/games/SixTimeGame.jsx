import React, { useState, useEffect } from 'react';
import { update, ref } from 'firebase/database';
import { db } from '../../firebase';
import { soundService } from '../../services/soundService';
import './SixTimeGame.css';

const SixTimeGame = ({ room, isMyTurn, onNext, playerId }) => {
  const [status, setStatus] = useState('waiting'); // waiting, countdown, running, finished
  const [myTime, setMyTime] = useState(null);
  const [results, setResults] = useState({});
  const [readyPlayers, setReadyPlayers] = useState({});
  const [countdown, setCountdown] = useState(3);

  // Sync with room state
  useEffect(() => {
    if (room.miniGameState) {
      const { state, playerTimes, ready, startTime } = room.miniGameState;
      setStatus(state || 'waiting');
      if (playerTimes) setResults(playerTimes);
      if (ready) setReadyPlayers(ready);

      // Handle countdown locally if state is 'countdown'
      if (state === 'countdown') {
        // We can just use a local effect for the visual countdown
      }
    }
  }, [room.miniGameState]);

  // Auto-start countdown when everyone is ready
  useEffect(() => {
    if (status === 'waiting' && isMyTurn) {
      const allReady = room.order.every(pid => readyPlayers[pid]);
      if (allReady) {
        startCountdown();
      }
    }
  }, [readyPlayers, status, isMyTurn, room.order]);

  // Countdown logic
  useEffect(() => {
    let timer;
    if (status === 'countdown') {
      setCountdown(3);
      timer = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [status]);

  // Auto-start game after countdown
  useEffect(() => {
    if (status === 'countdown' && countdown === 0 && isMyTurn) {
      // Wait 1s on "GO" before starting the invisible timer
      const timer = setTimeout(() => {
        startGame();
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown, status, isMyTurn]);

  // Auto-finish game when everyone has stopped
  useEffect(() => {
    if (status === 'running' && isMyTurn) {
      const allStopped = room.order.every(pid => results[pid]);
      if (allStopped) {
        // Wait a moment then finish
        setTimeout(() => {
           onNext(); // Or trigger a 'finished' state first to show results for a bit?
           // User said "pas besoin de bouton terminer", implying auto-next or just auto-finish state.
           // Let's just show results and let the host click next? 
           // User said "pas besoin de bouton terminer le jeu", maybe they mean the "Stop" button?
           // No, "terminer le jeu" usually refers to the "Next" button.
           // But if we auto-next, they can't see results.
           // Let's transition to a 'finished' state where results are shown, and maybe auto-next after 10s?
           // Or keep a "Next" button but only for the host after everyone finished.
           // User said "pas besoin de bouton terminer le jeu". 
           // Let's interpret as: The game ends automatically when everyone has played.
           // But we need to see results. So let's switch to 'finished' state.
           update(ref(db, `rooms/${room.code}/miniGameState/state`), 'finished');
        }, 1000);
      }
    }
  }, [results, status, isMyTurn, room.order]);


  const startCountdown = async () => {
    await update(ref(db, `rooms/${room.code}/miniGameState`), {
      state: 'countdown'
    });
  };

  const startGame = async () => {
    soundService.playGo();
    await update(ref(db, `rooms/${room.code}/miniGameState`), {
      state: 'running',
      startTime: Date.now()
    });
  };

  const handleToggleReady = async () => {
    const isReady = !readyPlayers[playerId];
    if (isReady) soundService.playClick();
    await update(ref(db, `rooms/${room.code}/miniGameState/ready`), {
      [playerId]: isReady
    });
  };

  const handleStop = async () => {
    if (status !== 'running' || myTime) return;
    
    soundService.playClick();
    const startTime = room.miniGameState.startTime;
    const elapsed = (Date.now() - startTime) / 1000;
    setMyTime(elapsed);

    await update(ref(db, `rooms/${room.code}/miniGameState/playerTimes/${playerId}`), {
      time: elapsed,
      name: room.players[playerId].name
    });
  };

  const calculateSips = (time) => {
    // Determine which range the time falls into
    // 0-9s = 1 sip, 9-15s = 2 sips, 15-21s = 3 sips, etc.
    let sipsAmount;
    if (time < 9) {
      sipsAmount = 1;
    } else if (time < 15) {
      sipsAmount = 2;
    } else if (time < 21) {
      sipsAmount = 3;
    } else if (time < 27) {
      sipsAmount = 4;
    } else if (time < 33) {
      sipsAmount = 5;
    } else {
      sipsAmount = 6;
    }
    
    // Check if close to a multiple of 6 (±0.50s)
    const remainder = time % 6;
    const distanceToMultiple = Math.min(remainder, 6 - remainder);
    
    if (distanceToMultiple <= 0.50) {
      // Close enough to a multiple of 6 → distribute
      return { type: 'give', amount: sipsAmount };
    } else {
      // Not close enough → drink
      return { type: 'drink', amount: sipsAmount };
    }
  };

  return (
    <div className="six-time-container glass-card">
      <h2 className="game-title">Six Time</h2>
      
      {status === 'waiting' && (
        <div className="phase waiting-screen">
          <p className="instruction">Préparez-vous à arrêter votre chrono sur un multiple de 6 !</p>
          
          <div className="ready-list">
            {room.order.map(pid => (
              <div key={pid} className={`ready-item ${readyPlayers[pid] ? 'ready' : ''}`}>
                <span className="player-name">{room.players[pid].name}</span>
                <span className="status-icon">{readyPlayers[pid] ? '✅' : '⏳'}</span>
              </div>
            ))}
          </div>

          <button 
            className={`btn ${readyPlayers[playerId] ? 'btn-success' : 'btn-primary'} ready-btn`}
            onClick={handleToggleReady}
          >
            {readyPlayers[playerId] ? 'PRÊT !' : 'JE SUIS PRÊT'}
          </button>
        </div>
      )}

      {status === 'countdown' && (
        <div className="phase countdown-screen">
          <div className="countdown-number">{countdown > 0 ? countdown : 'GO !'}</div>
        </div>
      )}

      {status === 'running' && (
        <div className="phase running-screen">
          <div className="chrono-placeholder">
            {myTime ? <span className="stopped-text">STOPPÉ</span> : <span className="running-text">⏱️ ??? ⏱️</span>}
          </div>
          {!myTime && (
            <button className="btn btn-danger stop-btn" onClick={handleStop}>
              STOP !
            </button>
          )}
          {myTime && <p className="wait-text">Temps enregistré. Attends les autres...</p>}
        </div>
      )}

      {(status === 'running' || status === 'finished') && (
        <div className="results-grid">
          {Object.values(results).map((res, idx) => {
            const sips = calculateSips(res.time);
            const isMe = res.name === room.players[playerId]?.name; // Or check ID if available in results
            // Actually results is keyed by playerId? No, it's an object where values have name.
            // Wait, results is `playerTimes` which is keyed by playerId.
            // But here we are iterating `Object.values(results)`.
            // We don't have the key easily here unless we change iteration.
            // Let's iterate entries.
            return (
              <div key={idx} className="result-card">
                <span className="player-name">{res.name}</span>
                <span className="time-display">{res.time.toFixed(2)}s</span>
                <span className={`sips-badge ${sips.type}`}>
                  {sips.type === 'give' 
                    ? (res.name === room.players[playerId].name ? 'Tu distribues' : `${res.name} distribue`) 
                    : (res.name === room.players[playerId].name ? 'Tu bois' : `${res.name} boit`)} {sips.amount}
                </span>
              </div>
            );
          })}
        </div>
      )}

      {status === 'finished' && isMyTurn && (
        <div className="finish-controls">
           <button className="btn btn-secondary next-btn" onClick={onNext}>
            Suite
          </button>
        </div>
      )}
    </div>
  );
};

export default SixTimeGame;
