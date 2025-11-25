import React, { useState } from 'react';
import { update, ref } from 'firebase/database';
import { db } from '../firebase';
import './GameSettings.css';

const GameSettings = ({ room, onClose }) => {
  // Default values based on Definition_Mustachio
  const defaultSettings = {
    '3-3-3': 3,
    'Loto des Doigts (Exact)': 2, // Multiplier of player count
    'Loto des Doigts (Borne 2)': 1.5, // Divisor of player count
    'Loto des Doigts (Borne 4)': 1,
    'La Méduse': 2,
    'Mini-bac': 3,
    'Jeu de la Note (Gagnant)': 4,
    'Jeu de la Note (Perdant)': 2,
    'Trinquette (Menteur)': 4,
    'Purple (Erreur)': 2
  };

  // Initialize state with room settings or defaults
  const [settings, setSettings] = useState(room.settings || defaultSettings);

  const handleChange = (key, value) => {
    setSettings(prev => ({
      ...prev,
      [key]: parseInt(value)
    }));
  };

  const handleSave = async () => {
    try {
      await update(ref(db, `rooms/${room.code}/settings`), settings);
      onClose();
    } catch (error) {
      console.error("Error saving settings:", error);
    }
  };

  return (
    <div className="settings-overlay">
      <div className="settings-modal">
        <div className="settings-header">
          <h2>Paramètres de la partie</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        
        <div className="settings-content">
          {Object.entries(settings).map(([key, value]) => (
            <div key={key} className="setting-item">
              <label>{key}</label>
              <div className="slider-container">
                <input 
                  type="range" 
                  min="1" 
                  max="10" 
                  value={value} 
                  onChange={(e) => handleChange(key, e.target.value)} 
                />
                <span className="value-display">{value} 🍺</span>
              </div>
            </div>
          ))}
        </div>

        <div className="settings-footer">
          <button className="btn btn-secondary" onClick={onClose}>Annuler</button>
          <button className="btn btn-primary" onClick={handleSave}>Enregistrer</button>
        </div>
      </div>
    </div>
  );
};

export default GameSettings;
