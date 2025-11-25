import React, { useState, useEffect } from 'react';
import { update, ref } from 'firebase/database';
import { db } from '../../firebase';
import { soundService } from '../../services/soundService';
import { endTurn } from '../../services/roomService';
import Dice3D from '../Dice3D';
import './TrinquetteGame.css';

const TrinquetteGame = ({ room, isMyTurn, onNext, playerId }) => {
  const [step, setStep] = useState('rolling'); // rolling, announcing, deciding, result
  const [currentRoller, setCurrentRoller] = useState(room.order[room.currentTurnIndex]);
  const [dice, setDice] = useState({ d1: 1, d2: 1 }); // Default dice
  const [isRolling, setIsRolling] = useState(false);
  const [announcedScore, setAnnouncedScore] = useState(null);
  const [countdown, setCountdown] = useState(3);

  useEffect(() => {
    if (room.miniGameState) {
      setStep(room.miniGameState.step || 'rolling');
      setCurrentRoller(room.miniGameState.currentRoller || room.order[room.currentTurnIndex]);
      
      if (room.miniGameState.dice) {
        setDice(room.miniGameState.dice);
      } else {
        // Reset dice when null (after OK click)
        setDice({ d1: 1, d2: 1 });
      }
      
      if (room.miniGameState.announcedScore) setAnnouncedScore(room.miniGameState.announcedScore);
    }
  }, [room.miniGameState]);

  // Countdown timer in result phase
  useEffect(() => {
    if (step === 'result' && room.miniGameState?.decision === 'liar') {
      setCountdown(3);
      const timer = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [step, room.miniGameState]);

  const isRoller = playerId === currentRoller;
  const rollerIndex = room.order.indexOf(currentRoller);
  const nextPlayerId = room.order[(rollerIndex + 1) % room.order.length];
  const isDecider = playerId === nextPlayerId;

  const handleRoll = async () => {
    if (!isRoller) return;
    
    // Local animation first
    setIsRolling(true);
    soundService.playClick(); // Dice shake sound ideally
    
    // Wait for animation
    setTimeout(async () => {
      const d1 = Math.floor(Math.random() * 6) + 1;
      const d2 = Math.floor(Math.random() * 6) + 1;
      
      setIsRolling(false);
      
      await update(ref(db, `rooms/${room.code}/miniGameState`), {
        step: 'announcing',
        dice: { d1, d2 },
        currentRoller: currentRoller
      });
    }, 2000); // 2 seconds roll
  };

  const handleAnnounce = async () => {
    // Oral announcement, just move to deciding
    await update(ref(db, `rooms/${room.code}/miniGameState`), {
      step: 'deciding'
    });
  };

  const handleDecision = async (decision) => {
    if (decision === 'liar') {
      // Only reveal dice when calling liar
      await update(ref(db, `rooms/${room.code}/miniGameState`), {
        step: 'result',
        decision: 'liar',
        deciderId: playerId // Track who called liar
      });
    } else {
      // OK: continue to next player without revealing
      soundService.playClick();
      await update(ref(db, `rooms/${room.code}/miniGameState`), {
        step: 'rolling',
        currentRoller: nextPlayerId,
        dice: null,
        announcedScore: null
      });
    }
  };

  const formatScore = (d1, d2) => {
    if (!d1) return "";
    const v1 = Math.max(d1, d2);
    const v2 = Math.min(d1, d2);
    const val = parseInt(`${v1}${v2}`);
    
    if (val === 21) return "Trinquette (21)";
    if (v1 === v2) return `Double ${v1}`;
    return `${val}`;
  };

  const handleFinish = async () => {
    try {
      await endTurn(room.code);
    } catch (error) {
      console.error("Error finishing turn:", error);
    }
  };

  return (
    <div className="trinquette-container glass-card">
      <h2 className="game-title">Trinquette</h2>
      
      <div className="dice-area">
        <Dice3D 
          value={dice.d1} 
          rolling={isRolling || (step === 'rolling' && isRoller && isRolling)} 
          hidden={!isRoller && !(step === 'result' && room.miniGameState?.decision === 'liar')}
        />
        <Dice3D 
          value={dice.d2} 
          rolling={isRolling || (step === 'rolling' && isRoller && isRolling)} 
          hidden={!isRoller && !(step === 'result' && room.miniGameState?.decision === 'liar')}
        />
      </div>

      {step === 'rolling' && (
        <div className="phase">
          {isRoller ? (
            <button className="btn btn-primary" onClick={handleRoll} disabled={isRolling}>
              {isRolling ? 'Ça tourne...' : 'Lancer les dés'}
            </button>
          ) : (
            <p>{room.players[currentRoller].name} va lancer...</p>
          )}
        </div>
      )}

      {step === 'announcing' && (
        <div className="phase">
          {isRoller ? (
            <div className="announce-controls">
              <p className="secret-info">Tu as fait : <strong>{formatScore(dice.d1, dice.d2)}</strong></p>
              <p>Annonce ton score à l'oral !</p>
              <button className="btn btn-primary" onClick={handleAnnounce}>C'est annoncé</button>
            </div>
          ) : (
            <div className="waiting-message">
              <p>{room.players[currentRoller].name} regarde ses dés...</p>
              <p className="instruction">Écoutez son annonce !</p>
            </div>
          )}
        </div>
      )}

      {step === 'deciding' && (
        <div className="phase">
          <p className="instruction">Annonce faite à l'oral.</p>
          {isDecider ? (
            <div className="decision-controls">
              <button className="btn btn-success" onClick={() => handleDecision('ok')}>OK (Tu lances)</button>
              <button className="btn btn-danger" onClick={() => handleDecision('liar')}>MENTEUR !</button>
            </div>
          ) : (
            <p>{room.players[nextPlayerId].name} réfléchit...</p>
          )}
        </div>
      )}

      {step === 'result' && (
        <div className="phase result-phase">
          <h3>Révélation !</h3>
          <p>Vrai score : <strong>{formatScore(dice.d1, dice.d2)}</strong></p>
          
          {room.miniGameState.decision === 'liar' ? (
            <>
              <p>Résultat du Menteur...</p>
              {countdown > 0 ? (
                <div className="countdown-timer">{countdown}</div>
              ) : (
                room.miniGameState.deciderId === playerId && (
                  <button className="btn btn-secondary" onClick={handleFinish}>Terminer</button>
                )
              )}
            </>
          ) : (
            <>
              <p>Le jeu continue...</p>
              {isMyTurn && <button className="btn btn-secondary" onClick={onNext}>Terminer</button>}
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default TrinquetteGame;
