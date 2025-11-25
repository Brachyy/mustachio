import React from 'react';
import './SimpleRuleGame.css';

const SimpleRuleGame = ({ title, description, onNext, isMyTurn, room, buttonText = "J'ai compris / Suivant" }) => {
  const activePlayerName = room?.players[room?.order[room?.currentTurnIndex]]?.name;
  
  return (
    <div className="simple-game-container">
      {/* Logo Section */}
      <div className="game-logo-container">
        {/* Use specific logo if available, otherwise fallback to title */}
        <img 
          src={title === 'PMU' ? '/assets/pmu_logo.png' : 
               title === 'La Méduse' ? '/assets/medusa_logo.png' : 
               '/assets/mustachio_logo.png'} 
          alt={`${title} Logo`} 
          className="game-logo-img bounce-in"
          onError={(e) => {
            e.target.onerror = null; 
            e.target.style.display = 'none';
          }}
        />
      </div>
      
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
