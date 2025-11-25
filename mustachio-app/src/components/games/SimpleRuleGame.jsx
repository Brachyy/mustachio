import React, { useState, useEffect } from 'react';
import './SimpleRuleGame.css';

const SimpleRuleGame = ({ title, description, onNext, isMyTurn, room, buttonText = "J'ai compris / Suivant" }) => {
  const [showIntro, setShowIntro] = useState(true);
  const activePlayerName = room?.players[room?.order[room?.currentTurnIndex]]?.name;

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowIntro(false);
    }, 2500); // Show logo for 2.5 seconds
    return () => clearTimeout(timer);
  }, []);
  
  // Helper to get logo path
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
      'Mustachio': '/assets/avatar.png'
    };
    return logos[gameTitle] || null;
  };

  const logoPath = getLogoPath(title);

  if (showIntro) {
    return (
      <div className="simple-game-container intro-phase">
        <div className="game-logo-container">
          {logoPath && (
            <img 
              src={logoPath} 
              alt={`${title} Logo`} 
              className="game-logo-img bounce-in"
              onError={(e) => {
                e.target.onerror = null; 
                e.target.style.display = 'none';
              }}
            />
          )}
        </div>
        <h2 className="game-title fade-in">{title}</h2>
      </div>
    );
  }
  
  return (
    <div className="simple-game-container rules-phase">
      <h2 className="game-title">{title}</h2>
      <div className="rule-card slide-up">
        <p className="rule-text">{description}</p>
      </div>
      {isMyTurn ? (
        <button className="btn btn-primary next-btn slide-up" onClick={onNext}>
          {buttonText}
        </button>
      ) : (
        <p className="waiting-message slide-up">En attente de {activePlayerName}...</p>
      )}
    </div>
  );
};

export default SimpleRuleGame;
