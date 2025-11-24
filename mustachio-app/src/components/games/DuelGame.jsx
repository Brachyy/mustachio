import React, { useState, useEffect } from 'react';
import { update, ref } from 'firebase/database';
import { db } from '../../firebase';
import './DuelGame.css';

const DuelGame = ({ room, isMyTurn, onNext, playerId }) => {
  const [step, setStep] = useState('selecting'); // selecting, rolling, result
  const [opponentId, setOpponentId] = useState(null);
  const [myRoll, setMyRoll] = useState(null);
  
  useEffect(() => {
    if (room.miniGameState) {
      setStep(room.miniGameState.step || 'selecting');
      if (room.miniGameState.opponentId) setOpponentId(room.miniGameState.opponentId);
    }
  }, [room.miniGameState]);

  const handleSelectOpponent = async (oppId) => {
    if (!isMyTurn) return;
    await update(ref(db, `rooms/${room.code}/miniGameState`), {
      step: 'rolling',
      opponentId: oppId,
      rolls: {}
    });
  };

  const handleRoll = async () => {
    if (myRoll) return;
    const roll = Math.floor(Math.random() * 6) + 1;
    setMyRoll(roll);
    
    await update(ref(db, `rooms/${room.code}/miniGameState/rolls/${playerId}`), {
      value: roll,
      name: room.players[playerId].name
    });
  };

  // Check for result
  useEffect(() => {
    if (step === 'rolling' && room.miniGameState?.rolls) {
      const rolls = room.miniGameState.rolls;
      const activeId = room.order[room.currentTurnIndex];
      const oppId = room.miniGameState.opponentId;

      if (rolls[activeId] && rolls[oppId]) {
        // Both rolled
        const val1 = rolls[activeId].value;
        const val2 = rolls[oppId].value;
        
        let diff = Math.abs(val1 - val2);
        let loser = null;
        let sips = diff;

        if (val1 < val2) loser = activeId;
        else if (val2 < val1) loser = oppId;
        else {
          // Tie
          sips = val1; // Both drink value of dice
          loser = 'both';
        }

        if (isMyTurn) {
           // Only one person needs to trigger the update
           setTimeout(async () => {
             await update(ref(db, `rooms/${room.code}/miniGameState`), {
               step: 'result',
               result: { val1, val2, diff, loser, sips }
             });
           }, 1000);
        }
      }
    }
  }, [room.miniGameState, isMyTurn, step]);

  const renderSelecting = () => {
    if (!isMyTurn) return <p>Le Moustachu choisit son adversaire...</p>;

    return (
      <div className="opponent-selection">
        <h3>Choisis ton adversaire !</h3>
        <div className="opponents-grid">
          {room.order.map(pid => {
            if (pid === playerId) return null;
            const p = room.players[pid];
            return (
              <button key={pid} className="btn opponent-btn" onClick={() => handleSelectOpponent(pid)}>
                <div className="mini-avatar" style={{ backgroundColor: `hsl(${p.avatar * 18}, 70%, 50%)` }}>
                  {p.name[0]}
                </div>
                {p.name}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  const renderRolling = () => {
    const isDuelist = playerId === room.order[room.currentTurnIndex] || playerId === opponentId;
    
    if (!isDuelist) return <p>Duel en cours... Regarde les dés rouler !</p>;

    return (
      <div className="rolling-phase">
        <h3>Lance le dé !</h3>
        <div className="dice-area">
          {myRoll ? (
            <div className="dice">{myRoll}</div>
          ) : (
            <button className="btn btn-primary roll-btn" onClick={handleRoll}>
              🎲 LANCER
            </button>
          )}
        </div>
      </div>
    );
  };

  const renderResult = () => {
    const res = room.miniGameState?.result;
    if (!res) return null;

    const activeName = room.players[room.order[room.currentTurnIndex]].name;
    const oppName = room.players[opponentId].name;

    return (
      <div className="result-phase">
        <div className="duel-result">
          <div className="player-result">
            <span>{activeName}</span>
            <div className="dice">{res.val1}</div>
          </div>
          <div className="vs">VS</div>
          <div className="player-result">
            <span>{oppName}</span>
            <div className="dice">{res.val2}</div>
          </div>
        </div>

        <div className="outcome">
          {res.loser === 'both' ? (
            <p className="drink-msg">ÉGALITÉ ! Tout le monde boit {res.sips} gorgées !</p>
          ) : (
            <p className="drink-msg">
              {room.players[res.loser].name} perd et boit {res.sips} gorgées !
            </p>
          )}
        </div>

        {isMyTurn && <button className="btn btn-secondary" onClick={onNext}>Suivant</button>}
      </div>
    );
  };

  return (
    <div className="duel-game-container">
      <h2 className="game-title">Duel du Con</h2>
      {step === 'selecting' && renderSelecting()}
      {step === 'rolling' && renderRolling()}
      {step === 'result' && renderResult()}
    </div>
  );
};

export default DuelGame;
