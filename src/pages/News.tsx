import React, { useState, useEffect } from 'react';
import { GoogleGenAI } from "@google/genai";
import { Newspaper, Play, Clock, TrendingUp, Search, RefreshCw, ExternalLink, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { formatDistanceToNow } from 'date-fns';
import { storage } from '../services/storage';
import { NewsArticle } from '../types';

export default function News() {
  const [news, setNews] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedVideo, setSelectedVideo] = useState<NewsArticle | null>(null);

  const getVideoId = (url: string) => {
    if (!url) return null;
    const regExp = /^.*(youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const getThumbnailUrl = (video: NewsArticle) => {
    const id = getVideoId(video.url);
    if (id) return `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;
    return video.thumbnail || 'https://images.unsplash.com/photo-1611974714024-4607a55d67f3?w=800&auto=format&fit=crop&q=60';
  };

  const getEmbedUrl = (url: string) => {
    const id = getVideoId(url);
    return id ? `https://www.youtube.com/embed/${id}` : null;
  };

  const fetchNews = async (isLoadMore = false) => {
    if (isLoadMore) setLoadingMore(true);
    else {
      const cached = storage.getNews();
      if (!cached) setLoading(true);
      setError(null);
    }

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
      const prompt = `
        Find the top 10 MOST RECENT and TRENDING financial news YouTube videos from the last 24-48 hours.
        Focus on: inflation, cost of living, personal finance, and economic resilience.
        ${isLoadMore ? `Exclude these existing titles: ${news.map(a => a.title).join(', ')}` : ''}
        The videos MUST be from reputable financial news channels (e.g., Bloomberg, CNBC, Financial Times, Reuters, Wall Street Journal).
      `;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt + `
          Return a JSON array of objects. 
          CRITICAL: The "url" MUST be a direct YouTube watch link.
          
          Fields:
          - title: string
          - url: string
          - source: string (Channel name)
          - snippet: string (2-sentence summary)
          - thumbnail: string (YouTube thumbnail URL)
          - date: string (ISO date string if available)
        `,
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
                source: { type: "STRING" },
                snippet: { type: "STRING" },
                thumbnail: { type: "STRING" },
                date: { type: "STRING" }
              },
              required: ["title", "url", "source", "snippet", "thumbnail"]
            }
          }
        },
      });

      const data = JSON.parse(response.text);
      const incomingNews = data.filter((v: NewsArticle) => getVideoId(v.url) !== null);
      
      setNews(prev => {
        const combined = isLoadMore ? [...prev, ...incomingNews] : incomingNews;
        const unique = Array.from(new Map(combined.map((item: NewsArticle) => [item.url, item])).values()) as NewsArticle[];
        if (!isLoadMore) {
          storage.saveNews(unique as any);
        }
        return unique;
      });
    } catch (err) {
      console.error('Failed to fetch news:', err);
      if (!isLoadMore && news.length === 0) {
        setError('Failed to load real-time video news. Please try again later.');
      }
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    const cached = storage.getNews();
    if (cached) {
      setNews(cached.articles as any);
      setLoading(false);
      if (Date.now() - cached.timestamp > 15 * 60 * 1000) {
        fetchNews(false);
      }
    } else {
      fetchNews(false);
    }
  }, []);

  return (
    <div className="space-y-12 pb-20">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-emerald-500 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <Newspaper className="w-6 h-6 text-black" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">Video Intelligence</span>
          </div>
          <h1 className="text-6xl font-black text-slate-900 tracking-tighter uppercase italic leading-[0.85]">
            Financial <br />
            <span className="text-emerald-500">Pulse</span>
          </h1>
          <p className="text-slate-500 mt-4 max-w-md font-medium">
            The latest trending financial news videos, curated to help you navigate the current economic landscape.
          </p>
        </div>
        <button 
          onClick={() => fetchNews(false)}
          disabled={loading}
          className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-black uppercase italic tracking-tighter hover:bg-slate-50 transition-all disabled:opacity-50 group"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-500'}`} />
          Refresh Feed
        </button>
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
              className="bg-slate-900 w-full max-w-6xl rounded-[3rem] overflow-hidden shadow-2xl relative"
              onClick={e => e.stopPropagation()}
            >
              <button 
                onClick={() => setSelectedVideo(null)}
                className="absolute top-6 right-6 z-10 p-3 bg-black/40 hover:bg-black/60 text-white rounded-full backdrop-blur-md transition-all"
              >
                <X className="w-6 h-6" />
              </button>
              <div className="aspect-video w-full bg-black relative">
                <iframe
                  src={`${getEmbedUrl(selectedVideo.url)}?autoplay=1&rel=0&modestbranding=1`}
                  title={selectedVideo.title}
                  className="w-full h-full relative z-10"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  loading="lazy"
                />
                <div className="absolute inset-0 flex items-center justify-center bg-slate-900">
                  <RefreshCw className="w-8 h-8 text-emerald-500 animate-spin" />
                </div>
              </div>
              <div className="p-10">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-emerald-500/20 rounded-xl flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-emerald-400" />
                  </div>
                  <span className="text-xs font-black uppercase tracking-widest text-emerald-400">{selectedVideo.source}</span>
                </div>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-4">
                  <h2 className="text-3xl font-black text-white tracking-tighter uppercase italic leading-tight group-hover:text-emerald-400 transition-colors">
                    {selectedVideo.title}
                  </h2>
                  <a 
                    href={selectedVideo.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 px-6 py-3 bg-white text-slate-900 rounded-2xl text-sm font-black uppercase italic tracking-tighter hover:bg-emerald-500 hover:text-white transition-all shrink-0"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Open in YouTube
                  </a>
                </div>
                <p className="text-slate-400 text-base font-medium leading-relaxed max-w-3xl">{selectedVideo.snippet}</p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* News Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-white rounded-[3rem] overflow-hidden border border-slate-100 animate-pulse">
              <div className="aspect-video bg-slate-100" />
              <div className="p-8">
                <div className="w-24 h-3 bg-slate-100 rounded-full mb-4" />
                <div className="w-full h-6 bg-slate-100 rounded-lg mb-2" />
                <div className="w-2/3 h-6 bg-slate-100 rounded-lg" />
              </div>
            </div>
          ))
        ) : error ? (
          <div className="col-span-full py-20 text-center bg-rose-50 rounded-[3rem] border border-rose-100">
            <p className="text-rose-500 font-black uppercase italic tracking-tighter text-xl">{error}</p>
            <button onClick={() => fetchNews(false)} className="mt-4 text-rose-600 underline font-bold">Try again</button>
          </div>
        ) : (
          <AnimatePresence mode="popLayout">
            {news.map((article, index) => (
              <motion.article
                key={`${article.url}-${index}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="group bg-white rounded-[3rem] overflow-hidden border border-slate-100 hover:border-emerald-200 hover:shadow-2xl hover:shadow-emerald-500/5 transition-all flex flex-col h-full"
              >
                <div 
                  className="relative aspect-video overflow-hidden cursor-pointer"
                  onClick={() => setSelectedVideo(article)}
                >
                  <img 
                    src={getThumbnailUrl(article)} 
                    alt={article.title} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = article.thumbnail;
                    }}
                  />
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-xl transform group-hover:scale-110 transition-transform">
                      <Play className="w-6 h-6 text-emerald-600 fill-emerald-600 ml-1" />
                    </div>
                  </div>
                  {article.date && (
                    <div className="absolute bottom-4 left-4 px-3 py-1 bg-black/60 backdrop-blur-md rounded-full text-[10px] font-bold text-white uppercase tracking-widest flex items-center gap-2">
                      <Clock className="w-3 h-3" />
                      {formatDistanceToNow(new Date(article.date), { addSuffix: true })}
                    </div>
                  )}
                </div>

                <div className="p-8 flex-1 flex flex-col">
                  <div className="flex items-center gap-2 mb-4">
                    <TrendingUp className="w-4 h-4 text-emerald-500" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{article.source}</span>
                  </div>

                  <h2 className="text-2xl font-black text-slate-900 tracking-tighter uppercase italic leading-tight mb-4 group-hover:text-emerald-600 transition-colors">
                    {article.title}
                  </h2>

                  <p className="text-slate-500 text-sm leading-relaxed mb-8 line-clamp-2">
                    {article.snippet}
                  </p>

                  <div className="mt-auto flex gap-3">
                    <button 
                      onClick={() => setSelectedVideo(article)}
                      className="flex-1 flex items-center justify-center gap-2 py-4 bg-slate-900 text-white font-black uppercase italic tracking-tighter rounded-2xl hover:bg-emerald-600 transition-all"
                    >
                      Watch News
                    </button>
                    <a 
                      href={article.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-4 bg-slate-50 text-slate-400 rounded-2xl hover:bg-slate-100 hover:text-slate-900 transition-all"
                    >
                      <ExternalLink className="w-5 h-5" />
                    </a>
                  </div>
                </div>
              </motion.article>
            ))}
          </AnimatePresence>
        )}
      </div>

      {/* Load More */}
      {!loading && !error && news.length > 0 && (
        <div className="flex justify-center pt-8">
          <button
            onClick={() => fetchNews(true)}
            disabled={loadingMore}
            className="flex items-center gap-3 px-12 py-5 bg-slate-900 text-white font-black uppercase italic tracking-tighter rounded-[2rem] hover:bg-slate-800 transition-all disabled:opacity-50 shadow-xl shadow-slate-900/20"
          >
            {loadingMore ? (
              <>
                <RefreshCw className="w-5 h-5 animate-spin" />
                Searching for more...
              </>
            ) : (
              <>
                <TrendingUp className="w-5 h-5" />
                Load More Trending News
              </>
            )}
          </button>
        </div>
      )}

      {/* Footer Note */}
      <footer className="pt-12 border-t border-slate-100">
        <div className="flex items-center gap-4 text-slate-400">
          <Search className="w-5 h-5" />
          <p className="text-[10px] font-bold uppercase tracking-[0.2em]">
            Curated Financial Video Intelligence • Powered by AI & YouTube
          </p>
        </div>
      </footer>
    </div>
  );
}
