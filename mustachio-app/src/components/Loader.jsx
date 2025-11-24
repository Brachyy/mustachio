import React from 'react';
import './Loader.css';

const Loader = ({ text = "Chargement...", fullScreen = false }) => {
  return (
    <div className={`loader-container ${fullScreen ? 'fullscreen' : ''}`}>
      <div className="mustache-spinner">
        <div className="spinner-ring"></div>
        <div className="mustache-icon">👨🏻</div>
      </div>
      {text && <p className="loader-text">{text}</p>}
    </div>
  );
};

export default Loader;
