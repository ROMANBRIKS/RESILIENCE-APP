import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { storage } from './services/storage';
import { User } from './types';

// Pages
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Assistant from './pages/Assistant';
import Comparison from './pages/Comparison';
import Community from './pages/Community';
import Counseling from './pages/Counseling';
import Marketplace from './pages/Marketplace';
import Intelligence from './pages/Intelligence';
import BudgetCalculator from './pages/BudgetCalculator';
import Layout from './components/Layout';

import { botService } from './services/botService';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUser = storage.getUser();
    setUser(savedUser);
    setLoading(false);

    // Automated Bot Activity Manager
    const initBots = async () => {
      const posts = storage.getPosts();
      if (posts.length < 100) {
        localStorage.setItem('resilience_seeding', 'true');
        window.dispatchEvent(new Event('seeding-update'));
        
        await botService.getOrCreateBots();
        await botService.generateBotPosts();
        await botService.generateBotStories(10);
        
        localStorage.setItem('resilience_seeding', 'false');
        window.dispatchEvent(new Event('seeding-update'));
      }
    };
    initBots();

    // Occasional background activity (every 15 minutes to maintain 100 posts/day)
    const interval = setInterval(() => {
      botService.generateSinglePost();
    }, 15 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  if (loading) return <div className="flex items-center justify-center h-screen bg-slate-50">Loading...</div>;

  return (
    <Router>
      <Routes>
        <Route path="/login" element={user ? <Navigate to="/" /> : <Login onLogin={setUser} />} />
        
        <Route element={user ? <Layout user={user} onLogout={() => { storage.logout(); setUser(null); }} /> : <Navigate to="/login" />}>
          <Route path="/" element={<Dashboard user={user!} />} />
          <Route path="/assistant" element={<Assistant />} />
          <Route path="/compare" element={<Comparison />} />
          <Route path="/budget" element={<BudgetCalculator />} />
          <Route path="/community" element={<Community user={user!} />} />
          <Route path="/counseling" element={<Counseling />} />
          <Route path="/marketplace" element={<Marketplace />} />
          <Route path="/intelligence" element={<Intelligence />} />
          <Route path="/news" element={<Intelligence />} />
          <Route path="/global-economy" element={<Intelligence />} />
        </Route>
      </Routes>
    </Router>
  );
}
