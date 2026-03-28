import React, { useState, useEffect } from 'react';
import { User, CommunityPost, CommunityStory } from '../types';
import { storage } from '../services/storage';
import { botService } from '../services/botService';
import { Camera, Send, Share2, Clock, Heart, MessageCircle, MoreHorizontal, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { formatDistanceToNow } from 'date-fns';
import { useLocation, useNavigate } from 'react-router-dom';

interface CommunityProps {
  user: User;
}

export default function Community({ user }: CommunityProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [stories, setStories] = useState<CommunityStory[]>([]);
  const [content, setContent] = useState('');
  const [showPostModal, setShowPostModal] = useState(false);
  const [activeTag, setActiveTag] = useState<string | null>(null);

  const [isSeeding, setIsSeeding] = useState(false);

  useEffect(() => {
    const loadData = () => {
      const params = new URLSearchParams(location.search);
      const tag = params.get('tag');
      setActiveTag(tag);
      
      const allPosts = storage.getPosts();
      if (tag) {
        setPosts(allPosts.filter(p => p.content.includes(tag)));
      } else {
        setPosts(allPosts);
      }

      const allStories = storage.getStories();
      setStories(allStories);
    };

    const checkSeeding = () => {
      const seeding = localStorage.getItem('resilience_seeding') === 'true';
      setIsSeeding(seeding);
    };

    loadData();
    checkSeeding();

    window.addEventListener('storage-update', loadData);
    window.addEventListener('seeding-update', checkSeeding);
    return () => {
      window.removeEventListener('storage-update', loadData);
      window.removeEventListener('seeding-update', checkSeeding);
    };
  }, [location.search]);

  const handlePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    const newPost: CommunityPost = {
      id: Math.random().toString(36).substr(2, 9),
      userId: user.id,
      userDisplayName: user.displayName || 'Anonymous User',
      userAvatar: user.avatarUrl || `https://picsum.photos/seed/${user.id}/100/100`,
      content: content.trim(),
      createdAt: Date.now(),
      likes: 0,
      reactions: [],
    };

    storage.addPost(newPost);
    setPosts([newPost, ...posts]);
    setContent('');
    setShowPostModal(false);
  };

  const handleLike = (postId: string) => {
    const updated = storage.toggleLike(postId);
    setPosts(updated);
  };

  return (
    <div className="max-w-2xl mx-auto pb-20">
      {/* Stories Bar */}
      <div className="flex gap-4 overflow-x-auto pb-6 mb-8 no-scrollbar">
        <div className="flex flex-col items-center gap-2 shrink-0">
          <div className="w-16 h-16 rounded-full p-1 border-2 border-slate-200">
            <div className="w-full h-full rounded-full overflow-hidden relative">
              <img src={user.avatarUrl || `https://picsum.photos/seed/${user.id}/100/100`} alt="Me" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                <Plus className="w-5 h-5 text-white" />
              </div>
            </div>
          </div>
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Your Story</span>
        </div>
        {stories.map((story) => (
          <div key={story.id} className="flex flex-col items-center gap-2 shrink-0">
            <div className="w-16 h-16 rounded-full p-1 border-2 border-emerald-500">
              <div className="w-full h-full rounded-full overflow-hidden relative">
                <img src={story.imageUrl} alt={story.userDisplayName} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              </div>
            </div>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{story.userDisplayName.split(' ')[0]}</span>
          </div>
        ))}
      </div>

      {/* Create Post Trigger */}
      {activeTag && (
        <div className="mb-8 flex items-center justify-between bg-emerald-50 p-6 rounded-[2rem] border border-emerald-100">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-sm font-black uppercase italic tracking-tighter text-slate-900">Filtering by {activeTag}</span>
          </div>
          <button 
            onClick={() => navigate('/community')}
            className="text-[10px] font-black uppercase tracking-widest text-emerald-600 hover:text-emerald-700"
          >
            Clear Filter
          </button>
        </div>
      )}

      <div 
        onClick={() => setShowPostModal(true)}
        className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm mb-8 flex items-center gap-4 cursor-pointer hover:bg-slate-50 transition-colors"
      >
        <div className="w-10 h-10 rounded-full bg-slate-100 overflow-hidden">
          <img src={user.avatarUrl || `https://picsum.photos/seed/${user.id}/100/100`} alt="Me" referrerPolicy="no-referrer" />
        </div>
        <div className="flex-1 bg-slate-50 rounded-full px-6 py-2 text-slate-400 text-sm font-medium">
          Share a struggle or a win...
        </div>
        <Camera className="w-6 h-6 text-slate-400" />
      </div>

      {/* Feed */}
      <div className="space-y-8">
        <AnimatePresence initial={false}>
          {posts.map(post => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-100 overflow-hidden border border-slate-100">
                      <img src={post.userAvatar} alt={post.userDisplayName} referrerPolicy="no-referrer" />
                    </div>
                    <div>
                      <p className="text-sm font-black text-slate-900 uppercase italic tracking-tighter">{post.userDisplayName}</p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {formatDistanceToNow(post.createdAt)} ago
                      </p>
                    </div>
                  </div>
                  <button className="text-slate-400 hover:text-slate-900">
                    <MoreHorizontal className="w-5 h-5" />
                  </button>
                </div>

                <p className="text-slate-700 leading-relaxed mb-6 text-base">{post.content}</p>

                {post.mediaUrl && (
                  <div className="aspect-square rounded-3xl overflow-hidden mb-6 bg-slate-50">
                    <img src={post.mediaUrl} alt="Post content" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  </div>
                )}

                <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                  <div className="flex items-center gap-6">
                    <button 
                      onClick={() => handleLike(post.id)}
                      className="flex items-center gap-2 text-slate-400 hover:text-rose-500 transition-colors group"
                    >
                      <Heart className="w-5 h-5 group-hover:fill-rose-500" />
                      <span className="text-xs font-bold">{post.likes || 0}</span>
                    </button>
                    <button className="flex items-center gap-2 text-slate-400 hover:text-slate-900 transition-colors">
                      <MessageCircle className="w-5 h-5" />
                      <span className="text-xs font-bold">{post.comments?.length || 0}</span>
                    </button>
                  </div>
                  <button className="text-slate-400 hover:text-slate-900 transition-colors">
                    <Share2 className="w-5 h-5" />
                  </button>
                </div>

                {post.comments && post.comments.length > 0 && (
                  <div className="mt-6 space-y-4 pt-6 border-t border-slate-50">
                    {post.comments.map(comment => (
                      <div key={comment.id} className="flex gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-100 overflow-hidden shrink-0">
                          <img src={comment.userAvatar} alt={comment.userDisplayName} referrerPolicy="no-referrer" />
                        </div>
                        <div className="flex-1 bg-slate-50 rounded-2xl p-4">
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-[10px] font-black text-slate-900 uppercase italic tracking-tighter">{comment.userDisplayName}</span>
                            <span className="text-[8px] text-slate-400 font-bold uppercase tracking-widest">{formatDistanceToNow(comment.createdAt)} ago</span>
                          </div>
                          <p className="text-xs text-slate-700 leading-relaxed">{comment.content}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {posts.length === 0 && !isSeeding && (
          <div className="py-20 text-center bg-slate-50 rounded-[3rem] border-2 border-dashed border-slate-200">
            <p className="text-slate-400 font-black uppercase italic tracking-tighter text-xl">No stories yet</p>
            <p className="text-slate-400 text-sm mt-2 mb-6">Be the first to inspire the community.</p>
            <button 
              onClick={async () => {
                storage.clearPosts();
                setPosts([]);
                localStorage.setItem('resilience_seeding', 'true');
                window.dispatchEvent(new Event('seeding-update'));
                await botService.getOrCreateBots();
                await botService.generateBotPosts();
                await botService.generateBotStories(10);
                localStorage.setItem('resilience_seeding', 'false');
                window.dispatchEvent(new Event('seeding-update'));
              }}
              className="px-8 py-4 bg-slate-900 text-white font-black uppercase italic tracking-tighter rounded-2xl hover:bg-slate-800 transition-all"
            >
              Clear & Regenerate Activity
            </button>
          </div>
        )}

        {isSeeding && posts.length === 0 && (
          <div className="py-20 text-center bg-white rounded-[3rem] border border-slate-100 shadow-sm">
            <div className="w-16 h-16 border-4 border-slate-100 border-t-emerald-500 rounded-full animate-spin mx-auto mb-6" />
            <p className="text-slate-900 font-black uppercase italic tracking-tighter text-xl">Populating Community...</p>
            <p className="text-slate-400 text-sm mt-2 animate-pulse">Our AI members are sharing their stories</p>
          </div>
        )}
      </div>

      {/* Post Modal */}
      <AnimatePresence>
        {showPostModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowPostModal(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative max-w-lg w-full bg-white rounded-[3rem] p-8 shadow-2xl"
            >
              <h3 className="text-2xl font-black uppercase italic tracking-tighter mb-6">Create Post</h3>
              <form onSubmit={handlePost} className="space-y-6">
                <textarea
                  value={content}
                  onChange={e => setContent(e.target.value)}
                  placeholder={activeTag ? `Add ${activeTag} to your post...` : "What's on your mind?"}
                  className="w-full p-6 bg-slate-50 rounded-3xl border-none focus:ring-2 focus:ring-slate-900 outline-none resize-none h-48 text-lg"
                  autoFocus
                />
                <div className="flex items-center justify-between">
                  <button type="button" className="p-4 bg-slate-100 text-slate-600 rounded-2xl hover:bg-slate-200 transition-colors">
                    <Camera className="w-6 h-6" />
                  </button>
                  <button
                    type="submit"
                    className="px-8 py-4 bg-slate-900 text-white font-black uppercase italic tracking-tighter rounded-2xl hover:bg-slate-800 transition-all"
                  >
                    Post Story
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
