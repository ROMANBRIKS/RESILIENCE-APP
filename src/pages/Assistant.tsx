import React, { useState, useRef, useEffect } from 'react';
import { analyzeFinancialIntent } from '../services/gemini';
import { Send, Bot, User as UserIcon, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default function Assistant() {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: "Hello! I'm your Resilience AI. How can I help you save money or manage your budget today?" }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setLoading(true);

    try {
      const response = await analyzeFinancialIntent(userMessage);
      setMessages(prev => [...prev, { role: 'assistant', content: response }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'assistant', content: "I'm sorry, I encountered an error. Please try again." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
      <div className="p-8 border-b border-slate-100 bg-slate-50/50">
        <h2 className="text-2xl font-black uppercase italic tracking-tighter text-slate-900">AI Financial Assistant</h2>
        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mt-1">Privacy-first advice • No data stored</p>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-8 space-y-8 no-scrollbar">
        <AnimatePresence initial={false}>
          {messages.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
            >
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-sm ${
                msg.role === 'assistant' ? 'bg-slate-900 text-emerald-400' : 'bg-white border border-slate-100 text-slate-600'
              }`}>
                {msg.role === 'assistant' ? <Bot className="w-7 h-7" /> : <UserIcon className="w-7 h-7" />}
              </div>
              <div className={`max-w-[80%] p-6 rounded-[2rem] text-sm leading-relaxed shadow-sm ${
                msg.role === 'assistant' ? 'bg-slate-50 text-slate-900 border border-slate-100' : 'bg-slate-900 text-white'
              }`}>
                {msg.content}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        {loading && (
          <div className="flex gap-4">
            <div className="w-12 h-12 rounded-2xl bg-slate-900 text-emerald-400 flex items-center justify-center shadow-sm">
              <Bot className="w-7 h-7" />
            </div>
            <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100">
              <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
            </div>
          </div>
        )}
      </div>

      <form onSubmit={handleSend} className="p-8 border-t border-slate-100 bg-slate-50/50">
        <div className="relative">
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Ask about budgeting, saving, or finding cheaper alternatives..."
            className="w-full pl-8 pr-16 py-5 bg-white border-2 border-slate-100 rounded-[2rem] focus:border-slate-900 outline-none transition-all shadow-sm text-lg"
          />
          <button
            type="submit"
            disabled={loading}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-4 bg-slate-900 text-white rounded-2xl hover:bg-slate-800 transition-colors disabled:opacity-50 shadow-lg"
          >
            <Send className="w-6 h-6" />
          </button>
        </div>
      </form>
    </div>
  );
}
