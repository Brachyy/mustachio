import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Join from './pages/Join';
import Lobby from './pages/Lobby';
import Rules from './pages/Rules';
import { ToastProvider } from './components/Toast';
import ErrorBoundary from './components/ErrorBoundary';
import './App.css';

import { AnimatePresence } from 'framer-motion';
import { useLocation } from 'react-router-dom';

const AppRoutes = () => {
  const location = useLocation();
  
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Home />} />
        <Route path="/join" element={<Join />} />
        <Route path="/lobby/:roomCode" element={<Lobby />} />
        <Route path="/rules" element={<Rules />} />
      </Routes>
    </AnimatePresence>
  );
};

function App() {
  return (
    <ErrorBoundary>
      <ToastProvider>
        <Router>
          <AppRoutes />
        </Router>
      </ToastProvider>
    </ErrorBoundary>
  );
}

export default App;
