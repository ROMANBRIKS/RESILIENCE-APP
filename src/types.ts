export interface User {
  id: string;
  phone: string;
  region: 'US' | 'EU' | 'CA' | 'AU' | 'FI' | 'CH' | 'OTHER';
  optInConnection: boolean;
  displayName?: string;
  avatarUrl?: string;
  bio?: string;
}

export interface FinancialGoal {
  id: string;
  title: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  store: string;
  imageUrl: string;
  isAffiliate: boolean;
  savingsDescription?: string;
  originalPrice?: number;
}

export interface CommunityPost {
  id: string;
  userId: string;
  userDisplayName?: string;
  userAvatar?: string;
  content: string;
  mediaUrl?: string;
  mediaType?: 'image' | 'video';
  createdAt: number;
  likes: number;
  reactions: string[];
  comments?: CommunityComment[];
}

export interface CommunityComment {
  id: string;
  userId: string;
  userDisplayName: string;
  userAvatar: string;
  content: string;
  createdAt: number;
}

export interface CommunityStory {
  id: string;
  userId: string;
  userDisplayName: string;
  userAvatar: string;
  imageUrl: string;
  createdAt: number;
  isUser?: boolean;
}

export interface SupportRequest {
  id: string;
  type: 'financial' | 'emotional' | 'job';
  description: string;
  status: 'pending' | 'connected';
}

export interface Budget {
  income: number;
  expenses: {
    category: string;
    amount: number;
  }[];
  region: string;
}

export interface NewsArticle {
  title: string;
  url: string;
  source: string;
  snippet: string;
  thumbnail?: string;
  date?: string;
  platform?: 'youtube' | 'rumble' | 'article' | 'other';
}

export interface IntelligenceItem {
  id: string;
  title: string;
  url: string;
  source: string;
  snippet: string;
  thumbnail?: string;
  date?: string;
  platform: 'youtube' | 'rumble' | 'article' | 'other';
  type: 'video' | 'article';
  channel?: string;
  personalizedSummary?: string;
}

export interface FinancialAlert {
  id: string;
  type: 'crisis' | 'inflation' | 'cycle' | 'opportunity';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  actionLabel: string;
  actionUrl: string;
  createdAt: number;
}
