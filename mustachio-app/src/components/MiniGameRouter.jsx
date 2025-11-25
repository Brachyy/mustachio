import React from 'react';
import { update, ref } from 'firebase/database';
import { db } from '../firebase';
import { GAME_RULES } from '../utils/rules';
import TimerGame from './games/TimerGame';
import SixTimeGame from './games/SixTimeGame';
import FingerLottoGame from './games/FingerLottoGame';
import NoteGame from './games/NoteGame';
import DuelGame from './games/DuelGame';
import TrinquetteGame from './games/TrinquetteGame';
import PurpleGame from './games/PurpleGame';
import PMUGame from './games/PMUGame';
import CupidGame from './games/CupidGame';
import SimpleRuleGame from './games/SimpleRuleGame';
import { endTurn } from '../services/roomService';

const MiniGameRouter = ({ cardValue, room, isMyTurn, playerId }) => {
  const rule = GAME_RULES[cardValue];
  
  // Read hasSeenRules from Firebase
  const hasSeenRules = room.miniGameState?.hasSeenRules || false;

  // Reset hasSeenRules when card changes (only active player)
  React.useEffect(() => {
    if (isMyTurn && room.miniGameState?.hasSeenRules) {
      // Clear it when a new card is drawn
      update(ref(db, `rooms/${room.code}/miniGameState`), {
        hasSeenRules: false
      }).catch(console.error);
    }
  }, [cardValue, isMyTurn, room.code]);

  const handleNext = async () => {
    if (isMyTurn) {
      try {
        await endTurn(room.code);
      } catch (error) {
        console.error(error);
      }
    }
  };

  const handleStartGame = async () => {
    if (isMyTurn) {
      try {
        await update(ref(db, `rooms/${room.code}/miniGameState`), {
          hasSeenRules: true
        });
      } catch (error) {
        console.error(error);
      }
    }
  };

  if (!rule) return <div>Jeu inconnu</div>;

  // If rules haven't been seen yet, show the rule card
  if (!hasSeenRules) {
    const isSimple = rule.type === 'simple';
    return (
      <SimpleRuleGame 
        title={rule.title} 
        description={rule.description} 
        onNext={isSimple ? handleNext : handleStartGame}
        isMyTurn={isMyTurn}
        room={room}
        buttonText={isSimple ? "J'ai compris / Suivant" : "Commencer le jeu"}
      />
    );
  }

  // ... Specific Game Rendering ...

  if (cardValue === '3') {
    return (
      <TimerGame 
        room={room} 
        isMyTurn={isMyTurn} 
        onNext={handleNext}
        playerId={playerId}
      />
    );
  }

  if (cardValue === '6') {
    return (
      <SixTimeGame 
        room={room} 
        isMyTurn={isMyTurn} 
        onNext={handleNext}
        playerId={playerId}
      />
    );
  }

  if (cardValue === '7') {
    return (
      <FingerLottoGame 
        room={room} 
        isMyTurn={isMyTurn} 
        onNext={handleNext}
        playerId={playerId}
      />
    );
  }

  if (cardValue === '10') {
    return (
      <NoteGame 
        room={room} 
        isMyTurn={isMyTurn} 
        onNext={handleNext}
        playerId={playerId}
      />
    );
  }

  if (cardValue === '2') {
    return (
      <DuelGame 
        room={room} 
        isMyTurn={isMyTurn} 
        onNext={handleNext}
        playerId={playerId}
      />
    );
  }

  if (cardValue === '4') {
    return (
      <TrinquetteGame 
        room={room} 
        isMyTurn={isMyTurn} 
        onNext={handleNext}
        playerId={playerId}
      />
    );
  }

  if (cardValue === '5') {
    return (
      <PurpleGame 
        room={room} 
        isMyTurn={isMyTurn} 
        onNext={handleNext}
        playerId={playerId}
      />
    );
  }

  if (cardValue === 'J') {
    return (
      <PMUGame 
        room={room} 
        isMyTurn={isMyTurn} 
        onNext={handleNext}
        playerId={playerId}
      />
    );
  }

  if (cardValue === 'Q') {
    return (
      <CupidGame 
        room={room} 
        isMyTurn={isMyTurn} 
        onNext={handleNext}
        playerId={playerId}
      />
    );
  }

  // Fallback for simple games if they somehow bypass the first check (shouldn't happen with current logic, but safe to keep)
  return (
    <SimpleRuleGame 
      title={rule.title} 
      description={rule.description} 
      onNext={handleNext}
      isMyTurn={isMyTurn}
      room={room}
    />
  );
};

export default MiniGameRouter;
