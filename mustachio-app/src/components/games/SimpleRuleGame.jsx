import React from 'react';
import './SimpleRuleGame.css';

const SimpleRuleGame = ({ title, description, onNext, isMyTurn, room, buttonText = "J'ai compris / Suivant" }) => {
  const activePlayerName = room?.players[room?.order[room?.currentTurnIndex]]?.name;
  
  return (
    <div className="simple-game-container">
      <h2 className="game-title">{title}</h2>
      <div className="rule-card">
        <p className="rule-text">{description}</p>
      </div>
      {isMyTurn ? (
        <button className="btn btn-primary next-btn" onClick={onNext}>
          {buttonText}
        </button>
      ) : (
        <p className="waiting-message">En attente de {activePlayerName}...</p>
      )}
    </div>
  );
};

export default SimpleRuleGame;
