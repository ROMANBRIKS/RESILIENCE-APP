import React, { useState } from 'react';
import { User } from '../types';
import { storage } from '../services/storage';
import { Shield, Smartphone, Globe, ArrowRight, CheckCircle2, Zap, Heart, Lock, Mail } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface LoginProps {
  onLogin: (user: User) => void;
}

export default function Login({ onLogin }: LoginProps) {
  const [showLogin, setShowLogin] = useState(false);
  const [phone, setPhone] = useState('');
  const [region, setRegion] = useState<'US' | 'EU' | 'CA' | 'AU' | 'FI' | 'CH'>('US');
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
      region: region as any,
      optInConnection: optIn,
    };

    storage.setUser(newUser);
    onLogin(newUser);
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-emerald-500 selection:text-black overflow-x-hidden font-sans">
      {/* Atmospheric Background */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,_rgba(242,125,38,0.1),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,_rgba(16,185,129,0.1),transparent_40%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_70%,_rgba(139,92,246,0.15),transparent_50%)]" />
        <img 
          src="https://picsum.photos/seed/vibrant/1920/1080?blur=10" 
          alt="Atmosphere" 
          className="w-full h-full object-cover opacity-40 mix-blend-overlay"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-black/40" />
      </div>

      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 px-4 md:px-8 py-4 md:py-8 flex justify-between items-center bg-black/20 backdrop-blur-md md:bg-transparent">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 md:w-8 md:h-8 bg-emerald-500 rounded-lg flex items-center justify-center">
            <Shield className="w-4 h-4 md:w-5 md:h-5 text-black" />
          </div>
          <span className="text-lg md:text-xl font-black tracking-tighter uppercase italic">Resilience</span>
        </div>
        
        <div className="hidden md:flex items-center gap-8 text-[11px] font-bold uppercase tracking-[0.2em] text-white/50">
          <a href="#" className="hover:text-white transition-colors">Home</a>
          <a href="#" className="hover:text-white transition-colors">Features</a>
          <a href="#" className="hover:text-white transition-colors">Intelligence</a>
          <a href="#" className="hover:text-white transition-colors">Contact</a>
        </div>

        <div className="flex items-center gap-3 md:gap-6">
          <button 
            onClick={() => setShowLogin(true)}
            className="text-[9px] md:text-[11px] font-bold uppercase tracking-[0.2em] text-white/50 hover:text-white transition-colors"
          >
            Sign In
          </button>
          <button 
            onClick={() => setShowLogin(true)}
            className="px-4 py-2 md:px-6 md:py-2.5 bg-white text-black text-[9px] md:text-[11px] font-black uppercase tracking-[0.1em] rounded-full hover:bg-emerald-500 transition-all active:scale-95 shadow-xl shadow-white/10"
          >
            Get Started
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="relative min-h-screen flex flex-col items-center justify-center px-6 pt-20">
        <div className="max-w-4xl w-full text-center relative z-10">
          {/* New Badge */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-3 px-4 py-1.5 bg-white/5 border border-white/10 rounded-full mb-12 backdrop-blur-md"
          >
            <span className="px-2 py-0.5 bg-white text-black text-[9px] font-black uppercase tracking-widest rounded-full">New</span>
            <span className="text-[10px] font-bold text-white/60 uppercase tracking-widest">Global Intelligence v2.0 is live</span>
          </motion.div>

          {/* Main Heading */}
          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-[12vw] md:text-[6rem] font-black leading-[0.9] tracking-tighter uppercase mb-6 md:mb-8"
          >
            Build <span className="font-serif italic font-light lowercase text-emerald-400">resilience</span> <br />
            with AI.
          </motion.h1>

          {/* Subtext */}
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-base md:text-xl text-white/40 max-w-2xl mx-auto leading-relaxed mb-8 md:mb-12 font-medium px-4"
          >
            Resilience helps communities manage financial shifts, reduce cost of living, and access real support with absolute privacy.
          </motion.p>

          {/* Email Input / CTA */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="max-w-md mx-auto relative group px-4"
          >
            <div className="flex flex-col md:flex-row p-1.5 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-2xl focus-within:border-emerald-500/50 transition-all gap-2">
              <div className="flex-1 flex items-center px-4 py-3 md:py-0 gap-3">
                <Mail className="w-4 h-4 text-white/30" />
                <input 
                  type="email" 
                  placeholder="Enter your email" 
                  className="w-full bg-transparent border-none outline-none text-sm font-medium placeholder:text-white/20"
                />
              </div>
              <button 
                onClick={() => setShowLogin(true)}
                className="w-full md:w-auto px-6 py-4 md:py-3 bg-white text-black text-xs font-black uppercase italic tracking-tighter rounded-xl hover:bg-emerald-500 transition-all shadow-xl shadow-white/5"
              >
                Get Started
              </button>
            </div>
          </motion.div>
        </div>

        {/* Abstract 3D Shape */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.8, y: 50 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 1.5, delay: 0.4, ease: "easeOut" }}
          className="mt-20 relative w-full max-w-4xl aspect-[2/1] flex items-center justify-center"
        >
          <div className="absolute inset-0 bg-emerald-500/10 blur-[120px] rounded-full" />
          <div className="relative w-full h-full flex items-center justify-center">
            <img 
              src="https://picsum.photos/seed/abstract-3d-vibrant/1200/600" 
              alt="Abstract Shape" 
              className="w-full h-full object-contain mix-blend-screen opacity-80"
              referrerPolicy="no-referrer"
            />
            {/* Glass Card Overlay */}
            <div className="absolute inset-0 border border-white/5 rounded-[4rem] bg-gradient-to-b from-white/5 to-transparent backdrop-blur-[2px]" />
          </div>
        </motion.div>
      </main>

      {/* Features Section - Brutalist/Minimal */}
      <section className="py-20 md:py-40 px-4 md:px-8 relative z-10">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-white/10 border border-white/10 rounded-[2rem] md:rounded-[3rem] overflow-hidden backdrop-blur-md">
            <div className="p-8 md:p-12 bg-black/40 hover:bg-black/60 transition-colors group">
              <div className="w-10 h-10 md:w-12 md:h-12 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center justify-center mb-6 md:mb-8 group-hover:bg-emerald-500 transition-all">
                <Shield className="w-5 h-5 md:w-6 md:h-6 text-emerald-500 group-hover:text-black transition-colors" />
              </div>
              <h3 className="text-xl md:text-2xl font-black uppercase italic tracking-tighter mb-3 md:mb-4">Privacy First</h3>
              <p className="text-white/40 text-xs md:text-sm leading-relaxed">
                No central databases. Your data stays on your device or decentralized storage. Auto-deletes every 24 hours.
              </p>
            </div>
            
            <div className="p-8 md:p-12 bg-black/40 hover:bg-black/60 transition-colors group">
              <div className="w-10 h-10 md:w-12 md:h-12 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center justify-center mb-6 md:mb-8 group-hover:bg-emerald-500 transition-all">
                <Zap className="w-5 h-5 md:w-6 md:h-6 text-emerald-500 group-hover:text-black transition-colors" />
              </div>
              <h3 className="text-xl md:text-2xl font-black uppercase italic tracking-tighter mb-3 md:mb-4">AI Intelligence</h3>
              <p className="text-white/40 text-xs md:text-sm leading-relaxed">
                Smart budgeting, price comparison, and emotional support tailored to your financial condition.
              </p>
            </div>

            <div className="p-8 md:p-12 bg-black/40 hover:bg-black/60 transition-colors group">
              <div className="w-10 h-10 md:w-12 md:h-12 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center justify-center mb-6 md:mb-8 group-hover:bg-emerald-500 transition-all">
                <Globe className="w-5 h-5 md:w-6 md:h-6 text-emerald-500 group-hover:text-black transition-colors" />
              </div>
              <h3 className="text-xl md:text-2xl font-black uppercase italic tracking-tighter mb-3 md:mb-4">Global Network</h3>
              <p className="text-white/40 text-xs md:text-sm leading-relaxed">
                Connect with counselors and community members worldwide through secure, decentralized channels.
              </p>
            </div>
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
                <p className="text-slate-400 text-sm">Now available in US, EU, CA, AU, FI & CH</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-3 gap-3">
                  <button
                    type="button"
                    onClick={() => setRegion('US')}
                    className={`py-3 rounded-xl text-xs font-bold border-2 transition-all ${
                      region === 'US' ? 'border-emerald-500 bg-emerald-500 text-black' : 'border-white/10 text-slate-400 hover:border-white/20'
                    }`}
                  >
                    US
                  </button>
                  <button
                    type="button"
                    onClick={() => setRegion('EU')}
                    className={`py-3 rounded-xl text-xs font-bold border-2 transition-all ${
                      region === 'EU' ? 'border-emerald-500 bg-emerald-500 text-black' : 'border-white/10 text-slate-400 hover:border-white/20'
                    }`}
                  >
                    Europe
                  </button>
                  <button
                    type="button"
                    onClick={() => setRegion('CA')}
                    className={`py-3 rounded-xl text-xs font-bold border-2 transition-all ${
                      region === 'CA' ? 'border-emerald-500 bg-emerald-500 text-black' : 'border-white/10 text-slate-400 hover:border-white/20'
                    }`}
                  >
                    Canada
                  </button>
                  <button
                    type="button"
                    onClick={() => setRegion('AU')}
                    className={`py-3 rounded-xl text-xs font-bold border-2 transition-all ${
                      region === 'AU' ? 'border-emerald-500 bg-emerald-500 text-black' : 'border-white/10 text-slate-400 hover:border-white/20'
                    }`}
                  >
                    Australia
                  </button>
                  <button
                    type="button"
                    onClick={() => setRegion('FI')}
                    className={`py-3 rounded-xl text-xs font-bold border-2 transition-all ${
                      region === 'FI' ? 'border-emerald-500 bg-emerald-500 text-black' : 'border-white/10 text-slate-400 hover:border-white/20'
                    }`}
                  >
                    Finland
                  </button>
                  <button
                    type="button"
                    onClick={() => setRegion('CH')}
                    className={`py-3 rounded-xl text-xs font-bold border-2 transition-all ${
                      region === 'CH' ? 'border-emerald-500 bg-emerald-500 text-black' : 'border-white/10 text-slate-400 hover:border-white/20'
                    }`}
                  >
                    Switzerland
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
      <footer className="py-20 px-8 border-t border-white/5">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-12">
          <div className="flex items-center gap-2 opacity-30">
            <Shield className="w-5 h-5" />
            <span className="text-lg font-black tracking-tighter uppercase italic">Resilience</span>
          </div>
          
          <div className="flex gap-12 text-[10px] font-bold uppercase tracking-[0.3em] text-white/20">
            <a href="#" className="hover:text-white transition-colors">Privacy</a>
            <a href="#" className="hover:text-white transition-colors">Terms</a>
            <a href="#" className="hover:text-white transition-colors">Security</a>
          </div>

          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/10">
            © 2026 Resilience Platform
          </p>
        </div>
      </footer>
    </div>
  );
}
