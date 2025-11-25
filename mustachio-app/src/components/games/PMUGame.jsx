import React, { useState, useEffect } from 'react';
import { update, ref, set } from 'firebase/database';
import { db } from '../../firebase';
import { generateDeck } from '../../utils/deck';
import { soundService } from '../../services/soundService';
import './PMUGame.css';

const SUITS = ['♥', '♦', '♠', '♣'];
const TRACK_LENGTH = 6;
const MILESTONES = [1, 2, 3, 4, 5]; // One penalty card per milestone

const PMUGame = ({ room, isMyTurn, onNext, playerId }) => {
  const [step, setStep] = useState('betting');
  const [positions, setPositions] = useState({ '♥': 0, '♦': 0, '♠': 0, '♣': 0 });
  const [drawnCards, setDrawnCards] = useState([]);
  const [myBet, setMyBet] = useState(null);
  const [betStep, setBetStep] = useState('suit'); // 'suit' or 'sips'
  const [selectedSuit, setSelectedSuit] = useState(null);
  const [winner, setWinner] = useState(null);
  const [penaltyCards, setPenaltyCards] = useState({});
  const [revealedMilestones, setRevealedMilestones] = useState([]);
  const [activePenaltyCard, setActivePenaltyCard] = useState(null);

  useEffect(() => {
    if (room.miniGameState) {
      setStep(room.miniGameState.step || 'betting');
      if (room.miniGameState.positions) setPositions(room.miniGameState.positions);
      if (room.miniGameState.drawnCards) setDrawnCards(room.miniGameState.drawnCards);
      if (room.miniGameState.penaltyCards) setPenaltyCards(room.miniGameState.penaltyCards);
      if (room.miniGameState.revealedMilestones) setRevealedMilestones(room.miniGameState.revealedMilestones);
      if (room.miniGameState.activePenaltyCard !== undefined) setActivePenaltyCard(room.miniGameState.activePenaltyCard);
      if (room.miniGameState.winner) {
        if (!winner) soundService.playWin();
        setWinner(room.miniGameState.winner);
      }
    }
  }, [room.miniGameState]);

  // Auto-start race when all bets are in
  useEffect(() => {
    if (step === 'betting' && isMyTurn) {
      const bets = room.miniGameState?.bets || {};
      const betCount = Object.keys(bets).length;
      const totalPlayers = Object.keys(room.players).length;
      
      if (betCount >= totalPlayers) {
        setTimeout(() => startRace(), 1000);
      }
    }
  }, [room.miniGameState, step, isMyTurn]);

  // Auto-draw cards during race
  useEffect(() => {
    if (step === 'racing' && isMyTurn && !winner) {
      if (activePenaltyCard) {
        // Pause for penalty animation then clear it
        const timer = setTimeout(async () => {
          await update(ref(db, `rooms/${room.code}/miniGameState`), {
            activePenaltyCard: null
          });
        }, 4000); // Show penalty for 4 seconds
        return () => clearTimeout(timer);
      } else {
        // Normal draw loop - slower speed
        const timer = setTimeout(() => {
          drawRaceCard();
        }, 2500); // Slower draw speed
        return () => clearTimeout(timer);
      }
    }
  }, [step, drawnCards.length, winner, isMyTurn, activePenaltyCard]);

  const handleSuitSelect = (suit) => {
    if (step !== 'betting' || betStep !== 'suit') return;
    soundService.playClick();
    setSelectedSuit(suit);
    setBetStep('sips');
  };

  const handleSipsSelect = async (sips) => {
    if (step !== 'betting' || betStep !== 'sips' || !selectedSuit) return;
    soundService.playClick();
    setMyBet({ suit: selectedSuit, sips });
    await update(ref(db, `rooms/${room.code}/miniGameState/bets/${playerId}`), {
      suit: selectedSuit,
      sips,
      name: room.players[playerId].name
    });
  };

  const startRace = async () => {
    if (!isMyTurn) return;
    soundService.playClick();
    
    // Generate penalty cards for milestones
    const deck = generateDeck();
    const penalties = {};
    MILESTONES.forEach(milestone => {
      penalties[milestone] = deck[Math.floor(Math.random() * deck.length)];
    });

    await update(ref(db, `rooms/${room.code}/miniGameState`), {
      step: 'racing',
      positions: { '♥': 0, '♦': 0, '♠': 0, '♣': 0 },
      drawnCards: [],
      winner: null,
      penaltyCards: penalties,
      revealedMilestones: [],
      activePenaltyCard: null
    });
  };

  const drawRaceCard = async () => {
    if (!isMyTurn || winner) return;

    soundService.playDraw();
    const newCard = generateDeck()[Math.floor(Math.random() * 52)];
    const suit = newCard.suit;
    
    const newPositions = { ...positions };
    newPositions[suit] += 1;
    const newDrawnCards = [...drawnCards, newCard];
    
    // Check for milestone reveals
    const newRevealedMilestones = [...revealedMilestones];
    let penaltyTriggered = null;

    MILESTONES.forEach(milestone => {
      if (!newRevealedMilestones.includes(milestone)) {
        const allPassed = Object.values(newPositions).every(pos => pos >= milestone);
        if (allPassed) {
          newRevealedMilestones.push(milestone);
          // Penalty Logic: Move horse back
          const penaltyCard = penaltyCards[milestone];
          newPositions[penaltyCard.suit] = Math.max(0, newPositions[penaltyCard.suit] - 1);
          penaltyTriggered = penaltyCard;
          soundService.playClick(); // Or a specific penalty sound
        }
      }
    });

    let newWinner = null;
    // Check winner (only if no penalty triggered this turn, or check after penalty?)
    // Usually penalty applies immediately.
    if (newPositions[suit] >= TRACK_LENGTH) {
      newWinner = suit;
      soundService.playWin();
    }

    const updates = {
      positions: newPositions,
      drawnCards: newDrawnCards,
      revealedMilestones: newRevealedMilestones
    };

    if (penaltyTriggered) {
      updates.activePenaltyCard = penaltyTriggered;
    }

    if (newWinner) {
      updates.winner = newWinner;
      updates.step = 'finished';
    }

    await update(ref(db, `rooms/${room.code}/miniGameState`), updates);
  };

  const getSuitColor = (suit) => {
    return ['♥', '♦'].includes(suit) ? '#e74c3c' : '#2c3e50';
  };

  const renderTrack = () => {
    return (
      <div className="pmu-track">
        {SUITS.map(suit => (
          <div key={suit} className="track-lane">
            <div className="lane-header" style={{ color: getSuitColor(suit) }}>
              {suit}
            </div>
            <div className="lane-steps">
              {[...Array(TRACK_LENGTH + 1)].map((_, i) => {
                const isMilestone = MILESTONES.includes(i);
                const isRevealed = revealedMilestones.includes(i);
                
                return (
                  <div 
                    key={i} 
                    className={`track-step ${i === positions[suit] ? 'active' : ''} ${isMilestone ? 'milestone' : ''}`}
                  >
                    {i === positions[suit] && <span className="horse">🐎</span>}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderBetting = () => {
    const bets = room.miniGameState?.bets || {};
    const betCount = Object.keys(bets).length;
    const totalPlayers = Object.keys(room.players).length;

    return (
      <div className="betting-phase">
        <h3>Faites vos jeux !</h3>
        {!myBet ? (
          <>
            {betStep === 'suit' ? (
              <div className="suit-selection">
                <p>Choisis une couleur :</p>
                <div className="suit-buttons">
                  {SUITS.map(suit => (
                    <button
                      key={suit}
                      className="btn suit-btn-large"
                      style={{ color: getSuitColor(suit) }}
                      onClick={() => handleSuitSelect(suit)}
                    >
                      {suit}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="sips-selection">
                <p>Tu as choisi <strong style={{ color: getSuitColor(selectedSuit) }}>{selectedSuit}</strong></p>
                <p>Mise combien de gorgées ?</p>
                <div className="sips-buttons">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(sips => (
                    <button
                      key={sips}
                      className="btn sip-btn"
                      onClick={() => handleSipsSelect(sips)}
                    >
                      {sips}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="bet-confirmed">
            <p>Tu as parié <strong style={{ color: getSuitColor(myBet.suit) }}>{myBet.suit}</strong> - <strong>{myBet.sips} gorgées</strong></p>
          </div>
        )}
        
        <div className="bets-status">
          <p>{betCount}/{totalPlayers} paris enregistrés</p>
          {betCount >= totalPlayers && (
            <p className="auto-start-msg">🏁 La course démarre...</p>
          )}
        </div>
      </div>
    );
  };

  const renderRacing = () => {
    const lastCard = drawnCards.length > 0 ? drawnCards[drawnCards.length - 1] : null;

    return (
      <div className="racing-phase">
        {activePenaltyCard && (
          <div className="penalty-overlay">
            <div className="penalty-card-large animated-penalty" style={{ color: getSuitColor(activePenaltyCard.suit) }}>
              <div className="penalty-title">MALUS !</div>
              <div className="penalty-content">
                <span className="card-value">{activePenaltyCard.value}</span>
                <span className="card-suit">{activePenaltyCard.suit}</span>
              </div>
              <div className="penalty-desc">Le cheval {activePenaltyCard.suit} recule !</div>
            </div>
          </div>
        )}
        <div className="race-card-display">
          {lastCard ? (
            <div className="drawn-card" style={{ color: getSuitColor(lastCard.suit) }}>
              <span className="card-value">{lastCard.value}</span>
              <span className="card-suit">{lastCard.suit}</span>
            </div>
          ) : (
            <div className="card-placeholder">?</div>
          )}
        </div>
        
        {revealedMilestones.length > 0 && (
          <div className="revealed-penalties">
            <h4>Cartes Malus révélées :</h4>
            <div className="penalty-cards-display">
              {revealedMilestones.map(milestone => (
                <div key={milestone} className="penalty-card-large" style={{ color: getSuitColor(penaltyCards[milestone].suit) }}>
                  <div className="penalty-label">Palier {milestone}</div>
                  <div className="penalty-value">{penaltyCards[milestone].value} {penaltyCards[milestone].suit}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderFinished = () => {
    const bets = room.miniGameState?.bets || {};
    const myBetData = bets[playerId];
    const didWin = myBetData?.suit === winner;

    return (
      <div className="finished-phase">
        <h3 style={{ color: getSuitColor(winner) }}>Le cheval {winner} a gagné ! 🏆</h3>
        {didWin ? (
          <p className="win-msg">Tu as gagné ! Distribue {myBetData.sips} gorgées !</p>
        ) : (
          <p className="lose-msg">Tu as perdu... Bois {myBetData.sips} gorgées.</p>
        )}
        
        {isMyTurn ? (
          <button className="btn btn-secondary" onClick={onNext}>Terminer</button>
        ) : (
          <div className="waiting-message">
            En attente de {room.players[room.currentTurn]?.name}...
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="pmu-game-container glass-card">
      <h2 className="game-title">PMU</h2>
      {renderTrack()}
      
      <div className="game-area">
        {step === 'betting' && renderBetting()}
        {step === 'racing' && renderRacing()}
        {step === 'finished' && renderFinished()}
      </div>
    </div>
  );
};

export default PMUGame;
