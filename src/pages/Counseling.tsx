import { useState } from 'react';
import { HeartHandshake, MessageCircle, Briefcase, HelpCircle, ArrowRight, ExternalLink } from 'lucide-react';
import { motion } from 'motion/react';

export default function Counseling() {
  const [submitted, setSubmitted] = useState(false);

  const supportTypes = [
    { id: 'financial', icon: HeartHandshake, title: 'Financial Help', desc: 'Debt advice, budgeting, and emergency funds.' },
    { id: 'emotional', icon: MessageCircle, title: 'Emotional Support', desc: 'Mental health resources and peer counseling.' },
    { id: 'job', icon: Briefcase, title: 'Job & Gig Assistance', desc: 'Find immediate work or skill-building opportunities.' },
  ];

  if (submitted) {
    return (
      <div className="max-w-2xl mx-auto text-center space-y-8 py-12">
        <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
          <HeartHandshake className="w-10 h-10" />
        </div>
        <h2 className="text-3xl font-bold text-slate-900">We're here for you</h2>
        <p className="text-lg text-slate-600 leading-relaxed">
          We connect you with counselors worldwide for faster, flexible support across time zones.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <a 
            href="https://t.me/resilience_support" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-3 p-6 bg-[#0088cc] text-white rounded-3xl font-bold hover:opacity-90 transition-opacity"
          >
            Join Telegram <ExternalLink className="w-5 h-5" />
          </a>
          <a 
            href="https://wa.me/resilience_support" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-3 p-6 bg-[#25D366] text-white rounded-3xl font-bold hover:opacity-90 transition-opacity"
          >
            Join WhatsApp <ExternalLink className="w-5 h-5" />
          </a>
        </div>

        <div className="p-6 bg-slate-50 rounded-3xl text-left">
          <h4 className="font-bold text-slate-900 mb-2">What happens next?</h4>
          <ul className="space-y-3 text-sm text-slate-600">
            <li className="flex gap-3">
              <span className="w-5 h-5 rounded-full bg-slate-900 text-white flex items-center justify-center shrink-0 text-[10px]">1</span>
              Join the group using one of the links above.
            </li>
            <li className="flex gap-3">
              <span className="w-5 h-5 rounded-full bg-slate-900 text-white flex items-center justify-center shrink-0 text-[10px]">2</span>
              Read the pinned instructions in the group.
            </li>
            <li className="flex gap-3">
              <span className="w-5 h-5 rounded-full bg-slate-900 text-white flex items-center justify-center shrink-0 text-[10px]">3</span>
              An admin or counselor will follow up for a private conversation.
            </li>
          </ul>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-12 md:space-y-16 px-4 md:px-0">
      <header className="text-center space-y-4">
        <h2 className="text-3xl md:text-5xl font-black uppercase italic tracking-tighter text-slate-900">Support & Counseling</h2>
        <p className="text-[9px] md:text-[10px] font-bold uppercase tracking-[0.3em] text-slate-400 mt-1 max-w-2xl mx-auto px-4">
          Access global support networks • Connect with real people
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
        {supportTypes.map((type) => (
          <motion.button
            key={type.id}
            whileHover={{ y: -10 }}
            onClick={() => setSubmitted(true)}
            className="p-8 md:p-10 bg-white rounded-[2rem] md:rounded-[3rem] border border-slate-100 shadow-sm text-left group hover:border-slate-900 hover:shadow-2xl transition-all duration-500"
          >
            <div className="w-12 h-12 md:w-16 md:h-16 rounded-2xl bg-slate-50 text-slate-900 flex items-center justify-center mb-6 md:mb-8 group-hover:bg-slate-900 group-hover:text-emerald-400 transition-all duration-500 shadow-sm">
              <type.icon className="w-6 h-6 md:w-8 md:h-8" />
            </div>
            <h3 className="text-xl md:text-2xl font-black uppercase italic tracking-tighter text-slate-900 mb-3 leading-tight">{type.title}</h3>
            <p className="text-slate-400 text-[10px] md:text-[11px] font-bold uppercase tracking-wider leading-relaxed mb-6 md:mb-8">{type.desc}</p>
            <div className="flex items-center gap-3 text-[11px] md:text-xs font-black uppercase italic tracking-tighter text-slate-900 group-hover:translate-x-2 transition-transform">
              Get Started <ArrowRight className="w-4 h-4 md:w-5 md:h-5" />
            </div>
          </motion.button>
        ))}
      </div>

      <section className="bg-slate-900 rounded-[2.5rem] md:rounded-[4rem] p-8 md:p-16 text-white relative overflow-hidden group cursor-pointer shadow-2xl shadow-slate-900/20">
        <div className="relative z-10 max-w-2xl">
          <h3 className="text-2xl md:text-4xl font-black uppercase italic tracking-tighter mb-4 md:mb-6 leading-tight">Emergency Support?</h3>
          <p className="text-slate-400 text-base md:text-lg font-medium mb-8 md:mb-10 leading-relaxed max-w-lg">
            If you are in immediate financial or emotional crisis, our rapid-response team is available 24/7 via our decentralized network.
          </p>
          <button 
            onClick={() => setSubmitted(true)}
            className="w-full md:w-auto px-8 md:px-10 py-4 md:py-5 bg-emerald-400 text-black font-black uppercase italic tracking-tighter text-xs md:text-sm rounded-xl md:rounded-2xl hover:bg-emerald-300 transition-all shadow-xl shadow-emerald-400/20"
          >
            Contact Emergency Team
          </button>
        </div>
        <HelpCircle className="absolute -right-12 md:-right-16 -bottom-12 md:-bottom-16 w-40 md:w-80 h-40 md:h-80 text-white/5 rotate-12 group-hover:scale-110 transition-transform duration-1000" />
      </section>
    </div>
  );
}
