import React from 'react';
import './SimpleRuleGame.css';

const SimpleRuleGame = ({ title, description, onNext, isMyTurn, room, buttonText = "J'ai compris / Suivant" }) => {
  const activePlayerName = room?.players[room?.order[room?.currentTurnIndex]]?.name;
  
  return (
    <div className="simple-game-container">
      {/* Logo Section */}
      <div className="game-logo-container">
        {(() => {
          const getLogoPath = (gameTitle) => {
            const logos = {
              'Roi du cercle': '/assets/roi-du-cercle.logo.png',
              'Duel du Con': '/assets/duel_du_con_logo.png',
              'Le 3-3-3': '/assets/3-3-3_logo.png',
              'Trinquette': '/assets/trinquette_logo.png',
              'Purple': '/assets/purple_logo.png',
              'Six Time': '/assets/6-time_logo.png',
              'Le Loto des Doigts': '/assets/loto-doigt_logo.png',
              'La Méduse': '/assets/medusa_logo.png',
              'Mini-bac': '/assets/mini-bac_logo.png',
              'Le jeu de la Note': '/assets/note_logo.png',
              'PMU': '/assets/pmu_logo.png',
              'Cupidon': '/assets/cupidon_logo.png',
              'Mustachio': '/assets/avatar.png' // Fallback to avatar if Mustachio logo missing
            };
            return logos[gameTitle] || null;
          };

          const logoPath = getLogoPath(title);
          
          if (!logoPath) return null;

          return (
            <img 
              src={logoPath} 
              alt={`${title} Logo`} 
              className="game-logo-img bounce-in"
              onError={(e) => {
                e.target.onerror = null; 
                e.target.style.display = 'none';
              }}
            />
          );
        })()}
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
