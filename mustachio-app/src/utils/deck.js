export const SUITS = ['♠', '♥', '♣', '♦'];
export const VALUES = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];

export const generateDeck = () => {
  const deck = [];
  for (const suit of SUITS) {
    for (const value of VALUES) {
      deck.push({ suit, value, id: `${value}${suit}` });
    }
  }
  return shuffle(deck);
};

const shuffle = (array) => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

export const getCardGame = (cardValue) => {
  const games = {
    'A': 'Roi du cercle',
    '2': 'Duel du Con',
    '3': 'Le 3-3-3',
    '4': 'Trinquette',
    '5': 'Purple',
    '6': 'Six Time',
    '7': 'Le Loto des Doigts',
    '8': 'La Méduse',
    '9': 'Mini-bac',
    '10': 'Le jeu de la Note',
    'J': 'PMU',
    'Q': 'Cupidon',
    'K': 'Mustachio'
  };
  return games[cardValue] || 'Inconnu';
};
