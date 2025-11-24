import React from 'react';
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

  const handleNext = async () => {
    if (isMyTurn) {
      try {
        await endTurn(room.code);
      } catch (error) {
        console.error(error);
      }
    }
  };

  if (!rule) return <div>Jeu inconnu</div>;

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
