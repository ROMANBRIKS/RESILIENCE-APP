import React, { useState, useEffect } from 'react';
import { GoogleGenAI } from "@google/genai";
import { 
  Newspaper, 
  Play, 
  Clock, 
  TrendingUp, 
  Search, 
  RefreshCw, 
  ExternalLink, 
  X,
  Globe,
  Youtube,
  Video,
  BookOpen,
  ArrowRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { formatDistanceToNow } from 'date-fns';
import { storage } from '../services/storage';
import { IntelligenceItem } from '../types';
import { cn } from '../lib/utils';
import { VideoPlayer } from '../components/VideoPlayer';

type Tab = 'article' | 'video';
type Platform = 'all' | 'youtube' | 'rumble';

export default function Intelligence() {
  const user = storage.getUser();
  const [activeTab, setActiveTab] = useState<Tab>('video');
  const [platformFilter, setPlatformFilter] = useState<Platform>('all');
  const [items, setItems] = useState<IntelligenceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<IntelligenceItem | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchIntelligence = async (query?: string) => {
    setLoading(true);
    setError(null);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
      
      let prompt = '';
      if (activeTab === 'video') {
        prompt = query 
          ? `Find the top 10 MOST RECENT and REAL videos about: "${query}". 
             STRICTLY include videos from ONLY YouTube and Rumble. 
             CRITICAL: You MUST use the Google Search tool to find ACTUAL, LIVE video links. 
             DO NOT invent or guess URLs. Every URL must be a real, playable link from the search results.
             Ensure the "title" EXACTLY reflects the actual video title on the platform.
             The videos MUST be specifically about financial news, economic states, or resilience strategies.`
          : `Find the top 10 MOST RECENT and TRENDING videos explaining the current global financial state, economic crisis, or growth strategies.
             STRICTLY include a mix of YouTube and Rumble videos ONLY.
             CRITICAL: You MUST use the Google Search tool to find ACTUAL, LIVE video links. 
             DO NOT invent or guess URLs. Every URL must be a real, playable link from the search results.
             Ensure the "title" EXACTLY reflects the actual video title on the platform.
             Focus on real financial news and analytical content from reputable global financial channels.`;
      } else {
        const userRegion = user?.region || 'Global';
        prompt = query
          ? `Find the top 10 MOST RECENT and RELEVANT articles about: "${query}".
             Focus on financial resilience, economic news, and practical money management.
             Use reputable news sources like Bloomberg, Financial Times, Reuters, etc.
             For each article, provide a "personalizedSummary" that explains how this news affects someone living in ${userRegion}.`
          : `Find the top 10 MOST RECENT and IMPORTANT financial news articles and resilience guides.
             Focus on global economic shifts, inflation protection, and wealth preservation strategies.
             Use reputable news sources like Bloomberg, Financial Times, Reuters, etc.
             For each article, provide a "personalizedSummary" that explains how this news affects someone living in ${userRegion}.`;
      }

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [{ role: "user", parts: [{ text: prompt + `
          Return a JSON array of objects. 
          
          Fields for videos:
          - id: string (unique)
          - title: string (EXACT platform title)
          - url: string (Direct link)
          - thumbnail: string (Image URL)
          - source: string (Source name)
          - snippet: string (Short summary)
          - date: string (ISO date)
          - platform: "youtube" | "rumble"
          - type: "video"
          
          Fields for articles:
          - id: string (unique)
          - title: string
          - url: string (Direct link)
          - thumbnail: string (Image URL)
          - source: string (Source name)
          - snippet: string (Short summary)
          - personalizedSummary: string (How it affects the user in their region)
          - date: string (ISO date)
          - platform: "article"
          - type: "article"
        ` }] }],
        config: {
          tools: [{ googleSearch: {} }],
          responseMimeType: "application/json",
          responseSchema: {
            type: "ARRAY",
            items: {
              type: "OBJECT",
              properties: {
                id: { type: "STRING" },
                title: { type: "STRING" },
                url: { type: "STRING" },
                thumbnail: { type: "STRING" },
                source: { type: "STRING" },
                snippet: { type: "STRING" },
                personalizedSummary: { type: "STRING" },
                date: { type: "STRING" },
                platform: { type: "STRING", enum: ["youtube", "rumble", "article"] },
                type: { type: "STRING", enum: ["video", "article"] }
              },
              required: ["id", "title", "url", "snippet", "platform", "type"]
            }
          }
        },
      });

      const data = JSON.parse(response.text);
      setItems(data);
      if (!query) storage.saveIntelligence(activeTab, data);
    } catch (err) {
      console.error('Failed to fetch intelligence:', err);
      setError('Failed to connect to global intelligence. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const cached = storage.getIntelligence(activeTab);
    if (cached && Date.now() - cached.timestamp < 30 * 60 * 1000) {
      setItems(cached.items);
      setLoading(false);
    } else {
      fetchIntelligence();
    }
  }, [activeTab]);

  const filteredItems = items.filter(item => {
    if (activeTab === 'article') return true;
    if (platformFilter === 'all') return true;
    return item.platform === platformFilter;
  });

  const featuredItem = activeTab === 'video' && !searchQuery && filteredItems.length > 0 ? filteredItems[0] : null;
  const displayItems = featuredItem ? filteredItems.slice(1) : filteredItems;

  return (
    <div className="space-y-8 pb-24 md:pb-12">
      {/* Header Section */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-4 md:px-0">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 md:w-12 md:h-12 bg-indigo-500 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <TrendingUp className="w-5 h-5 md:w-6 md:h-6 text-white" />
            </div>
            <span className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.3em] text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">Intelligence Hub</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tighter uppercase italic leading-[0.85]">
            Global <br />
            <span className="text-indigo-500">Intelligence</span>
          </h1>
          <p className="text-slate-500 mt-4 max-w-md font-medium text-sm md:text-base">
            Curated financial news, economic reports, and resilience strategies from around the world.
          </p>
        </div>

        <div className="flex flex-col gap-3 w-full md:w-auto">
          <form onSubmit={(e) => { e.preventDefault(); fetchIntelligence(searchQuery); }} className="relative group">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={`Search ${activeTab}...`}
              className="w-full md:w-80 px-5 md:px-6 py-3 bg-white border border-slate-200 rounded-xl md:rounded-2xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all pr-12"
            />
            <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-slate-400 hover:text-indigo-600">
              <Search className="w-5 h-5" />
            </button>
          </form>
          
          <div className="flex bg-white p-1 rounded-xl md:rounded-2xl border border-slate-200 shadow-sm">
            <button
              onClick={() => setActiveTab('article')}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-lg md:rounded-xl text-xs font-black uppercase italic tracking-tighter transition-all",
                activeTab === 'article' ? "bg-slate-900 text-white" : "text-slate-400 hover:text-slate-600"
              )}
            >
              <BookOpen className="w-4 h-4" />
              Articles
            </button>
            <button
              onClick={() => setActiveTab('video')}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-lg md:rounded-xl text-xs font-black uppercase italic tracking-tighter transition-all",
                activeTab === 'video' ? "bg-slate-900 text-white" : "text-slate-400 hover:text-slate-600"
              )}
            >
              <Video className="w-4 h-4" />
              Videos
            </button>
          </div>
        </div>
      </header>

      {/* Platform Filter for Videos */}
      {activeTab === 'video' && (
        <div className="flex gap-2 px-4 md:px-0 overflow-x-auto no-scrollbar pb-2">
          {(['all', 'youtube', 'rumble'] as Platform[]).map((p) => (
            <button
              key={p}
              onClick={() => setPlatformFilter(p)}
              className={cn(
                "px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap border",
                platformFilter === p 
                  ? "bg-indigo-500 text-white border-indigo-500 shadow-lg shadow-indigo-500/20" 
                  : "bg-white text-slate-400 border-slate-200 hover:border-indigo-200 hover:text-indigo-500"
              )}
            >
              {p === 'youtube' && <Youtube className="w-3 h-3 inline-block mr-1" />}
              {p}
            </button>
          ))}
        </div>
      )}

      {/* Content Grid */}
      <div className="px-4 md:px-0 space-y-8">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-white rounded-[2rem] md:rounded-[3rem] overflow-hidden border border-slate-100 animate-pulse h-96" />
            ))}
          </div>
        ) : error ? (
          <div className="py-12 md:py-20 text-center bg-rose-50 rounded-[2rem] md:rounded-[3rem] border border-rose-100 px-6">
            <p className="text-rose-500 font-black uppercase italic tracking-tighter text-lg md:text-xl">{error}</p>
            <button onClick={() => fetchIntelligence()} className="mt-4 text-rose-600 underline font-bold">Try again</button>
          </div>
        ) : (
          <>
            {/* Featured Hero Section */}
            {featuredItem && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="relative group bg-slate-900 rounded-[2.5rem] md:rounded-[4rem] overflow-hidden border border-slate-800 shadow-2xl shadow-indigo-500/10"
              >
                <div className="flex flex-col lg:flex-row">
                  <div 
                    className="lg:w-3/5 aspect-video relative cursor-pointer overflow-hidden"
                    onClick={() => setSelectedItem(featuredItem)}
                  >
                    <img 
                      src={featuredItem.thumbnail || `https://picsum.photos/seed/${featuredItem.id}/1280/720`} 
                      alt={featuredItem.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent opacity-60" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-20 h-20 md:w-24 md:h-24 bg-white/10 backdrop-blur-xl rounded-full flex items-center justify-center border border-white/20 transform group-hover:scale-110 transition-transform">
                        <Play className="w-8 h-8 md:w-10 md:h-10 text-white fill-white ml-1" />
                      </div>
                    </div>
                    <div className="absolute top-6 left-6 flex gap-3">
                      <span className="px-4 py-2 bg-indigo-500 text-white text-[10px] font-black uppercase tracking-widest rounded-full shadow-lg">Featured Report</span>
                      <span className={cn(
                        "px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest text-white backdrop-blur-md flex items-center gap-2",
                        featuredItem.platform === 'youtube' ? "bg-red-600/80" : "bg-emerald-600/80"
                      )}>
                        {featuredItem.platform === 'youtube' ? <Youtube className="w-3 h-3" /> : <Video className="w-3 h-3" />}
                        {featuredItem.platform}
                      </span>
                    </div>
                  </div>
                  <div className="lg:w-2/5 p-8 md:p-12 flex flex-col justify-center">
                    <div className="flex items-center gap-3 mb-6">
                      <Globe className="w-4 h-4 text-indigo-400" />
                      <span className="text-xs font-black uppercase tracking-widest text-slate-400">{featuredItem.source}</span>
                    </div>
                    <h2 className="text-3xl md:text-5xl font-black text-white tracking-tighter uppercase italic leading-[0.9] mb-6">
                      {featuredItem.title}
                    </h2>
                    <p className="text-slate-400 text-sm md:text-base font-medium leading-relaxed mb-8 line-clamp-3">
                      {featuredItem.snippet}
                    </p>
                    <button 
                      onClick={() => setSelectedItem(featuredItem)}
                      className="w-full md:w-auto px-10 py-5 bg-white text-slate-900 rounded-2xl font-black uppercase italic tracking-tighter hover:bg-indigo-500 hover:text-white transition-all flex items-center justify-center gap-3"
                    >
                      Watch Full Intelligence Briefing
                      <ArrowRight className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Grid Items */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
              {displayItems.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="group bg-white rounded-[2rem] md:rounded-[3rem] overflow-hidden border border-slate-100 hover:border-indigo-200 hover:shadow-2xl hover:shadow-indigo-500/5 transition-all flex flex-col"
                >
                  <div 
                    className="relative aspect-video overflow-hidden cursor-pointer"
                    onClick={() => item.type === 'video' ? setSelectedItem(item) : window.open(item.url, '_blank')}
                  >
                    <img 
                      src={item.thumbnail || `https://picsum.photos/seed/${item.id}/800/450`} 
                      alt={item.title} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      referrerPolicy="no-referrer"
                    />
                    {item.type === 'video' ? (
                      <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                        <div className="w-12 h-12 md:w-16 md:h-16 bg-white rounded-full flex items-center justify-center shadow-xl transform group-hover:scale-110 transition-transform">
                          <Play className="w-5 h-5 md:w-6 md:h-6 text-indigo-600 fill-indigo-600 ml-1" />
                        </div>
                      </div>
                    ) : (
                      <div className="absolute inset-0 bg-black/10 group-hover:bg-black/30 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                        <div className="px-6 py-3 bg-white rounded-full flex items-center gap-2 shadow-xl">
                          <BookOpen className="w-4 h-4 text-indigo-600" />
                          <span className="text-xs font-black uppercase italic tracking-tighter">Read Article</span>
                        </div>
                      </div>
                    )}
                    
                    <div className="absolute top-4 left-4 flex gap-2">
                      <span className={cn(
                        "px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest text-white backdrop-blur-md flex items-center gap-1.5",
                        item.platform === 'youtube' ? "bg-red-600/90" : 
                        item.platform === 'rumble' ? "bg-emerald-600/90" : "bg-indigo-600/90"
                      )}>
                        {item.platform === 'youtube' && <Youtube className="w-3 h-3" />}
                        {item.platform === 'rumble' && <Video className="w-3 h-3" />}
                        {item.platform}
                      </span>
                      {item.date && (new Date().getTime() - new Date(item.date).getTime() < 24 * 60 * 60 * 1000) && (
                        <span className="px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest text-white bg-rose-600/90 backdrop-blur-md animate-pulse">
                          Live / New
                        </span>
                      )}
                    </div>

                    {item.date && (
                      <div className="absolute bottom-3 left-3 md:bottom-4 md:left-4 px-2 md:px-3 py-1 bg-black/60 backdrop-blur-md rounded-full text-[9px] md:text-[10px] font-bold text-white uppercase tracking-widest flex items-center gap-2">
                        <Clock className="w-3 h-3" />
                        {formatDistanceToNow(new Date(item.date), { addSuffix: true })}
                      </div>
                    )}
                  </div>

                  <div className="p-6 md:p-8 flex-1 flex flex-col">
                    <div className="flex items-center gap-2 mb-3 md:mb-4">
                      <Globe className="w-3 h-3 md:w-4 md:h-4 text-indigo-500" />
                      <span className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-slate-400">
                        {item.source}
                      </span>
                    </div>

                    <h2 className="text-xl md:text-2xl font-black text-slate-900 tracking-tighter uppercase italic leading-tight mb-3 md:mb-4 group-hover:text-indigo-600 transition-colors">
                      {item.title}
                    </h2>

                    <p className="text-slate-500 text-xs md:text-sm leading-relaxed mb-6 md:mb-8 line-clamp-2">
                      {item.snippet}
                    </p>

                    {item.type === 'article' && item.personalizedSummary && (
                      <div className="mb-6 p-4 bg-indigo-50 rounded-2xl border border-indigo-100">
                        <div className="flex items-center gap-2 mb-2">
                          <TrendingUp className="w-3 h-3 text-indigo-600" />
                          <span className="text-[10px] font-black uppercase tracking-widest text-indigo-600">How it affects you ({user?.region || 'Global'})</span>
                        </div>
                        <p className="text-xs text-slate-600 font-medium leading-relaxed italic">
                          "{item.personalizedSummary}"
                        </p>
                      </div>
                    )}

                    <div className="mt-auto flex gap-3">
                      <button 
                        onClick={() => item.type === 'video' ? setSelectedItem(item) : window.open(item.url, '_blank')}
                        className="flex-1 flex items-center justify-center gap-2 py-3 md:py-4 bg-slate-900 text-white font-black uppercase italic tracking-tighter rounded-xl md:rounded-2xl hover:bg-indigo-600 transition-all text-sm"
                      >
                        {item.type === 'video' ? 'Watch Report' : 'Read Full Story'}
                        <ArrowRight className="w-4 h-4" />
                      </button>
                      <a 
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-3 md:p-4 bg-slate-50 text-slate-400 rounded-xl md:rounded-2xl hover:bg-slate-100 hover:text-slate-900 transition-all"
                      >
                        <ExternalLink className="w-4 h-4 md:w-5 md:h-5" />
                      </a>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </>
        )}
      </div>

      <VideoPlayer 
        item={selectedItem}
        onClose={() => setSelectedItem(null)}
        onReportBroken={() => {
          setSelectedItem(null);
          fetchIntelligence(searchQuery);
        }}
      />

      {/* Footer */}
      <footer className="pt-12 border-t border-slate-100 px-4 md:px-0">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4 text-slate-400">
            <Globe className="w-5 h-5" />
            <p className="text-[10px] font-bold uppercase tracking-[0.2em]">
              Curated Global Intelligence • Powered by AI & Multi-Platform Search
            </p>
          </div>
          <div className="flex items-center gap-6">
            <Youtube className="w-5 h-5 text-slate-300" />
            <Video className="w-5 h-5 text-slate-300" />
            <Newspaper className="w-5 h-5 text-slate-300" />
          </div>
        </div>
      </footer>
    </div>
  );
}
