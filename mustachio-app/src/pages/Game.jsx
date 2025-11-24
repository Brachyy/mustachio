import React, { useState, useEffect, useRef } from 'react';
import { drawCard } from '../services/roomService';
import MiniGameRouter from '../components/MiniGameRouter';
import EndGame from '../components/EndGame';
import { soundService } from '../services/soundService';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import './Game.css';

const Game = ({ room, playerId }) => {
  const navigate = useNavigate();
  const isMyTurn = room.order[room.currentTurnIndex] === playerId;
  const activePlayerId = room.order[room.currentTurnIndex];
  const activePlayer = room.players[activePlayerId];
  const activeCard = room.activeCard;
  const deckCount = room.deck ? room.deck.length : 0;

  // States: 'idle', 'animating', 'revealed', 'minigame'
  const [viewState, setViewState] = useState('idle');
  const [animatingCard, setAnimatingCard] = useState(null);
  const [animStyle, setAnimStyle] = useState({});

  // Refs for piles to calculate positions
  const drawPileRef = useRef(null);
  const discardPileRef = useRef(null);

  // Effect to trigger animation when activeCard changes
  useEffect(() => {
    if (activeCard && viewState === 'idle') {
      // New card drawn!
      setAnimatingCard(activeCard);
      setViewState('animating');

      // Calculate positions
      if (drawPileRef.current && discardPileRef.current) {
        const startRect = drawPileRef.current.getBoundingClientRect();
        const endRect = discardPileRef.current.getBoundingClientRect();
        
        // Initial position (on top of draw pile)
        setAnimStyle({
          top: startRect.top,
          left: startRect.left,
          width: startRect.width,
          height: startRect.height,
          transform: 'none',
          transition: 'none'
        });

        // Trigger animation to end position
        setTimeout(() => {
          setAnimStyle({
            top: endRect.top,
            left: endRect.left,
            width: endRect.width,
            height: endRect.height,
            transform: 'rotateY(180deg) scale(1.0)', // Flip but keep size matched
            transition: 'all 0.8s cubic-bezier(0.4, 0.0, 0.2, 1)'
          });
        }, 50);
      }

      // 2. Animation finished (0.8s duration)
      const animTimer = setTimeout(() => {
        setViewState('revealed');
      }, 850);

      // 3. Wait 1s then show minigame
      const gameTimer = setTimeout(() => {
        setViewState('minigame');
      }, 1850); // 0.85s + 1s

      return () => {
        clearTimeout(animTimer);
        clearTimeout(gameTimer);
      };
    } else if (!activeCard) {
      setViewState('idle');
      setAnimatingCard(null);
    }
  }, [activeCard]);

  const handleDraw = async () => {
    if (!isMyTurn || viewState !== 'idle') return;
    try {
      soundService.playDraw();
      await drawCard(room.code);
    } catch (error) {
      console.error("Error drawing card:", error);
    }
  };

  const renderCardFace = (card) => (
    <div className={`card-face card-front ${['♥', '♦'].includes(card.suit) ? 'red' : 'black'}`}>
      <div className="card-corner top-left">
        <span>{card.value}</span>
        <span>{card.suit}</span>
      </div>
      <div className="card-center-suit">{card.suit}</div>
      <div className="card-corner bottom-right">
        <span>{card.value}</span>
        <span>{card.suit}</span>
      </div>
    </div>
  );

  // Show end game screen if game is finished
  if (room.status === 'finished') {
    return <EndGame room={room} />;
  }

  return (
    <div className="game-container">
      <div className="game-header">
        <button className="btn-icon" onClick={() => navigate('/')}>
          <ArrowLeft size={24} />
        </button>
        <div className="turn-indicator">
          {isMyTurn ? "C'est à toi !" : `C'est au tour de ${activePlayer.name}`}
        </div>
      </div>

      {/* Game Status Bar (Lovers & Mustachio) */}
      {(room.lovers || room.mustachio) && (
        <div className="game-status-bar glass-panel">
          {room.lovers && (
            <div className="status-item lovers">
              <span className="icon">💘</span>
              <span className="text">
                {room.lovers[0].name} & {room.lovers[1].name}
              </span>
            </div>
          )}
          {room.mustachio && (
            <div className="status-item mustachio">
              <span className="icon">🥸</span>
              <span className="text">
                {room.players[room.mustachio]?.name} est le Mustachio
              </span>
            </div>
          )}
        </div>
      )}

      <div className="game-board">
        {viewState === 'minigame' && activeCard ? (
          <div className="active-game-wrapper">
            <div className="card-display-small">
              <span className="card-value">{activeCard.value}</span>
              <span className="card-suit">{activeCard.suit}</span>
            </div>
            <MiniGameRouter 
              cardValue={activeCard.value} 
              room={room} 
              isMyTurn={isMyTurn}
              playerId={playerId}
            />
          </div>
        ) : (
          <div className="table-layout">
            {/* DRAW PILE */}
            <div className="pile-area draw-area" ref={drawPileRef} onClick={handleDraw}>
              <div className="pile-label">Pioche ({deckCount})</div>
              {deckCount > 0 && (
                <div className={`card-back stack ${isMyTurn && viewState === 'idle' ? 'glow clickable' : ''}`}>
                  MUSTACHIO
                </div>
              )}
              {/* Stack effect layers */}
              {deckCount > 1 && <div className="card-back stack-1"></div>}
              {deckCount > 2 && <div className="card-back stack-2"></div>}
              
              {isMyTurn && viewState === 'idle' && <p className="tap-hint">Tire une carte !</p>}
            </div>

            {/* DISCARD PILE */}
            <div className="pile-area discard-area" ref={discardPileRef}>
              <div className="pile-label">Défausse</div>
              <div className="card-placeholder-slot"></div>
              
              {/* If we are revealed, show the card sitting here */}
              {viewState === 'revealed' && animatingCard && (
                <div className="landed-card">
                  {renderCardFace(animatingCard)}
                </div>
              )}
            </div>


          </div>
        )}
      </div>



      {/* ANIMATING CARD - Moved to root to avoid perspective/transform context issues */}
      {viewState === 'animating' && animatingCard && (
        <div 
          id="flying-card" 
          className="flying-card-wrapper"
          style={{
            position: 'fixed',
            top: animStyle.top,
            left: animStyle.left,
            width: animStyle.width,
            height: animStyle.height,
            transform: animStyle.transform,
            transition: animStyle.transition,
            zIndex: 1000,
            pointerEvents: 'none'
          }}
        >
          <div className="flipper">
            <div className="card-face card-back-face">MUSTACHIO</div>
            {renderCardFace(animatingCard)}
          </div>
        </div>
      )}
    </div>
  );
};

export default Game;
