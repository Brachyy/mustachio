import React, { useState, useEffect, useRef } from 'react';
import { reassignHostIfNeeded } from '../services/roomService';
import { drawCard, leaveRoom } from '../services/roomService';
import MiniGameRouter from '../components/MiniGameRouter';
import EndGame from '../components/EndGame';
import { soundService } from '../services/soundService';
import { useNavigate } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import { useToast } from '../components/Toast';
import './Game.css';
import '../components/GameLogoOverlay.css';

const Game = ({ room, playerId }) => {
  const navigate = useNavigate();
  const toast = useToast();
  const isMyTurn = room.order[room.currentTurnIndex] === playerId;
  const activePlayerId = room.order[room.currentTurnIndex];
  const activePlayer = room.players[activePlayerId];
  const activeCard = room.activeCard;
  const deckCount = room.deck ? room.deck.length : 0;

  // States: 'idle', 'animating', 'revealed', 'logo_anim', 'minigame'
  const [viewState, setViewState] = useState('idle');
  const [animatingCard, setAnimatingCard] = useState(null);
  const [animStyle, setAnimStyle] = useState({});
  const [logoOverlay, setLogoOverlay] = useState(null); // { src: string, name: string }

  // Refs for piles to calculate positions
  const drawPileRef = useRef(null);
  const discardPileRef = useRef(null);

  // Check if active player still exists (handle disconnection)
  useEffect(() => {
    if (!activePlayer && room.status === 'playing') {
      // Active player disconnected! Skip to next player
      const nextTurnIndex = (room.currentTurnIndex + 1) % room.order.length;
      const nextPlayerId = room.order[nextTurnIndex];
      
      // Check if next player exists
      if (room.players[nextPlayerId]) {
        // Skip to next player
        import('../services/roomService').then(({ endTurn }) => {
          endTurn(room.code).catch(console.error);
        });
        toast.warning(`${room.players[room.order[room.currentTurnIndex]]?.name || 'Joueur'} s'est déconnecté`);
      }
    }
  }, [activePlayer, room.status, room.currentTurnIndex, room.order, room.code, room.players, toast]);

  // New effect: ensure a host exists after any change in room data
  useEffect(() => {
    if (room && room.hostId && (!room.players || !room.players[room.hostId])) {
      reassignHostIfNeeded(room.code).catch(console.error);
    }
  }, [room]);

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
            transform: 'rotateY(180deg)', // Flip but keep size matched
            transition: 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)'
          });
        }, 50);

        // After animation, show revealed state
        setTimeout(() => {
          setViewState('revealed');
          setAnimatingCard(null);
        }, 700);
      }

      // 3. Wait 1s then show minigame (after revealed state)
      // This logic is now handled by the useEffect below that watches for 'revealed' state
      
      // No cleanup needed here as timers are self-contained for this specific animation
    } else if (!activeCard) {
      setViewState('idle');
      setAnimatingCard(null);
    }
  }, [activeCard, viewState]); // Added viewState to dependencies to re-run when it changes

  // Effect to transition from revealed to minigame (with optional logo animation)
  useEffect(() => {
    if (viewState === 'revealed' && activeCard) {
      soundService.playCardReveal(); // Play sound when card is revealed
      
      // Check for special game logos
      let logoToPlay = null;
      if (activeCard.value === 'J') {
        logoToPlay = { src: '/assets/pmu_logo.png', name: 'PMU' };
      } else if (activeCard.value === '8') {
        logoToPlay = { src: '/assets/medusa_logo.png', name: 'La Méduse' };
      }

      if (logoToPlay) {
        // Play logo animation
        setTimeout(() => {
          setLogoOverlay(logoToPlay);
          setViewState('logo_anim');
          soundService.playGo(); // Play a sound for the special game
        }, 800);
      } else {
        // Normal flow
        const gameTimer = setTimeout(() => {
          setViewState('minigame');
        }, 1000);
        return () => clearTimeout(gameTimer);
      }
    } else if (viewState === 'logo_anim') {
      // After logo animation, go to minigame
      const animTimer = setTimeout(() => {
        setLogoOverlay(null);
        setViewState('minigame');
      }, 2500); // Show logo for 2.5s
      return () => clearTimeout(animTimer);
    }
  }, [viewState, activeCard]);

  useEffect(() => {
    // Cleanup sounds when leaving specific states
    if (viewState !== 'revealed' && viewState !== 'logo_anim') {
       // soundService.stopAll(); // Optional cleanup
    }
  }, [viewState]);


  const handleDraw = async () => {
    if (!isMyTurn || viewState !== 'idle') return;
    try {
      soundService.playDraw();
      await drawCard(room.code);
    } catch (error) {
      console.error("Error drawing card:", error);
    }
  };

  const handleLeave = async () => {
    if (window.confirm('Voulez-vous vraiment quitter la partie ?')) {
      try {
        await leaveRoom(room.code, playerId);
        toast.info('Vous avez quitté la partie');
        navigate('/');
      } catch (error) {
        toast.error('Erreur lors de la déconnexion');
      }
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
        <button className="btn-icon" onClick={handleLeave} title="Quitter la partie">
          <LogOut size={24} />
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

      {/* Logo Overlay Animation */}
      {logoOverlay && (
        <div className="game-logo-overlay">
          <div className="logo-content pop-in-bounce">
            <img src={logoOverlay.src} alt={logoOverlay.name} className="game-logo-img" />
            <h2 className="game-logo-title">{logoOverlay.name}</h2>
          </div>
        </div>
      )}

      {/* Main Game Area */}
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
