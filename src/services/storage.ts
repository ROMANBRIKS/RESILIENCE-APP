import { CommunityPost, FinancialGoal, User, Budget, CommunityStory, NewsArticle } from '../types';

const STORAGE_KEYS = {
  USER: 'resilience_user',
  GOALS: 'resilience_goals',
  POSTS: 'resilience_posts',
  REQUESTS: 'resilience_requests',
  BUDGET: 'resilience_budget',
  BOTS: 'resilience_bots',
  STORIES: 'resilience_stories',
};

export const storage = {
  getUser: (): User | null => {
    const data = localStorage.getItem(STORAGE_KEYS.USER);
    return data ? JSON.parse(data) : null;
  },
  setUser: (user: User) => {
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
  },
  logout: () => {
    localStorage.removeItem(STORAGE_KEYS.USER);
  },
  
  getGoals: (): FinancialGoal[] => {
    const data = localStorage.getItem(STORAGE_KEYS.GOALS);
    return data ? JSON.parse(data) : [];
  },
  saveGoal: (goal: FinancialGoal) => {
    const goals = storage.getGoals();
    localStorage.setItem(STORAGE_KEYS.GOALS, JSON.stringify([...goals, goal]));
  },

  getPosts: (): CommunityPost[] => {
    const data = localStorage.getItem(STORAGE_KEYS.POSTS);
    const posts: CommunityPost[] = data ? JSON.parse(data) : [];
    // Auto-delete after 24 hours
    const now = Date.now();
    const filtered = posts.filter(p => now - p.createdAt < 24 * 60 * 60 * 1000);
    if (filtered.length !== posts.length) {
      localStorage.setItem(STORAGE_KEYS.POSTS, JSON.stringify(filtered));
    }
    return filtered;
  },
  addPost: (post: CommunityPost) => {
    const posts = storage.getPosts();
    localStorage.setItem(STORAGE_KEYS.POSTS, JSON.stringify([post, ...posts]));
  },
  clearPosts: () => {
    localStorage.removeItem(STORAGE_KEYS.POSTS);
    localStorage.removeItem(STORAGE_KEYS.STORIES);
  },
  savePosts: (newPosts: CommunityPost[]) => {
    const posts = storage.getPosts();
    localStorage.setItem(STORAGE_KEYS.POSTS, JSON.stringify([...newPosts, ...posts]));
  },
  toggleLike: (postId: string) => {
    const posts = storage.getPosts();
    const updated = posts.map(p => {
      if (p.id === postId) {
        return { ...p, likes: (p.likes || 0) + 1 };
      }
      return p;
    });
    localStorage.setItem(STORAGE_KEYS.POSTS, JSON.stringify(updated));
    return updated;
  },

  getBudget: (): Budget | null => {
    const data = localStorage.getItem(STORAGE_KEYS.BUDGET);
    return data ? JSON.parse(data) : null;
  },
  saveBudget: (budget: Budget) => {
    localStorage.setItem(STORAGE_KEYS.BUDGET, JSON.stringify(budget));
  },

  getBots: (): User[] => {
    const data = localStorage.getItem(STORAGE_KEYS.BOTS);
    return data ? JSON.parse(data) : [];
  },
  saveBots: (bots: User[]) => {
    localStorage.setItem(STORAGE_KEYS.BOTS, JSON.stringify(bots));
  },

  getStories: (): CommunityStory[] => {
    const data = localStorage.getItem(STORAGE_KEYS.STORIES);
    const stories: CommunityStory[] = data ? JSON.parse(data) : [];
    const now = Date.now();
    const filtered = stories.filter(s => now - s.createdAt < 24 * 60 * 60 * 1000);
    if (filtered.length !== stories.length) {
      localStorage.setItem(STORAGE_KEYS.STORIES, JSON.stringify(filtered));
    }
    return filtered;
  },
  saveStories: (stories: CommunityStory[]) => {
    localStorage.setItem(STORAGE_KEYS.STORIES, JSON.stringify(stories));
  },
  addStory: (story: CommunityStory) => {
    const stories = storage.getStories();
    localStorage.setItem(STORAGE_KEYS.STORIES, JSON.stringify([story, ...stories]));
  },
  getNews: (): { articles: NewsArticle[], timestamp: number } | null => {
    const data = localStorage.getItem('resilience_news_cache');
    return data ? JSON.parse(data) : null;
  },
  saveNews: (articles: NewsArticle[]) => {
    localStorage.setItem('resilience_news_cache', JSON.stringify({
      articles,
      timestamp: Date.now()
    }));
  },
  getVideos: (): { videos: any[], timestamp: number } | null => {
    const data = localStorage.getItem('resilience_videos_cache');
    return data ? JSON.parse(data) : null;
  },
  saveVideos: (videos: any[]) => {
    localStorage.setItem('resilience_videos_cache', JSON.stringify({
      videos,
      timestamp: Date.now()
    }));
  }
};
