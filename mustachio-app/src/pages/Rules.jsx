import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ChevronDown, ChevronUp } from 'lucide-react';
import './Rules.css';

const Rules = () => {
  const navigate = useNavigate();
  const [expandedGame, setExpandedGame] = useState(null);

  const toggleGame = (gameTitle) => {
    setExpandedGame(expandedGame === gameTitle ? null : gameTitle);
  };

  const games = [
    {
      title: 'Roi du cercle',
      logo: '/assets/roi-du-cercle.logo.png',
      rule: "Le joueur actuel invente une nouvelle règle. La règle est valable jusqu'au prochain Roi."
    },
    {
      title: 'Le 3-3-3',
      logo: '/assets/3-3-3_logo.png',
      rule: "Le joueur précédent choisit un thème. Le joueur actuel a 3 secondes pour citer 3 choses correspondant au thème. Si le chrono arrive à zéro, il boit 3 gorgées."
    },
    {
      title: 'Six Time',
      logo: '/assets/6-time_logo.png',
      rule: "Un chrono invisible se lance pour tous. Chaque joueur l'arrête quand il pense être sur un multiple de 6 (ex: 6.00s, 12.00s). Si c'est réussi (à 0.5s près), il distribue le multiple en gorgées. Sinon, il boit 3 gorgées."
    },
    {
      title: 'Le Loto des Doigts',
      logo: '/assets/loto-doigt_logo.png',
      rule: "Le joueur parie sur le nombre total de doigts levés par les autres. Il choisit une borne (Exact, +/- 1, +/- 2). Les autres lèvent 1 ou 2 doigts. Si le pari est bon, il distribue des gorgées, sinon il boit."
    },
    {
      title: 'La Méduse',
      logo: '/assets/medusa_logo.png',
      rule: "Tout le monde baisse la tête. Au signal 'Méduse', tout le monde lève la tête et regarde quelqu'un. Si deux joueurs se regardent, ils trinquent et boivent 2 gorgées."
    },
    {
      title: 'Mini-bac',
      logo: '/assets/mini-bac_logo.png',
      rule: "Le joueur choisit un thème. Chacun son tour doit donner un mot du thème en suivant l'alphabet (A, B, C...). Le premier qui sèche boit 3 gorgées."
    },
    {
      title: 'Le jeu de la Note',
      logo: '/assets/note_logo.png',
      rule: "Les autres joueurs choisissent secrètement une note (1-10). Le joueur doit deviner la note la plus votée en proposant un thème et en demandant des exemples aux autres."
    },
    {
      title: 'Mustachio',
      logo: '/assets/avatar.png',
      rule: "Le joueur devient Mustachio. Il peut mettre son doigt sous son nez à tout moment. Le dernier à l'imiter boit double. Il a aussi une balle imaginaire pour doubler la sanction d'un joueur qui boit."
    },
    {
      title: 'Cupidon',
      logo: '/assets/cupidon_logo.png',
      rule: "Le joueur désigne deux amoureux. Ils doivent boire ensemble : si l'un boit, l'autre boit aussi (le max des deux)."
    },
    {
      title: 'Duel du Con',
      logo: '/assets/duel_du_con_logo.png',
      rule: "Le joueur défie quelqu'un. Chacun lance un dé. Le plus petit score boit la différence. Égalité = les deux boivent la valeur du dé."
    },
    {
      title: 'Trinquette',
      logo: '/assets/trinquette_logo.png',
      rule: "Lancer de dés avec bluff. Le joueur annonce un score (ex: 42). Le suivant peut dire 'Menteur' ou surenchérir. 21 (Trinquette) est le meilleur score."
    },
    {
      title: 'Purple',
      logo: '/assets/purple_logo.png',
      rule: "Devinettes sur les cartes : Rouge/Noir, Plus/Moins, Entre/Extérieur, Signe. Chaque erreur ajoute des gorgées à la banque. À la fin, on devine le signe pour distribuer ou boire la banque."
    },
    {
      title: 'PMU',
      logo: '/assets/pmu_logo.png',
      rule: "Pari sur une couleur (Rouge/Noir). Les cartes font avancer les chevaux. Des malus font reculer. Les perdants boivent leur mise, les gagnants distribuent."
    }
  ];

  return (
    <div className="rules-page">
      <div className="rules-header">
        <button className="btn-icon back-btn" onClick={() => navigate('/')}>
          <ArrowLeft size={24} />
        </button>
        <h1>Règles du Jeu</h1>
      </div>
      
      <div className="rules-list">
        {games.map((game, index) => (
          <div 
            key={index} 
            className={`rule-item ${expandedGame === game.title ? 'expanded' : ''}`}
            onClick={() => toggleGame(game.title)}
          >
            <div className="rule-summary">
              <div className="rule-logo-container">
                <img src={game.logo} alt={game.title} className="rule-logo" />
              </div>
              <span className="rule-title">{game.title}</span>
              {expandedGame === game.title ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </div>
            
            <div className="rule-details">
              <p>{game.rule}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Rules;
