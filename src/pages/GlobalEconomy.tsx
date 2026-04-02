import React, { useState, useEffect } from 'react';
import { GoogleGenAI } from "@google/genai";
import { Globe, Play, Clock, TrendingUp, Search, RefreshCw, ExternalLink, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { formatDistanceToNow } from 'date-fns';
import { storage } from '../services/storage';

interface VideoData {
  title: string;
  url: string;
  thumbnail: string;
  channel: string;
  description: string;
  publishedAt?: string;
}

export default function GlobalEconomy() {
  const [videos, setVideos] = useState<VideoData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedVideo, setSelectedVideo] = useState<VideoData | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const getVideoId = (url: string) => {
    if (!url) return null;
    const regExp = /^.*(youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const getThumbnailUrl = (video: VideoData) => {
    const id = getVideoId(video.url);
    // hqdefault is much more reliable than maxresdefault
    if (id) return `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;
    return video.thumbnail || 'https://images.unsplash.com/photo-1611974714024-4607a55d67f3?w=800&auto=format&fit=crop&q=60';
  };

  const fetchVideos = async (query?: string) => {
    if (!query) {
      const cached = storage.getVideos();
      if (!cached) setLoading(true);
    } else {
      setLoading(true);
    }
    setError(null);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
      const prompt = query 
        ? `Find the top 8 MOST RECENT and REAL YouTube videos about: "${query}". 
           The videos MUST be specifically about financial news, economic states, or country-specific financial analysis.
           Focus on reputable financial news channels (e.g., Bloomberg, CNBC, Financial Times, Reuters, Wall Street Journal).`
        : `Find the top 8 MOST RECENT and TRENDING YouTube videos explaining the current financial state, economic crisis, or growth of different countries (e.g., USA, China, UK, Japan, emerging markets).
           Focus on real financial news and analytical content from reputable global financial channels.`;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [{ role: "user", parts: [{ text: prompt + `
          Return a JSON array of objects. 
          CRITICAL: The "url" MUST be a direct YouTube watch link (e.g., https://www.youtube.com/watch?v=...).
          
          Fields:
          - title: string
          - url: string
          - thumbnail: string (YouTube thumbnail URL)
          - channel: string (Channel name)
          - description: string (Short summary)
          - publishedAt: string (ISO date)
        ` }] }],
        config: {
          tools: [{ googleSearch: {} }],
          responseMimeType: "application/json",
          responseSchema: {
            type: "ARRAY",
            items: {
              type: "OBJECT",
              properties: {
                title: { type: "STRING" },
                url: { type: "STRING" },
                thumbnail: { type: "STRING" },
                channel: { type: "STRING" },
                description: { type: "STRING" },
                publishedAt: { type: "STRING" }
              },
              required: ["title", "url", "thumbnail", "channel", "description"]
            }
          }
        },
      });

      const data = JSON.parse(response.text);
      
      // Filter out invalid URLs
      const validVideos = data.filter((v: VideoData) => getVideoId(v.url) !== null);
      
      if (validVideos.length === 0) {
        setError('No relevant financial reports found for this query.');
      } else {
        setVideos(validVideos);
        if (!query) storage.saveVideos(validVideos);
      }
    } catch (err) {
      console.error('Failed to fetch videos:', err);
      if (videos.length === 0) {
        setError('Failed to connect to global intelligence. Please check your connection and try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      fetchVideos(searchQuery);
    }
  };

  useEffect(() => {
    const cached = storage.getVideos();
    if (cached) {
      setVideos(cached.videos);
      setLoading(false);
      if (Date.now() - cached.timestamp > 30 * 60 * 1000) {
        fetchVideos();
      }
    } else {
      fetchVideos();
    }
  }, []);

  const getEmbedUrl = (url: string) => {
    const id = getVideoId(url);
    return id ? `https://www.youtube.com/embed/${id}` : null;
  };

  return (
    <div className="space-y-12 pb-20">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-4 md:px-0">
        <div>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 md:w-12 md:h-12 bg-indigo-500 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Globe className="w-5 h-5 md:w-6 md:h-6 text-white" />
            </div>
            <span className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.3em] text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">Global Intelligence</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tighter uppercase italic leading-[0.85]">
            World <br />
            <span className="text-indigo-500">Economy</span>
          </h1>
          <p className="text-slate-500 mt-4 max-w-md font-medium text-sm md:text-base">
            Deep-dive video reports on the financial health and economic shifts of nations across the globe.
          </p>
        </div>
        <div className="flex flex-col gap-3 w-full md:w-auto">
          <form onSubmit={handleSearch} className="relative group">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search country or topic..."
              className="w-full md:w-80 px-5 md:px-6 py-3 bg-white border border-slate-200 rounded-xl md:rounded-2xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all pr-12"
            />
            <button 
              type="submit"
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-slate-400 hover:text-indigo-600 transition-colors"
            >
              <Search className="w-5 h-5" />
            </button>
          </form>
          <button 
            onClick={() => {
              setSearchQuery('');
              fetchVideos();
            }}
            disabled={loading}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-white border border-slate-200 rounded-xl md:rounded-2xl text-sm font-black uppercase italic tracking-tighter hover:bg-slate-50 transition-all disabled:opacity-50 group w-full md:w-auto"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-500'}`} />
            Refresh Reports
          </button>
        </div>
      </header>

      {/* Video Player Modal */}
      <AnimatePresence>
        {selectedVideo && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm"
            onClick={() => setSelectedVideo(null)}
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-slate-900 w-full max-w-6xl rounded-[2rem] md:rounded-[3rem] overflow-hidden shadow-2xl relative"
              onClick={e => e.stopPropagation()}
            >
              <button 
                onClick={() => setSelectedVideo(null)}
                className="absolute top-4 right-4 md:top-6 md:right-6 z-10 p-2 md:p-3 bg-black/40 hover:bg-black/60 text-white rounded-full backdrop-blur-md transition-all"
              >
                <X className="w-5 h-5 md:w-6 md:h-6" />
              </button>
              <div className="aspect-video w-full bg-black relative group/iframe">
                <iframe
                  src={`${getEmbedUrl(selectedVideo.url)}?autoplay=1&rel=0&modestbranding=1`}
                  title={selectedVideo.title}
                  className="w-full h-full relative z-10"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  loading="lazy"
                />
                <div className="absolute inset-0 flex items-center justify-center bg-slate-900">
                  <RefreshCw className="w-8 h-8 text-indigo-500 animate-spin" />
                </div>
              </div>
              <div className="p-6 md:p-10">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 md:w-10 md:h-10 bg-indigo-500/20 rounded-xl flex items-center justify-center">
                    <TrendingUp className="w-4 h-4 md:w-5 md:h-5 text-indigo-400" />
                  </div>
                  <span className="text-[10px] md:text-xs font-black uppercase tracking-widest text-indigo-400">{selectedVideo.channel}</span>
                </div>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-6 mb-4">
                  <h2 className="text-xl md:text-3xl font-black text-white tracking-tighter uppercase italic leading-tight group-hover:text-indigo-400 transition-colors">
                    {selectedVideo.title}
                  </h2>
                  <a 
                    href={selectedVideo.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 px-6 py-3 bg-white text-slate-900 rounded-xl md:rounded-2xl text-xs md:text-sm font-black uppercase italic tracking-tighter hover:bg-indigo-500 hover:text-white transition-all shrink-0"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Open in YouTube
                  </a>
                </div>
                <p className="text-slate-400 text-sm md:text-base font-medium leading-relaxed max-w-3xl">{selectedVideo.description}</p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Video Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 px-4 md:px-0">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-white rounded-[2rem] md:rounded-[3rem] overflow-hidden border border-slate-100 animate-pulse">
              <div className="aspect-video bg-slate-100" />
              <div className="p-6 md:p-8">
                <div className="w-24 h-3 bg-slate-100 rounded-full mb-4" />
                <div className="w-full h-6 bg-slate-100 rounded-lg mb-2" />
                <div className="w-2/3 h-6 bg-slate-100 rounded-lg" />
              </div>
            </div>
          ))
        ) : error ? (
          <div className="col-span-full py-12 md:py-20 text-center bg-rose-50 rounded-[2rem] md:rounded-[3rem] border border-rose-100 px-6">
            <p className="text-rose-500 font-black uppercase italic tracking-tighter text-lg md:text-xl">{error}</p>
            <button onClick={() => fetchVideos()} className="mt-4 text-rose-600 underline font-bold">Try again</button>
          </div>
        ) : (
          videos.map((video, index) => (
            <motion.div
              key={video.url}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="group bg-white rounded-[2rem] md:rounded-[3rem] overflow-hidden border border-slate-100 hover:border-indigo-200 hover:shadow-2xl hover:shadow-indigo-500/5 transition-all flex flex-col"
            >
              <div 
                className="relative aspect-video overflow-hidden cursor-pointer"
                onClick={() => setSelectedVideo(video)}
              >
                <img 
                  src={getThumbnailUrl(video)} 
                  alt={video.title} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    // Fallback to AI provided thumbnail if high-res fails
                    (e.target as HTMLImageElement).src = video.thumbnail;
                  }}
                />
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                  <div className="w-12 h-12 md:w-16 md:h-16 bg-white rounded-full flex items-center justify-center shadow-xl transform group-hover:scale-110 transition-transform">
                    <Play className="w-5 h-5 md:w-6 md:h-6 text-indigo-600 fill-indigo-600 ml-1" />
                  </div>
                </div>
                {video.publishedAt && (
                  <div className="absolute bottom-3 left-3 md:bottom-4 md:left-4 px-2 md:px-3 py-1 bg-black/60 backdrop-blur-md rounded-full text-[9px] md:text-[10px] font-bold text-white uppercase tracking-widest flex items-center gap-2">
                    <Clock className="w-3 h-3" />
                    {formatDistanceToNow(new Date(video.publishedAt), { addSuffix: true })}
                  </div>
                )}
              </div>

              <div className="p-6 md:p-8 flex-1 flex flex-col">
                <div className="flex items-center gap-2 mb-3 md:mb-4">
                  <TrendingUp className="w-3 h-3 md:w-4 md:h-4 text-indigo-500" />
                  <span className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-slate-400">{video.channel}</span>
                </div>

                <h2 className="text-xl md:text-2xl font-black text-slate-900 tracking-tighter uppercase italic leading-tight mb-3 md:mb-4 group-hover:text-indigo-600 transition-colors">
                  {video.title}
                </h2>

                <p className="text-slate-500 text-xs md:text-sm leading-relaxed mb-6 md:mb-8 line-clamp-2">
                  {video.description}
                </p>

                <div className="mt-auto flex gap-3">
                  <button 
                    onClick={() => setSelectedVideo(video)}
                    className="flex-1 flex items-center justify-center gap-2 py-3 md:py-4 bg-slate-900 text-white font-black uppercase italic tracking-tighter rounded-xl md:rounded-2xl hover:bg-indigo-600 transition-all text-sm"
                  >
                    Watch Report
                  </button>
                  <a 
                    href={video.url}
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

      {/* Footer Note */}
      <footer className="pt-12 border-t border-slate-100">
        <div className="flex items-center gap-4 text-slate-400">
          <Search className="w-5 h-5" />
          <p className="text-[10px] font-bold uppercase tracking-[0.2em]">
            Curated Global Economic Analysis • Powered by AI Intelligence & YouTube
          </p>
        </div>
      </footer>
    </div>
  );
}
