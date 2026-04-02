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
  const [iframeLoading, setIframeLoading] = useState(true);
  const [playerKey, setPlayerKey] = useState(0);

  const getVideoId = (url: string, platform: string) => {
    if (!url) return null;
    if (platform === 'youtube') {
      const regExp = /^.*(youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
      const match = url.match(regExp);
      return (match && match[2].length === 11) ? match[2] : null;
    } else if (platform === 'rumble') {
      // Enhanced Rumble ID extraction
      // Captures the alphanumeric ID following /v/ or /embed/ or just /v
      // Example: https://rumble.com/v50...-title.html -> v50...
      const match = url.match(/rumble\.com\/(?:embed\/|v\/|v)?([a-z0-9]+)/i);
      return match ? match[1] : null;
    }
    return null;
  };

  const getEmbedUrl = (item: IntelligenceItem) => {
    const id = getVideoId(item.url, item.platform);
    if (!id) return null;
    if (item.platform === 'youtube') return `https://www.youtube.com/embed/${id}?autoplay=1&rel=0&modestbranding=1&enablejsapi=1`;
    if (item.platform === 'rumble') return `https://rumble.com/embed/${id}/?autoplay=1`;
    return null;
  };

  // Reset iframe loading when selected item or playerKey changes
  useEffect(() => {
    if (selectedItem) {
      setIframeLoading(true);
    }
  }, [selectedItem, playerKey]);

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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 px-4 md:px-0">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-white rounded-[2rem] md:rounded-[3rem] overflow-hidden border border-slate-100 animate-pulse h-96" />
          ))
        ) : error ? (
          <div className="col-span-full py-12 md:py-20 text-center bg-rose-50 rounded-[2rem] md:rounded-[3rem] border border-rose-100 px-6">
            <p className="text-rose-500 font-black uppercase italic tracking-tighter text-lg md:text-xl">{error}</p>
            <button onClick={() => fetchIntelligence()} className="mt-4 text-rose-600 underline font-bold">Try again</button>
          </div>
        ) : (
          filteredItems.map((item, index) => (
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
          ))
        )}
      </div>

      <AnimatePresence>
        {selectedItem && selectedItem.type === 'video' && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm"
            onClick={() => setSelectedItem(null)}
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-slate-900 w-full max-w-6xl rounded-[2rem] md:rounded-[3rem] overflow-hidden shadow-2xl relative"
              onClick={e => e.stopPropagation()}
            >
              <button 
                onClick={() => setSelectedItem(null)}
                className="absolute top-4 right-4 md:top-6 md:right-6 z-30 p-2 md:p-3 bg-black/40 hover:bg-black/60 text-white rounded-full backdrop-blur-md transition-all"
              >
                <X className="w-5 h-5 md:w-6 md:h-6" />
              </button>
              
              <div className="aspect-video w-full bg-black relative">
                {getEmbedUrl(selectedItem) ? (
                  <>
                    <iframe
                      key={playerKey}
                      src={getEmbedUrl(selectedItem)}
                      title={selectedItem.title}
                      className="w-full h-full relative z-10"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
                      allowFullScreen
                      onLoad={() => setIframeLoading(false)}
                      referrerPolicy="no-referrer-when-downgrade"
                    />
                    {iframeLoading && (
                      <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900 z-20">
                        <RefreshCw className="w-10 h-10 text-indigo-500 animate-spin mb-4" />
                        <p className="text-slate-400 text-xs font-black uppercase tracking-[0.2em]">Establishing Secure Connection...</p>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900 p-8 text-center">
                    <Video className="w-16 h-16 text-slate-700 mb-6" />
                    <h3 className="text-2xl font-black text-white uppercase italic tracking-tighter mb-4">Playback Restriction</h3>
                    <p className="text-slate-400 text-sm md:text-base mb-8 max-w-md">
                      This specific video platform has restricted direct playback within third-party apps. 
                      You can still watch the full report directly on their platform.
                    </p>
                    <a 
                      href={selectedItem.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-10 py-4 bg-indigo-600 text-white rounded-2xl font-black uppercase italic tracking-tighter hover:bg-indigo-500 transition-all flex items-center gap-3"
                    >
                      Watch on {selectedItem.platform}
                      <ExternalLink className="w-5 h-5" />
                    </a>
                  </div>
                )}
              </div>

              <div className="p-6 md:p-10">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 md:w-10 md:h-10 bg-indigo-500/20 rounded-xl flex items-center justify-center">
                    <TrendingUp className="w-4 h-4 md:w-5 md:h-5 text-indigo-400" />
                  </div>
                  <span className="text-[10px] md:text-xs font-black uppercase tracking-widest text-indigo-400">
                    {selectedItem.source}
                  </span>
                </div>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-6 mb-4">
                  <h2 className="text-xl md:text-3xl font-black text-white tracking-tighter uppercase italic leading-tight">
                    {selectedItem.title}
                  </h2>
                  <div className="flex gap-3 shrink-0">
                    <button 
                      onClick={() => setPlayerKey(prev => prev + 1)}
                      className="flex items-center justify-center gap-2 px-6 py-3 bg-slate-800 text-white rounded-xl md:rounded-2xl text-xs md:text-sm font-black uppercase italic tracking-tighter hover:bg-slate-700 transition-all"
                    >
                      <RefreshCw className={cn("w-4 h-4", iframeLoading && "animate-spin")} />
                      Refresh
                    </button>
                    <button 
                      onClick={() => {
                        setSelectedItem(null);
                        fetchIntelligence(searchQuery); // Refresh to get better links
                      }}
                      className="flex items-center justify-center gap-2 px-6 py-3 bg-rose-600 text-white rounded-xl md:rounded-2xl text-xs md:text-sm font-black uppercase italic tracking-tighter hover:bg-rose-500 transition-all"
                    >
                      <X className="w-4 h-4" />
                      Report Broken
                    </button>
                    <a 
                      href={selectedItem.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 px-6 py-3 bg-white text-slate-900 rounded-xl md:rounded-2xl text-xs md:text-sm font-black uppercase italic tracking-tighter hover:bg-indigo-500 hover:text-white transition-all"
                    >
                      <ExternalLink className="w-4 h-4" />
                      Open in {selectedItem.platform}
                    </a>
                  </div>
                </div>
                <p className="text-slate-400 text-sm md:text-base font-medium leading-relaxed max-w-3xl">{selectedItem.snippet}</p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

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
