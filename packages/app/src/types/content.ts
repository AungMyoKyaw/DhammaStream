// Core content type definitions based on Firebase schema
export interface DhammaContent {
  id: string;
  title: string;
  speaker?: string;
  contentType: "audio" | "video" | "ebook" | "other";
  fileUrl: string; // External URL: https://dhammadownload.com/MP3Library/[Teacher]/[File].mp3
  fileSizeEstimate?: number;
  durationEstimate?: number;
  language: string;
  category?: string;
  tags: string[];
  description?: string;
  dateRecorded?: Date;
  sourcePage?: string;
  scrapedDate?: Date;

  // Enhanced fields for app
  createdAt: Date;
  updatedAt: Date;
  downloadCount: number;
  avgRating: number;
  reviewCount: number;
  featured: boolean;
  difficulty: "beginner" | "intermediate" | "advanced";
  transcription?: string;
  thumbnailUrl?: string;
  chapters?: Chapter[];
  relatedContent: string[]; // Reference to other content IDs
  qualityScore?: number;
}

export interface Chapter {
  id: string;
  title: string;
  startTime: number; // seconds
  endTime: number; // seconds
  description?: string;
}

export interface ContentProgress {
  contentId: string;
  userId: string;
  progress: number; // 0-100 percentage
  currentPosition: number; // seconds
  completed: boolean;
  bookmarks: Bookmark[];
  notes: Note[];
  rating?: number;
  lastAccessed: Date;
  totalListenTime: number;
}

export interface Bookmark {
  id: string;
  timestamp: number; // seconds
  title?: string;
  note?: string;
  createdAt: Date;
}

export interface Note {
  id: string;
  timestamp: number; // seconds
  content: string;
  isPrivate: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Content filtering and search types
export interface ContentFilters {
  contentType?: DhammaContent["contentType"][];
  speakers?: string[];
  categories?: string[];
  languages?: string[];
  difficulty?: DhammaContent["difficulty"][];
  minDuration?: number;
  maxDuration?: number;
  featured?: boolean;
}

export interface SearchQuery {
  query: string;
  filters: ContentFilters;
  sortBy: "relevance" | "date" | "title" | "rating" | "duration";
  sortOrder: "asc" | "desc";
  page: number;
  limit: number;
}

export interface SearchResult {
  content: DhammaContent[];
  total: number;
  page: number;
  hasMore: boolean;
  facets: {
    speakers: { name: string; count: number }[];
    categories: { name: string; count: number }[];
    languages: { name: string; count: number }[];
    contentTypes: { type: string; count: number }[];
  };
}
