import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, RefreshCw, ExternalLink, Video, TrendingUp, Copy, Check } from 'lucide-react';
import { IntelligenceItem } from '../types';
import { cn } from '../lib/utils';

interface VideoPlayerProps {
  item: IntelligenceItem | null;
  onClose: () => void;
  onReportBroken: () => void;
}

export function VideoPlayer({ item, onClose, onReportBroken }: VideoPlayerProps) {
  const [iframeLoading, setIframeLoading] = useState(true);
  const [playerKey, setPlayerKey] = useState(0);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (item) {
      setIframeLoading(true);
      setPlayerKey(prev => prev + 1);
    }
  }, [item]);

  const getVideoId = (url: string, platform: string) => {
    if (!url) return null;
    if (platform === 'youtube') {
      const regExp = /^.*(youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
      const match = url.match(regExp);
      return (match && match[2].length === 11) ? match[2] : null;
    } else if (platform === 'rumble') {
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

  const handleCopy = () => {
    if (!item) return;
    navigator.clipboard.writeText(item.url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!item || item.type !== 'video') return null;

  const embedUrl = getEmbedUrl(item);

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/95 backdrop-blur-md"
        onClick={onClose}
      >
        <motion.div 
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          className="bg-slate-900 w-full max-w-6xl rounded-[2rem] md:rounded-[3rem] overflow-hidden shadow-2xl relative border border-slate-800"
          onClick={e => e.stopPropagation()}
        >
          {/* Close Button */}
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 md:top-6 md:right-6 z-30 p-2 md:p-3 bg-black/40 hover:bg-black/60 text-white rounded-full backdrop-blur-md transition-all border border-white/10"
          >
            <X className="w-5 h-5 md:w-6 md:h-6" />
          </button>
          
          {/* Video Container */}
          <div className="aspect-video w-full bg-black relative">
            {embedUrl ? (
              <>
                <iframe
                  key={playerKey}
                  src={embedUrl}
                  title={item.title}
                  className="w-full h-full relative z-10"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
                  allowFullScreen
                  onLoad={() => setIframeLoading(false)}
                  referrerPolicy="no-referrer-when-downgrade"
                />
                {iframeLoading && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900 z-20">
                    <div className="relative">
                      <RefreshCw className="w-12 h-12 text-indigo-500 animate-spin mb-4" />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-2 h-2 bg-indigo-500 rounded-full animate-ping" />
                      </div>
                    </div>
                    <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.3em] animate-pulse">Establishing Secure Stream...</p>
                  </div>
                )}
              </>
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900 p-8 text-center">
                <div className="w-20 h-20 bg-slate-800 rounded-3xl flex items-center justify-center mb-6">
                  <Video className="w-10 h-10 text-slate-600" />
                </div>
                <h3 className="text-2xl md:text-3xl font-black text-white uppercase italic tracking-tighter mb-4">Playback Restriction</h3>
                <p className="text-slate-400 text-sm md:text-base mb-8 max-w-md font-medium leading-relaxed">
                  This specific report has restricted direct playback within third-party applications. 
                  You can still watch the full intelligence briefing directly on the source platform.
                </p>
                <a 
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-10 py-4 bg-indigo-600 text-white rounded-2xl font-black uppercase italic tracking-tighter hover:bg-indigo-500 transition-all flex items-center gap-3 shadow-xl shadow-indigo-600/20"
                >
                  Watch on {item.platform}
                  <ExternalLink className="w-5 h-5" />
                </a>
              </div>
            )}
          </div>

          {/* Info Section */}
          <div className="p-6 md:p-10 bg-gradient-to-b from-slate-900 to-black">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 md:w-10 md:h-10 bg-indigo-500/20 rounded-xl flex items-center justify-center border border-indigo-500/20">
                <TrendingUp className="w-4 h-4 md:w-5 md:h-5 text-indigo-400" />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] md:text-xs font-black uppercase tracking-widest text-indigo-400">
                  {item.source}
                </span>
                <span className="text-[8px] font-bold text-slate-500 uppercase tracking-[0.2em]">Verified Intelligence Source</span>
              </div>
            </div>

            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-8">
              <h2 className="text-xl md:text-4xl font-black text-white tracking-tighter uppercase italic leading-[0.9]">
                {item.title}
              </h2>
              
              <div className="flex flex-wrap gap-3 shrink-0">
                <button 
                  onClick={() => setPlayerKey(prev => prev + 1)}
                  className="flex items-center justify-center gap-2 px-5 py-3 bg-slate-800 text-white rounded-xl md:rounded-2xl text-[10px] md:text-xs font-black uppercase italic tracking-tighter hover:bg-slate-700 transition-all border border-slate-700"
                >
                  <RefreshCw className={cn("w-3.5 h-3.5", iframeLoading && "animate-spin")} />
                  Refresh
                </button>
                
                <button 
                  onClick={handleCopy}
                  className="flex items-center justify-center gap-2 px-5 py-3 bg-slate-800 text-white rounded-xl md:rounded-2xl text-[10px] md:text-xs font-black uppercase italic tracking-tighter hover:bg-slate-700 transition-all border border-slate-700"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? 'Copied' : 'Copy Link'}
                </button>

                <button 
                  onClick={onReportBroken}
                  className="flex items-center justify-center gap-2 px-5 py-3 bg-rose-600/10 text-rose-500 rounded-xl md:rounded-2xl text-[10px] md:text-xs font-black uppercase italic tracking-tighter hover:bg-rose-600 hover:text-white transition-all border border-rose-500/20"
                >
                  <X className="w-3.5 h-3.5" />
                  Report Broken
                </button>

                <a 
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 px-6 py-3 bg-white text-slate-900 rounded-xl md:rounded-2xl text-[10px] md:text-xs font-black uppercase italic tracking-tighter hover:bg-indigo-500 hover:text-white transition-all shadow-lg"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  Open in {item.platform}
                </a>
              </div>
            </div>

            <div className="max-w-4xl">
              <p className="text-slate-400 text-sm md:text-lg font-medium leading-relaxed mb-6">
                {item.snippet}
              </p>
              
              <div className="flex items-center gap-6 pt-6 border-t border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Live Stream Active</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-indigo-500 rounded-full" />
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Encrypted Connection</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
