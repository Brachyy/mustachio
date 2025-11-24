import React, { useState, useEffect } from 'react';
import { update, ref } from 'firebase/database';
import { db } from '../../firebase';
import { generateDeck } from '../../utils/deck';
import './PurpleGame.css';

const PurpleGame = ({ room, isMyTurn, onNext, playerId }) => {
  const [step, setStep] = useState(0); // 0: Color, 1: High/Low, 2: In/Out, 3: Suit, 4: Finished
  const [cards, setCards] = useState([]); // Cards drawn so far
  const [currentGuess, setCurrentGuess] = useState(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (room.miniGameState) {
      setStep(room.miniGameState.step || 0);
      setCards(room.miniGameState.cards || []);
      if (room.miniGameState.message) setMessage(room.miniGameState.message);
    }
  }, [room.miniGameState]);

  const handleGuess = async (guess) => {
    if (!isMyTurn) return;
    
    // Draw a random card for the game (separate from main deck to avoid messing up main game flow too much, 
    // or we could use the main deck but that requires more service calls. Let's simulate a mini-deck).
    const newCard = generateDeck()[Math.floor(Math.random() * 52)];
    
    let won = false;
    const lastCard = cards.length > 0 ? cards[cards.length - 1] : null;
    const firstCard = cards.length > 0 ? cards[0] : null;

    // Logic
    if (step === 0) { // Red/Black
      const isRed = ['♥', '♦'].includes(newCard.suit);
      won = (guess === 'red' && isRed) || (guess === 'black' && !isRed);
    } else if (step === 1) { // High/Low
      const val = getCardValue(newCard.value);
      const lastVal = getCardValue(lastCard.value);
      won = (guess === 'more' && val > lastVal) || (guess === 'less' && val < lastVal) || (val === lastVal); // Tie = win usually? Or drink? Let's say win.
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
          {isMyTurn ? `Perdu ! Bois ${sips} gorgées.` : `Perdu ! ${player} boit ${sips} gorgées.`}
        </div>
      );
    }
  };

  return (
    <div className="purple-game-container glass-card">
      <h2 className="game-title">Purple</h2>
      
      <div className="cards-row">
        {cards.map((c, i) => renderCard(c, i))}
        {step < 4 && <div className="card-placeholder">?</div>}
      </div>

      <div className="message-area">{renderMessage()}</div>

      {step === 0 && isMyTurn && (
        <div className="controls">
          <p>Rouge ou Noir ?</p>
          <button className="btn btn-danger" onClick={() => handleGuess('red')}>Rouge</button>
          <button className="btn btn-dark" onClick={() => handleGuess('black')}>Noir</button>
        </div>
      )}

      {step === 1 && isMyTurn && (
        <div className="controls">
          <p>Plus ou Moins que {cards[0].value} ?</p>
          <button className="btn btn-primary" onClick={() => handleGuess('more')}>Plus (+)</button>
          <button className="btn btn-primary" onClick={() => handleGuess('less')}>Moins (-)</button>
        </div>
      )}

      {step === 2 && isMyTurn && (
        <div className="controls">
          <p>Entre ou à l'Extérieur de {cards[0].value} et {cards[1].value} ?</p>
          <button className="btn btn-primary" onClick={() => handleGuess('in')}>Entre</button>
          <button className="btn btn-primary" onClick={() => handleGuess('out')}>Extérieur</button>
        </div>
      )}

      {step === 3 && isMyTurn && (
        <div className="controls">
          <p>Quelle couleur (signe) ?</p>
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
          <p>Partie terminée !</p>
          {isMyTurn && <button className="btn btn-secondary" onClick={onNext}>Suivant</button>}
        </div>
      )}
      
      {!isMyTurn && step < 4 && <p>Le Moustachu réfléchit...</p>}
    </div>
  );
};

export default PurpleGame;
