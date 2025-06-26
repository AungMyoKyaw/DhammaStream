// User and authentication type definitions
export interface User {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  preferences: UserPreferences;
  favoriteContentIds: string[];
  createdAt: Date;
  lastActiveAt: Date;
  totalListeningTime: number;
  achievementBadges: string[];
}

export interface UserPreferences {
  theme: "light" | "dark" | "system";
  language: string;
  autoplay: boolean;
  playbackSpeed: number;
  volumeLevel: number;
  showTranscriptions: boolean;
  enableNotifications: boolean;
  offlineDownloads: boolean;
  preferredContentTypes: ("audio" | "video" | "ebook")[];
  favoriteCategories: string[];
  preferredSpeakers: string[];
}

export interface Playlist {
  id: string;
  userId: string;
  title: string;
  description?: string;
  isPublic: boolean;
  contentIds: string[];
  createdAt: Date;
  updatedAt: Date;
  followerCount: number;
  thumbnailUrl?: string;
  estimatedDuration?: number;
}

export interface Review {
  id: string;
  contentId: string;
  userId: string;
  rating: number; // 1-5
  comment?: string;
  helpful: number; // helpfulness votes
  createdAt: Date;
  updatedAt: Date;
}

// Authentication state
export interface AuthState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
}

// User achievements
export interface Achievement {
  id: string;
  title: string;
  description: string;
  iconUrl: string;
  unlockedAt?: Date;
  progress?: number;
  maxProgress?: number;
  type:
    | "listening_time"
    | "content_completed"
    | "streak"
    | "social"
    | "special";
}

export const ACHIEVEMENT_TYPES = {
  FIRST_LISTEN: "first_listen",
  HOUR_MILESTONE: "hour_milestone",
  CONTENT_COMPLETED: "content_completed",
  WEEK_STREAK: "week_streak",
  MONTH_STREAK: "month_streak",
  SOCIAL_SHARE: "social_share",
  REVIEW_WRITTEN: "review_written",
  PLAYLIST_CREATED: "playlist_created"
} as const;

export type AchievementType =
  (typeof ACHIEVEMENT_TYPES)[keyof typeof ACHIEVEMENT_TYPES];
