import React, { useState, useEffect } from 'react';
import { update, ref } from 'firebase/database';
import { db } from '../../firebase';
import { soundService } from '../../services/soundService';
import './NoteGame.css';

const NoteGame = ({ room, isMyTurn, onNext, playerId }) => {
  const [step, setStep] = useState('voting'); // voting, revealing, guessing, finished
  const [myVote, setMyVote] = useState(null);
  const [winningNote, setWinningNote] = useState(null);
  const [timeLeft, setTimeLeft] = useState(8);

  useEffect(() => {
    if (room.miniGameState) {
      setStep(room.miniGameState.step || 'voting');
      if (room.miniGameState.winningNote) {
        setWinningNote(room.miniGameState.winningNote);
      }
    }
  }, [room.miniGameState]);

  // Timer for voting phase
  useEffect(() => {
    let timer;
    if (step === 'voting' && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (step === 'voting' && timeLeft === 0 && isMyTurn) {
      // Only the active player (who is blind) triggers the end of voting? 
      // Actually, anyone can trigger it, but let's stick to one person to avoid race conditions.
      // Or better: The host? No, let's use the active player since they are the "master" of this turn, 
      // even if they are blind. They just send the command automatically.
      handleFinishVoting();
    }
    return () => clearInterval(timer);
  }, [step, timeLeft, isMyTurn]);

  // Sound cue when entering guessing phase
  useEffect(() => {
    if (step === 'guessing' && isMyTurn) {
      soundService.playWin(); // Use a distinct sound if available, or Win for "Ding!"
    }
  }, [step, isMyTurn]);

  const handleVote = async (note) => {
    if (isMyTurn) return; // Guesser can't vote
    setMyVote(note);
    soundService.playClick();
    await update(ref(db, `rooms/${room.code}/miniGameState/votes/${playerId}`), {
      note,
      name: room.players[playerId].name
    });
  };

  const handleFinishVoting = async () => {
    // Calculate most voted note
    const votes = room.miniGameState?.votes || {};
    const counts = {};
    Object.values(votes).forEach(v => {
      counts[v.note] = (counts[v.note] || 0) + 1;
    });
    
    let maxVotes = 0;
    let winner = null;
    Object.entries(counts).forEach(([note, count]) => {
      if (count > maxVotes) {
        maxVotes = count;
        winner = note;
      }
    });

    // If no votes, random note
    if (!winner) {
      winner = Math.floor(Math.random() * 10) + 1;
    }

    await update(ref(db, `rooms/${room.code}/miniGameState`), {
      step: 'revealing',
      winningNote: winner
    });

    // Auto-transition to guessing after 2s (showing the note to voters)
    setTimeout(async () => {
      await update(ref(db, `rooms/${room.code}/miniGameState`), {
        step: 'guessing'
      });
    }, 2000);
  };

  const handleGuess = async (guess) => {
    const correct = parseInt(guess) === parseInt(winningNote);
    if (correct) soundService.playWin();
    else soundService.playLose();

    await update(ref(db, `rooms/${room.code}/miniGameState`), {
      step: 'finished',
      result: { correct, guess }
    });
  };

  return (
    <div className="note-game-container glass-card">
      <h2 className="game-title">Jeu de la Note</h2>

      {step === 'voting' && (
        <div className="voting-phase">
          {isMyTurn ? (
            <div className="blind-overlay">
              <div className="blind-content">
                <span className="blind-icon">🙈</span>
                <h3>FERME LES YEUX !</h3>
                <p>Les autres choisissent une note...</p>
                <div className="timer-display">{timeLeft}s</div>
              </div>
            </div>
          ) : (
            <div className="voter-controls">
              <p className="instruction">Vote pour la note secrète (1-10) :</p>
              <div className="timer-bar" style={{ width: `${(timeLeft/8)*100}%` }}></div>
              <div className="note-grid">
                {[1,2,3,4,5,6,7,8,9,10].map(n => (
                  <button 
                    key={n} 
                    className={`btn note-btn ${myVote === n ? 'selected' : ''}`}
                    onClick={() => handleVote(n)}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {step === 'revealing' && (
        <div className="reveal-phase">
          {isMyTurn ? (
             <div className="blind-overlay">
               <div className="blind-content">
                 <span className="blind-icon">🤫</span>
                 <h3>Garde les yeux fermés...</h3>
               </div>
             </div>
          ) : (
            <>
              <p>La note choisie est...</p>
              <div className="big-note">{winningNote}</div>
            </>
          )}
        </div>
      )}

      {step === 'guessing' && (
        <div className="guessing-phase">
          {isMyTurn ? (
            <div className="guesser-controls">
              <p className="instruction">👀 OUVRE LES YEUX !</p>
              <p>Quelle est la note choisie par le groupe ?</p>
              <div className="note-grid">
                {[1,2,3,4,5,6,7,8,9,10].map(n => (
                  <button key={n} className="btn note-btn" onClick={() => handleGuess(n)}>
                    {n}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="waiting-message">
              <p>Le Moustachu tente de deviner...</p>
              <div className="spinner"></div>
            </div>
          )}
        </div>
      )}

      {step === 'finished' && (
        <div className="result-phase">
          {room.miniGameState.result.correct ? (
            <div className="result-box win">
              <h3>GAGNÉ ! 🎉</h3>
              <p>C'était bien {winningNote} !</p>
              <p>{isMyTurn ? 'Tu distribues' : `${room.players[room.order[room.currentTurnIndex]].name} distribue`} <strong>4 gorgées</strong>.</p>
            </div>
          ) : (
            <div className="result-box lose">
              <h3>PERDU ! 💩</h3>
              <p>La note était <strong>{winningNote}</strong>.</p>
              <p>{isMyTurn ? 'Tu bois' : `${room.players[room.order[room.currentTurnIndex]].name} boit`} <strong>2 gorgées</strong>.</p>
            </div>
          )}
          {isMyTurn && (
            <button className="btn btn-primary next-btn" onClick={onNext}>
              Suivant
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default NoteGame;
