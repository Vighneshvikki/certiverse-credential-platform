import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import LandingPage from './components/LandingPage.jsx';
import CategorySelection from './components/CategorySelection.jsx';
import QuizPage from './components/QuizPage.jsx';
import Paywall from './components/Paywall.jsx';
import ResultPage from './components/ResultPage.jsx';
import { Award, Sun, Moon } from 'lucide-react';

export default function App() {
  const [page, setPage] = useState('landing');
  const [userName, setUserName] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [sessionId, setSessionId] = useState('');
  const [scoreSummary, setScoreSummary] = useState(null);
  const [premiumResult, setPremiumResult] = useState(null);

  // Theme management (Dark Mode by default)
  const [theme, setTheme] = useState('dark');
  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    if (nextTheme === 'light') {
      document.body.classList.add('light-theme');
    } else {
      document.body.classList.remove('light-theme');
    }
  };

  // Cursor Glow Coordinates Tracking
  const [mousePos, setMousePos] = useState({ x: -1000, y: -1000 });
  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Restart back to landing
  const handleReset = () => {
    setPage('landing');
    setSelectedCategory(null);
    setSessionId('');
    setScoreSummary(null);
    setPremiumResult(null);
  };

  // Switch content based on current page state
  const renderPageContent = () => {
    switch (page) {
      case 'landing':
        return (
          <LandingPage 
            onStart={() => setPage('category-selection')} 
          />
        );
      case 'category-selection':
        return (
          <CategorySelection
            userName={userName}
            setUserName={setUserName}
            onSelectCategory={(category) => {
              setSelectedCategory(category);
              setPage('quiz');
            }}
            onBack={() => setPage('landing')}
          />
        );
      case 'quiz':
        return (
          <QuizPage
            category={selectedCategory}
            userName={userName}
            onSubmit={(submitData) => {
              setSessionId(submitData.sessionId);
              setScoreSummary(submitData);
              setPage('paywall');
            }}
            onBack={() => setPage('category-selection')}
          />
        );
      case 'paywall':
        return (
          <Paywall
            sessionId={sessionId}
            scoreSummary={scoreSummary}
            category={selectedCategory}
            onPaymentSuccess={(unlockedResult) => {
              setPremiumResult(unlockedResult);
              setPage('result');
            }}
            onBack={handleReset}
          />
        );
      case 'result':
        return (
          <ResultPage
            resultData={premiumResult}
            onRestart={handleReset}
          />
        );
      default:
        return <LandingPage onStart={() => setPage('category-selection')} />;
    }
  };

  // Transition parameters
  const pageVariants = {
    initial: { opacity: 0, y: 20, scale: 0.98 },
    animate: { opacity: 1, y: 0, scale: 1 },
    exit: { opacity: 0, y: -20, scale: 0.98 }
  };

  return (
    <div className="app-container">
      {/* Background Aurora Decorative mesh */}
      <div className="aurora-bg">
        <div className="aurora-blob aurora-blob-1"></div>
        <div className="aurora-blob aurora-blob-2"></div>
        <div className="aurora-blob aurora-blob-3"></div>
        <div className="aurora-blob aurora-blob-4"></div>
      </div>

      {/* Dynamic Cursor Tracker Glow */}
      <div 
        className="cursor-glow" 
        style={{ left: `${mousePos.x}px`, top: `${mousePos.y}px` }}
      ></div>

      {/* Premium Header */}
      <header className="main-header">
        <div className="header-inner">
          <a className="logo" onClick={handleReset} id="header-logo-link">
            <Award size={28} className="logo-icon" style={{ color: 'var(--primary)' }} />
            Quiz<span>Mint</span>
          </a>
          <nav style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
            <ul className="nav-links">
              <li><a onClick={handleReset} style={{ cursor: 'pointer' }}>Home</a></li>
            </ul>

            {/* Theme Toggle Switch */}
            <button 
              onClick={toggleTheme} 
              className="theme-toggle-btn"
              id="theme-switcher-btn"
              title="Toggle Light/Dark Theme"
              aria-label="Toggle Theme"
            >
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            <button 
              onClick={() => setPage('category-selection')} 
              className="btn btn-secondary" 
              style={{ padding: '0.5rem 1.2rem', fontSize: '0.85rem' }}
              id="nav-get-started-btn"
            >
              Verify Skills
            </button>
          </nav>
        </div>
      </header>

      {/* Main Content Area with Page Entrance Animations */}
      <main className="main-content">
        <AnimatePresence mode="wait">
          <motion.div
            key={page}
            initial="initial"
            animate="animate"
            exit="exit"
            variants={pageVariants}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            style={{ width: '100%' }}
          >
            {renderPageContent()}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Modern Footer */}
      <footer className="main-footer">
        <div className="footer-inner">
          <p>© {new Date().getFullYear()} <span className="footer-brand">Quiz<span>Mint</span> Inc.</span> All rights reserved.</p>
          <div style={{ display: 'flex', gap: '1.5rem' }}>
            <a href="#" style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textDecoration: 'none' }}>Privacy Policy</a>
            <a href="#" style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textDecoration: 'none' }}>Terms of Service</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
