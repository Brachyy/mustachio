import React, { useEffect, useState } from 'react';
import './Dice3D.css';

const Dice3D = ({ value, rolling, size = 100, hidden = false }) => {
  // Map values to rotations (x, y)
  // 1: (0, 0)
  // 2: (0, -90)
  // 3: (0, -180)
  // 4: (0, 90)
  // 5: (-90, 0)
  // 6: (90, 0)
  const getRotation = (val) => {
    const base = 'translateZ(-50px)';
    switch (val) {
      case 1: return `${base} rotateX(0deg) rotateY(0deg)`;
      case 6: return `${base} rotateX(180deg) rotateY(0deg)`;
      case 2: return `${base} rotateX(-90deg) rotateY(0deg)`;
      case 5: return `${base} rotateX(90deg) rotateY(0deg)`;
      case 3: return `${base} rotateX(0deg) rotateY(90deg)`;
      case 4: return `${base} rotateX(0deg) rotateY(-90deg)`;
      default: return `${base} rotateX(0deg) rotateY(0deg)`;
    }
  };

  return (
    <div className="scene" style={{ width: size, height: size }}>
      <div 
        className={`cube ${rolling ? 'rolling' : ''}`}
        style={{ 
          transform: rolling ? undefined : getRotation(value)
        }}
      >
        <div className="cube__face cube__face--1">{hidden ? '?' : 1}</div>
        <div className="cube__face cube__face--2">{hidden ? '?' : 2}</div>
        <div className="cube__face cube__face--3">{hidden ? '?' : 3}</div>
        <div className="cube__face cube__face--4">{hidden ? '?' : 4}</div>
        <div className="cube__face cube__face--5">{hidden ? '?' : 5}</div>
        <div className="cube__face cube__face--6">{hidden ? '?' : 6}</div>
      </div>
    </div>
  );
};

export default Dice3D;
