import { User, FinancialGoal, NewsArticle, FinancialAlert } from '../types';
import { storage } from '../services/storage';
import React, { useState, useEffect } from 'react';
import { TrendingUp, Wallet, Target, ArrowRight, Plus, Users, Calculator, Play, Globe, AlertTriangle, AlertCircle, Info, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Link } from 'react-router-dom';
import { crisisService } from '../services/crisisService';

import { useNavigate } from 'react-router-dom';

interface DashboardProps {
  user: User;
}

export default function Dashboard({ user }: DashboardProps) {
  const navigate = useNavigate();
  const [goals, setGoals] = useState<FinancialGoal[]>([]);
  const [showAddGoal, setShowAddGoal] = useState(false);
  const [newGoal, setNewGoal] = useState({ title: '', target: '' });
  const [latestVideos, setLatestVideos] = useState<NewsArticle[]>([]);
  const [alerts, setAlerts] = useState<FinancialAlert[]>([]);

  useEffect(() => {
    setGoals(storage.getGoals());
    const cachedNews = storage.getNews();
    if (cachedNews) {
      setLatestVideos(cachedNews.articles.slice(0, 2));
    }

    const cachedAlerts = crisisService.getCachedAlerts(user.region);
    if (cachedAlerts.length > 0) {
      setAlerts(cachedAlerts);
    } else {
      crisisService.generateAlerts(user.region).then(setAlerts);
    }
  }, [user.region]);

  const handleAddGoal = (e: React.FormEvent) => {
    e.preventDefault();
    const goal: FinancialGoal = {
      id: Math.random().toString(36).substr(2, 9),
      title: newGoal.title,
      targetAmount: parseFloat(newGoal.target),
      currentAmount: 0,
      deadline: new Date().toISOString(),
    };
    storage.saveGoal(goal);
    setGoals([...goals, goal]);
    setShowAddGoal(false);
    setNewGoal({ title: '', target: '' });
  };

  return (
    <div className="space-y-12">
      <header className="px-2 md:px-0">
        <h2 className="text-3xl md:text-4xl font-black uppercase italic tracking-tighter text-slate-900 leading-none">Welcome back</h2>
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 mt-2">Your financial overview for {user.region}</p>
      </header>

      {/* Financial Alerts Section */}
      <AnimatePresence>
        {alerts.length > 0 && (
          <motion.section 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-4"
          >
            <div className="flex items-center gap-3 mb-4">
              <AlertTriangle className="w-5 h-5 text-rose-500" />
              <h3 className="text-lg font-black uppercase italic tracking-tighter text-slate-900">Critical Alerts</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              {alerts.map((alert) => (
                <div 
                  key={alert.id}
                  className={`relative overflow-hidden p-6 md:p-8 rounded-[2rem] md:rounded-[2.5rem] border-2 transition-all hover:shadow-2xl ${
                    alert.severity === 'critical' || alert.severity === 'high' 
                      ? 'bg-rose-50 border-rose-500 text-rose-900' 
                      : 'bg-amber-50 border-amber-500 text-amber-900'
                  }`}
                >
                  <div className="relative z-10">
                    <div className="flex items-start justify-between mb-4">
                      <div className={`p-3 rounded-2xl ${
                        alert.severity === 'critical' || alert.severity === 'high' 
                          ? 'bg-rose-500 text-white' 
                          : 'bg-amber-500 text-white'
                      }`}>
                        {alert.type === 'crisis' ? <AlertCircle className="w-6 h-6" /> : <Info className="w-6 h-6" />}
                      </div>
                      <span className="text-[10px] font-black uppercase tracking-widest opacity-60">
                        {alert.severity} Priority
                      </span>
                    </div>
                    <h4 className="text-2xl font-black uppercase italic tracking-tighter mb-2 leading-tight">
                      {alert.title}
                    </h4>
                    <p className="text-sm font-bold opacity-80 mb-6 leading-relaxed">
                      {alert.description}
                    </p>
                    <a 
                      href={alert.actionUrl}
                      target={alert.actionUrl.startsWith('http') ? '_blank' : '_self'}
                      rel="noopener noreferrer"
                      className={`inline-flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-black uppercase italic tracking-tighter transition-all ${
                        alert.severity === 'critical' || alert.severity === 'high'
                          ? 'bg-rose-500 text-white hover:bg-rose-600'
                          : 'bg-amber-500 text-white hover:bg-amber-600'
                      }`}
                    >
                      {alert.actionLabel} <ChevronRight className="w-4 h-4" />
                    </a>
                  </div>
                  <div className={`absolute -right-8 -bottom-8 w-48 h-48 opacity-10 ${
                    alert.severity === 'critical' || alert.severity === 'high' ? 'text-rose-900' : 'text-amber-900'
                  }`}>
                    {alert.type === 'crisis' ? <AlertTriangle className="w-full h-full" /> : <Globe className="w-full h-full" />}
                  </div>
                </div>
              ))}
            </div>
          </motion.section>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-8">
        <div className="bg-white p-6 md:p-8 rounded-[2rem] md:rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all">
          <div className="w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4 md:mb-6 shadow-sm">
            <Wallet className="w-6 h-6 md:w-7 md:h-7" />
          </div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Estimated Savings</p>
          <h3 className="text-2xl md:text-3xl font-black text-slate-900 mt-2">$1,240.00</h3>
          <p className="text-xs text-emerald-600 font-black mt-3 flex items-center gap-1 uppercase italic tracking-tighter">
            <TrendingUp className="w-4 h-4" /> +12% this month
          </p>
        </div>

        <div className="bg-white p-6 md:p-8 rounded-[2rem] md:rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all">
          <div className="w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center mb-4 md:mb-6 shadow-sm">
            <Target className="w-6 h-6 md:w-7 md:h-7" />
          </div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Active Goals</p>
          <h3 className="text-2xl md:text-3xl font-black text-slate-900 mt-2">{goals.length}</h3>
          <p className="text-xs text-slate-400 font-bold mt-3 uppercase tracking-widest">Tracking progress</p>
        </div>

        <div className="bg-slate-900 p-6 md:p-8 rounded-[2rem] md:rounded-[2.5rem] shadow-2xl shadow-slate-900/20 text-white relative overflow-hidden group">
          <div className="relative z-10">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">AI Insight</p>
            <p className="text-lg md:text-xl font-black uppercase italic tracking-tighter mt-4 leading-tight">
              "You could save <span className="text-emerald-400">$45</span> by switching your grocery store this week."
            </p>
            <div className="flex flex-col gap-2 mt-6">
              <button className="flex items-center gap-2 text-xs font-black uppercase italic tracking-tighter text-emerald-400 hover:text-emerald-300 transition-colors">
                View details <ArrowRight className="w-4 h-4" />
              </button>
              <Link to="/budget" className="flex items-center gap-2 text-xs font-black uppercase italic tracking-tighter text-white/60 hover:text-white transition-colors">
                Try Budget AI <Calculator className="w-4 h-4" />
              </Link>
            </div>
          </div>
          <div className="absolute -right-4 -bottom-4 w-32 h-32 bg-emerald-400/5 rounded-full blur-3xl group-hover:scale-150 transition-transform" />
        </div>
      </div>

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div>
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-2xl font-black uppercase italic tracking-tighter text-slate-900">Financial Goals</h3>
            <button 
              onClick={() => setShowAddGoal(true)}
              className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-2xl font-black uppercase italic tracking-tighter text-xs hover:bg-slate-800 transition-all shadow-lg"
            >
              <Plus className="w-4 h-4" /> Add Goal
            </button>
          </div>

          {showAddGoal && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white p-8 rounded-[2.5rem] border-2 border-slate-900 mb-8 shadow-xl"
            >
              <form onSubmit={handleAddGoal} className="grid grid-cols-1 gap-6">
                <input
                  type="text"
                  placeholder="Goal Title"
                  value={newGoal.title}
                  onChange={e => setNewGoal({ ...newGoal, title: e.target.value })}
                  className="px-6 py-4 bg-slate-50 rounded-2xl focus:ring-2 focus:ring-slate-900 outline-none font-medium"
                  required
                />
                <input
                  type="number"
                  placeholder="Target Amount"
                  value={newGoal.target}
                  onChange={e => setNewGoal({ ...newGoal, target: e.target.value })}
                  className="px-6 py-4 bg-slate-50 rounded-2xl focus:ring-2 focus:ring-slate-900 outline-none font-medium"
                  required
                />
                <button type="submit" className="bg-slate-900 text-white font-black uppercase italic tracking-tighter rounded-2xl py-4 shadow-lg">
                  Save Goal
                </button>
              </form>
            </motion.div>
          )}

          <div className="space-y-6">
            {goals.map(goal => (
              <div key={goal.id} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all">
                <div className="flex justify-between items-start mb-6">
                  <h4 className="text-lg font-black uppercase italic tracking-tighter text-slate-900">{goal.title}</h4>
                  <span className="text-sm font-black text-slate-400">${goal.currentAmount} / ${goal.targetAmount}</span>
                </div>
                <div className="w-full h-4 bg-slate-50 rounded-full overflow-hidden p-1 border border-slate-100">
                  <div 
                    className="h-full bg-slate-900 rounded-full transition-all duration-1000 shadow-sm"
                    style={{ width: `${(goal.currentAmount / goal.targetAmount) * 100}%` }}
                  />
                </div>
              </div>
            ))}
            {goals.length === 0 && !showAddGoal && (
              <div className="py-20 text-center bg-slate-50 rounded-[2.5rem] border-2 border-dashed border-slate-200">
                <p className="text-slate-400 font-black uppercase italic tracking-tighter">No goals set yet.</p>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-8">
          <div className="flex items-center justify-between">
            <h3 className="text-2xl font-black uppercase italic tracking-tighter text-slate-900">Latest Intelligence</h3>
            <Link to="/news" className="text-xs font-black uppercase italic tracking-tighter text-emerald-600 hover:underline">View All</Link>
          </div>
          
          <div className="space-y-6">
            {latestVideos.length > 0 ? (
              latestVideos.map((video, i) => (
                <div 
                  key={i}
                  onClick={() => navigate('/news')}
                  className="group bg-white rounded-[2.5rem] overflow-hidden border border-slate-100 hover:border-emerald-200 transition-all cursor-pointer"
                >
                  <div className="aspect-video relative overflow-hidden">
                    <img 
                      src={video.thumbnail || `https://picsum.photos/seed/video${i}/400/225`} 
                      alt={video.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                      <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-xl">
                        <Play className="w-5 h-5 text-emerald-600 fill-emerald-600 ml-1" />
                      </div>
                    </div>
                  </div>
                  <div className="p-6">
                    <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500 mb-2 block">{video.source}</span>
                    <h4 className="text-lg font-black uppercase italic tracking-tighter text-slate-900 leading-tight line-clamp-2">{video.title}</h4>
                  </div>
                </div>
              ))
            ) : (
              <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 flex flex-col items-center text-center">
                <Globe className="w-10 h-10 text-slate-200 mb-4" />
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">No video reports yet</p>
                <Link to="/news" className="mt-4 text-xs font-black uppercase italic tracking-tighter text-emerald-600">Browse Intelligence</Link>
              </div>
            )}
          </div>

          <div className="bg-emerald-400 p-10 rounded-[3rem] text-black relative overflow-hidden group cursor-pointer shadow-xl shadow-emerald-400/20" onClick={() => navigate('/community')}>
            <div className="relative z-10">
              <h4 className="text-3xl font-black uppercase italic tracking-tighter mb-2">Join the Conversation</h4>
              <p className="text-sm font-bold opacity-80 mb-8 max-w-[200px] leading-tight">See how others are surviving and thriving today.</p>
              <div className="flex -space-x-4">
                {[1, 2, 3, 4, 5].map(i => (
                  <img key={i} src={`https://picsum.photos/seed/user${i}/100/100`} className="w-12 h-12 rounded-full border-4 border-emerald-400 shadow-lg" alt="User" referrerPolicy="no-referrer" />
                ))}
              </div>
            </div>
            <Users className="absolute -right-12 -bottom-12 w-48 h-48 text-black/5 group-hover:scale-110 transition-transform duration-700" />
          </div>
        </div>
      </section>
    </div>
  );
}
