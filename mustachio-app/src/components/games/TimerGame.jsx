import React, { useState, useEffect } from 'react';
import { update, ref } from 'firebase/database';
import { db } from '../../firebase';
import { soundService } from '../../services/soundService';
import './TimerGame.css';

const TimerGame = ({ room, isMyTurn, onNext, playerId }) => {
  const [timeLeft, setTimeLeft] = useState(3000);
  const [gameState, setGameState] = useState('waiting'); // waiting, running, finished

  // Identify previous player (the judge)
  const currentIndex = room.currentTurnIndex;
  const previousIndex = (currentIndex - 1 + room.order.length) % room.order.length;
  const previousPlayerId = room.order[previousIndex];
  const isJudge = playerId === previousPlayerId;

  // Sync with room state
  useEffect(() => {
    if (room.miniGameState) {
      const { status, startTime } = room.miniGameState;
      
      if (status === 'running' && startTime) {
        setGameState('running');
        const interval = setInterval(() => {
          const elapsed = Date.now() - startTime;
          const remaining = Math.max(0, 3000 - elapsed);
          setTimeLeft(remaining);
          
          if (remaining % 1000 < 50) soundService.playTick(); // Tick every second roughly

          if (remaining === 0) {
            clearInterval(interval);
            setGameState('finished');
            soundService.playLose();
          }
        }, 50);
        return () => clearInterval(interval);
      } else if (status === 'success') {
        setGameState('success');
        setTimeLeft(0);
        soundService.playWin();
      } else {
        setGameState('waiting');
        setTimeLeft(3000);
      }
    }
  }, [room.miniGameState]);

  const startTimer = async () => {
    if (!isJudge) return;
    await update(ref(db, `rooms/${room.code}/miniGameState`), {
      status: 'running',
      startTime: Date.now()
    });
  };

  const validateSuccess = async () => {
    if (!isJudge) return;
    await update(ref(db, `rooms/${room.code}/miniGameState`), {
      status: 'success'
    });
  };

  return (
    <div className="timer-game-container">
      <h2 className="game-title">Le 3-3-3</h2>
      
      <div className="timer-display">
        {(timeLeft / 1000).toFixed(2)}s
      </div>

      <div className="instructions">
        {isMyTurn && <p>Cite 3 choses sur le thème donné !</p>}
        {isJudge && <p>Donne un thème et lance le chrono !</p>}
        {!isMyTurn && !isJudge && <p>Regarde le stress monter...</p>}
      </div>

      <div className="controls">
        {isJudge && gameState === 'waiting' && (
          <button className="btn btn-primary" onClick={startTimer}>
            Lancer le Chrono
          </button>
        )}
        
        {isJudge && gameState === 'running' && (
          <button className="btn btn-success" onClick={validateSuccess}>
            Validé ! (C'est gagné)
          </button>
        )}

        {(gameState === 'finished' || gameState === 'success') && (
          <div className="result-message">
            {gameState === 'success' ? (
              <p className="success-text">Bravo ! Pas de gorgée.</p>
            ) : (
              <p className="fail-text">Raté ! Bois 3 gorgées.</p>
            )}
            {isMyTurn && (
              <button className="btn btn-secondary" onClick={onNext}>
                Suivant
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default TimerGame;
