export interface DhammaContent {
  id: string;
  title: string;
  speaker: string;
  contentType: "ebook" | "sermon" | "video";
  fileUrl: string;
  fileSizeEstimate?: number;
  durationEstimate?: number;
  language: string;
  category: string;
  tags: string;
  description?: string;
  dateRecorded?: Date;
  sourcePage?: string;
  scrapedDate?: Date;
  createdAt: Date;

  // Enhanced fields for app compatibility
  updatedAt?: Date;
  downloadCount?: number;
  avgRating?: number;
  reviewCount?: number;
  featured?: boolean;
  difficulty?: "beginner" | "intermediate" | "advanced";
  transcription?: string;
  thumbnailUrl?: string;
  chapters?: Chapter[];
  relatedContent?: string[]; // Reference to other content IDs
  qualityScore?: number;
}

export interface Chapter {
  id: string;
  title: string;
  startTime: number; // seconds
  endTime: number; // seconds
  description?: string;
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

export interface Speaker {
  id: string;
  name: string;
  bio?: string;
}
