// API response and service types
export interface ApiResponse<T = unknown> {
  data: T;
  success: boolean;
  message?: string;
  error?: string;
  timestamp: Date;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

// Service worker and PWA types
export interface ServiceWorkerMessage {
  type: "CACHE_UPDATE" | "OFFLINE_MODE" | "SYNC_STATUS" | "PUSH_NOTIFICATION";
  payload?: unknown;
}

export interface OfflineQueueItem {
  id: string;
  type: "FAVORITE" | "PROGRESS_UPDATE" | "REVIEW" | "PLAYLIST_UPDATE";
  data: Record<string, unknown>;
  timestamp: Date;
  retryCount: number;
}

// Analytics events
export interface AnalyticsEvent {
  name: string;
  category: "user" | "content" | "player" | "navigation" | "error";
  action: string;
  label?: string;
  value?: number;
  customParameters?: Record<string, unknown>;
}

// External media validation
export interface MediaValidationResult {
  url: string;
  isValid: boolean;
  contentType?: string;
  fileSize?: number;
  duration?: number;
  error?: string;
}

// Cache types for offline support
export interface CachedContent {
  id: string;
  content: unknown;
  cachedAt: Date;
  expiresAt?: Date;
  size: number;
}

export interface CacheStats {
  totalSize: number;
  itemCount: number;
  availableSpace: number;
  lastCleanup: Date;
}
