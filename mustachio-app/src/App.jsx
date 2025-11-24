import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Lobby from './pages/Lobby';
import Join from './pages/Join';

function App() {
  return (
    <Router>
      <div className="app-container">
        <div className="mustache-bg"></div>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/join" element={<Join />} />
          <Route path="/lobby/:roomCode" element={<Lobby />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
