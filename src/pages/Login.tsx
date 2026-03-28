import React, { useState } from 'react';
import { User } from '../types';
import { storage } from '../services/storage';
import { Shield, Smartphone, Globe, ArrowRight, CheckCircle2, Zap, Heart, Lock } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface LoginProps {
  onLogin: (user: User) => void;
}

export default function Login({ onLogin }: LoginProps) {
  const [showLogin, setShowLogin] = useState(false);
  const [phone, setPhone] = useState('');
  const [region, setRegion] = useState<'US' | 'EU'>('US');
  const [optIn, setOptIn] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone) {
      setError('Phone number is required');
      return;
    }
    if (!optIn) {
      setError('You must agree to the terms');
      return;
    }

    const newUser: User = {
      id: Math.random().toString(36).substr(2, 9),
      phone,
      region: region as 'US' | 'EU',
      optInConnection: optIn,
    };

    storage.setUser(newUser);
    onLogin(newUser);
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-emerald-500 selection:text-black overflow-x-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 px-6 py-8 flex justify-between items-center bg-gradient-to-b from-black/50 to-transparent backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center">
            <Shield className="w-6 h-6 text-black" />
          </div>
          <span className="text-2xl font-black tracking-tighter uppercase italic">Resilience</span>
        </div>
        <button 
          onClick={() => setShowLogin(true)}
          className="px-6 py-2 bg-white text-black font-bold rounded-full hover:bg-emerald-500 transition-all active:scale-95"
        >
          Get Started
        </button>
      </nav>

      {/* Hero Section */}
      <main className="relative pt-32 pb-20 px-6 overflow-hidden">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0 z-0 opacity-20">
          <img 
            src="https://picsum.photos/seed/city-night/1920/1080?blur=2" 
            alt="Background" 
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#050505] via-transparent to-[#050505]" />
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div 
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-emerald-500 text-xs font-bold uppercase tracking-widest mb-8">
                <Zap className="w-4 h-4" /> AI-Powered Financial Freedom
              </div>
              <h1 className="text-[12vw] lg:text-[7rem] font-black leading-[0.85] tracking-tighter uppercase italic mb-8">
                Survive <br />
                <span className="text-emerald-500">Thrive</span> <br />
                Repeat.
              </h1>
              <p className="text-xl text-slate-400 max-w-lg leading-relaxed mb-10">
                A privacy-first platform helping working-class communities reduce cost of living and access real support through AI intelligence.
              </p>
              <div className="flex flex-wrap gap-4">
                <button 
                  onClick={() => setShowLogin(true)}
                  className="px-8 py-4 bg-emerald-500 text-black font-black rounded-2xl flex items-center gap-3 hover:scale-105 transition-all shadow-[0_0_40px_rgba(16,185,129,0.3)]"
                >
                  Join the Movement <ArrowRight className="w-5 h-5" />
                </button>
                <div className="flex -space-x-3 items-center">
                  {[1, 2, 3, 4].map(i => (
                    <div key={i} className="w-10 h-10 rounded-full border-2 border-black bg-slate-800 overflow-hidden">
                      <img src={`https://picsum.photos/seed/person${i}/100/100`} alt="User" referrerPolicy="no-referrer" />
                    </div>
                  ))}
                  <span className="pl-6 text-sm font-bold text-slate-500">+12k joined this week</span>
                </div>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, scale: 0.8, rotate: 5 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              transition={{ duration: 1, delay: 0.2 }}
              className="relative hidden lg:block"
            >
              <div className="absolute inset-0 bg-emerald-500/20 blur-[120px] rounded-full" />
              <div className="relative bg-slate-900/50 border border-white/10 p-2 rounded-[3.5rem] backdrop-blur-xl shadow-2xl overflow-hidden">
                <div className="aspect-[4/5] relative rounded-[3rem] overflow-hidden">
                  <img 
                    src="https://picsum.photos/seed/finance-app/800/1000" 
                    alt="App Preview" 
                    className="w-full h-full object-cover opacity-60"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent" />
                  
                  <div className="absolute inset-0 p-8 flex flex-col justify-end gap-6">
                    <div className="flex items-center justify-between p-4 bg-white/10 rounded-2xl border border-white/10 backdrop-blur-md">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-emerald-500 rounded-xl flex items-center justify-center">
                          <Smartphone className="w-6 h-6 text-black" />
                        </div>
                        <div>
                          <p className="text-xs text-slate-300 font-bold uppercase tracking-wider">Savings Found</p>
                          <p className="text-xl font-black text-white">$124.50</p>
                        </div>
                      </div>
                      <div className="text-emerald-400 font-bold">+12%</div>
                    </div>
                    
                    <div className="p-4 bg-white/10 rounded-2xl border border-white/10 backdrop-blur-md">
                      <p className="text-sm text-slate-200 italic font-medium">"Switching to local supplier saved you $45 this week."</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="h-24 bg-white/10 rounded-2xl border border-white/10 backdrop-blur-md flex flex-col items-center justify-center gap-2">
                        <Heart className="w-5 h-5 text-rose-500" />
                        <span className="text-[10px] font-bold uppercase tracking-widest text-white">Support</span>
                      </div>
                      <div className="h-24 bg-white/10 rounded-2xl border border-white/10 backdrop-blur-md flex flex-col items-center justify-center gap-2">
                        <Lock className="w-5 h-5 text-blue-400" />
                        <span className="text-[10px] font-bold uppercase tracking-widest text-white">Private</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </main>

      {/* Features Grid */}
      <section className="py-32 px-6 bg-white text-black rounded-[4rem] relative z-10">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <motion.div 
              whileHover={{ y: -10 }}
              className="space-y-6 group"
            >
              <div className="aspect-video rounded-3xl overflow-hidden mb-8 shadow-lg">
                <img 
                  src="https://picsum.photos/seed/privacy/600/400" 
                  alt="Privacy" 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="w-16 h-16 bg-slate-100 rounded-3xl flex items-center justify-center">
                <Shield className="w-8 h-8" />
              </div>
              <h3 className="text-3xl font-black uppercase italic tracking-tighter">Privacy First</h3>
              <p className="text-slate-500 leading-relaxed">
                No central databases. Your data stays on your device or decentralized storage. Auto-deletes every 24 hours.
              </p>
            </motion.div>

            <motion.div 
              whileHover={{ y: -10 }}
              className="space-y-6 group"
            >
              <div className="aspect-video rounded-3xl overflow-hidden mb-8 shadow-lg">
                <img 
                  src="https://picsum.photos/seed/ai-tech/600/400" 
                  alt="AI Intelligence" 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="w-16 h-16 bg-slate-100 rounded-3xl flex items-center justify-center">
                <Zap className="w-8 h-8" />
              </div>
              <h3 className="text-3xl font-black uppercase italic tracking-tighter">AI Intelligence</h3>
              <p className="text-slate-500 leading-relaxed">
                Smart budgeting, price comparison, and emotional support tailored to your financial condition.
              </p>
            </motion.div>

            <motion.div 
              whileHover={{ y: -10 }}
              className="space-y-6 group"
            >
              <div className="aspect-video rounded-3xl overflow-hidden mb-8 shadow-lg">
                <img 
                  src="https://picsum.photos/seed/community-support/600/400" 
                  alt="Global Network" 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="w-16 h-16 bg-slate-100 rounded-3xl flex items-center justify-center">
                <Globe className="w-8 h-8" />
              </div>
              <h3 className="text-3xl font-black uppercase italic tracking-tighter">Global Network</h3>
              <p className="text-slate-500 leading-relaxed">
                Connect with counselors and community members worldwide through secure, decentralized channels.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Login Modal */}
      <AnimatePresence>
        {showLogin && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowLogin(false)}
              className="absolute inset-0 bg-black/90 backdrop-blur-xl"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative max-w-md w-full bg-slate-900 border border-white/10 rounded-[3rem] p-8 md:p-12 shadow-2xl"
            >
              <div className="text-center mb-10">
                <h2 className="text-3xl font-black uppercase italic tracking-tighter mb-2">Join Resilience</h2>
                <p className="text-slate-400 text-sm">Access is limited to US & Europe</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => setRegion('US')}
                    className={`py-4 rounded-2xl font-bold border-2 transition-all ${
                      region === 'US' ? 'border-emerald-500 bg-emerald-500 text-black' : 'border-white/10 text-slate-400 hover:border-white/20'
                    }`}
                  >
                    US
                  </button>
                  <button
                    type="button"
                    onClick={() => setRegion('EU')}
                    className={`py-4 rounded-2xl font-bold border-2 transition-all ${
                      region === 'EU' ? 'border-emerald-500 bg-emerald-500 text-black' : 'border-white/10 text-slate-400 hover:border-white/20'
                    }`}
                  >
                    Europe
                  </button>
                </div>

                <div className="relative">
                  <Smartphone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Phone Number"
                    className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-2xl focus:border-emerald-500 outline-none transition-all text-white"
                  />
                </div>

                <label className="flex items-start gap-4 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={optIn}
                    onChange={(e) => setOptIn(e.target.checked)}
                    className="mt-1 w-6 h-6 rounded border-white/10 bg-white/5 text-emerald-500 focus:ring-emerald-500"
                  />
                  <span className="text-xs text-slate-400 leading-relaxed group-hover:text-slate-300 transition-colors">
                    I agree to share a small part of my internet connection to optimize the platform. My personal data remains private.
                  </span>
                </label>

                {error && <p className="text-rose-500 text-sm font-bold text-center">{error}</p>}

                <div className="space-y-4">
                  <button
                    type="submit"
                    className="w-full py-5 bg-emerald-500 text-black font-black rounded-2xl hover:bg-emerald-400 transition-all shadow-[0_0_30px_rgba(16,185,129,0.2)]"
                  >
                    Enter Platform
                  </button>

                  <div className="relative flex items-center justify-center py-2">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-white/10"></div>
                    </div>
                    <span className="relative px-4 bg-slate-900 text-[10px] font-bold uppercase tracking-widest text-slate-500">Or</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      // Temporary mock Google login
                      const mockUser: User = {
                        id: 'google_' + Math.random().toString(36).substr(2, 9),
                        phone: 'google-user@gmail.com',
                        region: 'US',
                        optInConnection: true,
                        displayName: 'Alex Rivers',
                        avatarUrl: `https://picsum.photos/seed/alex/100/100`,
                        bio: 'Financial resilience advocate.',
                      };
                      storage.setUser(mockUser);
                      onLogin(mockUser);
                    }}
                    className="w-full py-4 bg-white/5 border border-white/10 text-white font-bold rounded-2xl hover:bg-white/10 transition-all flex items-center justify-center gap-3"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path
                        fill="currentColor"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="currentColor"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="currentColor"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                      />
                      <path
                        fill="currentColor"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      />
                    </svg>
                    Continue with Google
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Footer */}
      <footer className="py-20 px-6 border-t border-white/5">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-2 opacity-50">
            <Shield className="w-5 h-5" />
            <span className="text-lg font-black tracking-tighter uppercase italic">Resilience</span>
          </div>
          <div className="flex gap-8 text-xs font-bold uppercase tracking-widest text-slate-500">
            <a href="#" className="hover:text-white transition-colors">Privacy</a>
            <a href="#" className="hover:text-white transition-colors">Terms</a>
            <a href="#" className="hover:text-white transition-colors">Security</a>
          </div>
          <p className="text-xs text-slate-600 font-bold uppercase tracking-widest">
            © 2026 Resilience Platform
          </p>
        </div>
      </footer>
    </div>
  );
}
