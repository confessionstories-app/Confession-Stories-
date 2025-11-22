export interface ReactionCounts {
  love: number;
  laugh: number;
  shock: number;
  fire: number;
}

export type Category = 'confession' | 'life-lesson' | 'other';

export interface Confession {
  id: string;
  text: string;
  createdAt: number; // timestamp
  authorId: string;
  reactions: ReactionCounts;
  views: number;
  shares: number;
  category?: Category;
  theme?: 'light' | 'dark' | 'minimal'; // For image generation styling
  maskId?: number; // 0-9 index for random avatar
}

export type TabView = 'trending' | 'new' | 'mine';

export interface ModerationResult {
  allowed: boolean;
  reason?: string;
}
