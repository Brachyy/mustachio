import React, { useState, useEffect } from 'react';
import { update, ref } from 'firebase/database';
import { db } from '../../firebase';
import { soundService } from '../../services/soundService';
import './TimerGame.css';

const TimerGame = ({ room, isMyTurn, onNext, playerId }) => {
  const [timeLeft, setTimeLeft] = useState(3000);
  const [gameState, setGameState] = useState('waiting'); // waiting, running, finished

  // Identify previous player (the judge who gives theme)
  const currentIndex = room.currentTurnIndex;
  const previousIndex = (currentIndex - 1 + room.order.length) % room.order.length;
  const previousPlayerId = room.order[previousIndex];
  const previousPlayerName = room.players[previousPlayerId]?.name || 'Joueur précédent';
  const currentPlayerName = room.players[room.order[currentIndex]]?.name || 'Joueur actuel';
  const isJudge = playerId === previousPlayerId;
  const isGuesser = isMyTurn;
  
  // Calculate progress percentage (0-100)
  const progress = (timeLeft / 3000) * 100;

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
      
      {/* Role Instructions */}
      <div className="role-info">
        {isJudge ? (
          <p className="role-instruction judge">🎯 <strong>Tu donnes le thème</strong> et tu lances le chrono</p>
        ) : isGuesser ? (
          <p className="role-instruction guesser">⏱️ <strong>{previousPlayerName}</strong> te donne le thème. Tu dois citer 3 choses !</p>
        ) : (
          <p className="role-instruction spectator">👀 <strong>{previousPlayerName}</strong> donne le thème à <strong>{currentPlayerName}</strong></p>
        )}
      </div>

      {/* Circular Timer */}
      <div className="circular-timer">
        <svg className="timer-svg" viewBox="0 0 200 200">
          {/* Background circle */}
          <circle
            cx="100"
            cy="100"
            r="90"
            fill="none"
            stroke="rgba(255,255,255,0.1)"
            strokeWidth="10"
          />
          {/* Progress circle */}
          <circle
            cx="100"
            cy="100"
            r="90"
            fill="none"
            stroke={progress > 33 ? "#f1c40f" : "#e74c3c"}
            strokeWidth="10"
            strokeDasharray={`${2 * Math.PI * 90}`}
            strokeDashoffset={`${2 * Math.PI * 90 * (1 - progress / 100)}`}
            strokeLinecap="round"
            transform="rotate(-90 100 100)"
            className="progress-ring"
          />
        </svg>
        <div className="timer-text">
          {(timeLeft / 1000).toFixed(2)}
        </div>
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
