import React, { useState, useEffect } from 'react';
import { update, ref } from 'firebase/database';
import { db } from '../../firebase';
import { generateDeck } from '../../utils/deck';
import './PurpleGame.css';

const PurpleGame = ({ room, isMyTurn, onNext, playerId }) => {
  const [currentPlayer, setCurrentPlayer] = useState(null);
  const [playersDone, setPlayersDone] = useState([]);
  const [step, setStep] = useState(0);
  const [cards, setCards] = useState([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!room.miniGameState) {
      // Initialize game state if empty
      if (isMyTurn) {
        update(ref(db, `rooms/${room.code}/miniGameState`), {
          step: 0,
          cards: [],
          currentPlayer: playerId,
          playersDone: []
        });
      }
    } else {
      setStep(room.miniGameState.step || 0);
      setCards(room.miniGameState.cards || []);
      if (room.miniGameState.message) setMessage(room.miniGameState.message);
      setCurrentPlayer(room.miniGameState.currentPlayer || room.order[room.currentTurnIndex]);
      setPlayersDone(room.miniGameState.playersDone || []);
    }
  }, [room.miniGameState, isMyTurn, room.code, playerId, room.order, room.currentTurnIndex]);

  const isCurrentPlayer = playerId === currentPlayer;

  const handleNextPlayer = async () => {
    const currentIndex = room.order.indexOf(currentPlayer);
    const nextIndex = (currentIndex + 1) % room.order.length;
    const nextPlayerId = room.order[nextIndex];
    
    // Check if we've gone full circle
    // Actually, simpler: keep track of who finished
    const newPlayersDone = [...playersDone, currentPlayer];
    
    if (newPlayersDone.length >= room.order.length) {
      // Everyone finished
      onNext();
    } else {
      // Next player
      await update(ref(db, `rooms/${room.code}/miniGameState`), {
        step: 0,
        cards: [],
        currentPlayer: nextPlayerId,
        playersDone: newPlayersDone,
        message: "",
        lastResult: null
      });
    }
  };

  const handleGuess = async (guess) => {
    if (!isCurrentPlayer) return;
    
    // Draw a random card
    const newCard = generateDeck()[Math.floor(Math.random() * 52)];
    
    let won = false;
    const lastCard = cards.length > 0 ? cards[cards.length - 1] : null;

    // Logic
    if (step === 0) { // Red/Black
      const isRed = ['♥', '♦'].includes(newCard.suit);
      won = (guess === 'red' && isRed) || (guess === 'black' && !isRed);
    } else if (step === 1) { // High/Low
      const val = getCardValue(newCard.value);
      const lastVal = getCardValue(lastCard.value);
      won = (guess === 'more' && val > lastVal) || (guess === 'less' && val < lastVal) || (val === lastVal);
    } else if (step === 2) { // Between/Outside
      const val = getCardValue(newCard.value);
      const v1 = getCardValue(cards[0].value);
      const v2 = getCardValue(cards[1].value);
      const min = Math.min(v1, v2);
      const max = Math.max(v1, v2);
      const isBetween = val > min && val < max;
      won = (guess === 'in' && isBetween) || (guess === 'out' && !isBetween);
    } else if (step === 3) { // Suit
      won = newCard.suit === guess;
    }

    const newCards = [...cards, newCard];
    const sips = won ? 0 : (step + 1); 
    
    const nextStep = step + 1;

    await update(ref(db, `rooms/${room.code}/miniGameState`), {
      step: nextStep,
      cards: newCards,
      lastResult: {
        won,
        sips,
        player: room.players[playerId].name
      }
    });
  };

  const getCardValue = (v) => {
    if (v === 'A') return 14;
    if (v === 'K') return 13;
    if (v === 'Q') return 12;
    if (v === 'J') return 11;
    if (v === '10') return 10;
    return parseInt(v);
  };

  const renderCard = (card, index) => (
    <div key={index} className={`purple-card ${['♥', '♦'].includes(card.suit) ? 'red' : 'black'}`}>
      <div className="card-corner top-left">
        <span>{card.value}</span>
        <span>{card.suit}</span>
      </div>
      <div className="card-center">{card.suit}</div>
      <div className="card-corner bottom-right">
        <span>{card.value}</span>
        <span>{card.suit}</span>
      </div>
    </div>
  );

  const renderMessage = () => {
    if (!room.miniGameState?.lastResult) return null;
    const { won, sips, player } = room.miniGameState.lastResult;
    
    if (won) {
      return <div className="message win">Gagné ! Continue.</div>;
    } else {
      return (
        <div className="message lose">
          {isCurrentPlayer ? `Perdu ! Bois ${sips} gorgées.` : `Perdu ! ${player} boit ${sips} gorgées.`}
        </div>
      );
    }
  };

  const renderQuestion = () => {
    if (step === 0) return "Rouge ou Noir ?";
    if (step === 1) return `Plus ou Moins que ${cards[0]?.value} ?`;
    if (step === 2) return `Entre ou à l'Extérieur de ${cards[0]?.value} et ${cards[1]?.value} ?`;
    if (step === 3) return "Quelle couleur (signe) ?";
    return "Tour terminé !";
  };

  return (
    <div className="purple-game-container glass-card">
      <h2 className="game-title">Purple</h2>
      
      {currentPlayer && room.players[currentPlayer] && (
        <div className="current-player-indicator">
          Tour de {room.players[currentPlayer].name}
        </div>
      )}

      <div className="cards-row">
        {cards.map((c, i) => renderCard(c, i))}
        {step < 4 && <div className="card-placeholder">?</div>}
      </div>

      <div className="message-area">{renderMessage()}</div>

      {step < 4 && (
        <div className="question-section">
          <h3>{renderQuestion()}</h3>
        </div>
      )}

      {step === 0 && isCurrentPlayer && (
        <div className="controls">
          <button className="btn btn-danger" onClick={() => handleGuess('red')}>Rouge</button>
          <button className="btn btn-dark" onClick={() => handleGuess('black')}>Noir</button>
        </div>
      )}

      {step === 1 && isCurrentPlayer && (
        <div className="controls">
          <button className="btn btn-primary" onClick={() => handleGuess('more')}>Plus (+)</button>
          <button className="btn btn-primary" onClick={() => handleGuess('less')}>Moins (-)</button>
        </div>
      )}

      {step === 2 && isCurrentPlayer && (
        <div className="controls">
          <button className="btn btn-primary" onClick={() => handleGuess('in')}>Entre</button>
          <button className="btn btn-primary" onClick={() => handleGuess('out')}>Extérieur</button>
        </div>
      )}

      {step === 3 && isCurrentPlayer && (
        <div className="controls">
          <div className="suit-buttons">
            <button className="btn btn-light" onClick={() => handleGuess('♥')}>♥</button>
            <button className="btn btn-light" onClick={() => handleGuess('♦')}>♦</button>
            <button className="btn btn-dark" onClick={() => handleGuess('♠')}>♠</button>
            <button className="btn btn-dark" onClick={() => handleGuess('♣')}>♣</button>
          </div>
        </div>
      )}

      {step === 4 && (
        <div className="finished">
          <p>Tour de {room.players[currentPlayer]?.name} terminé !</p>
          {isCurrentPlayer && (
            <button className="btn btn-secondary" onClick={handleNextPlayer}>
              {playersDone.length + 1 >= room.order.length ? "Terminer la partie" : "Joueur Suivant"}
            </button>
          )}
          {!isCurrentPlayer && (
            <div className="waiting-message">En attente de {room.players[currentPlayer]?.name}...</div>
          )}
        </div>
      )}
      
      {!isCurrentPlayer && step < 4 && (
        <div className="waiting-message">
          {room.players[currentPlayer]?.name} réfléchit...
        </div>
      )}
    </div>
  );
};

export default PurpleGame;
