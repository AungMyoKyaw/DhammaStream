// Utility functions for common operations
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

// Combine Tailwind classes with proper merging
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Format duration from seconds to MM:SS or HH:MM:SS
export function formatDuration(seconds: number): string {
  if (!seconds || seconds < 0) return "0:00";

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = Math.floor(seconds % 60);

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`;
  } else {
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  }
}

// Format file size from bytes to human readable
export function formatFileSize(bytes: number): string {
  if (!bytes || bytes < 0) return "0 B";

  const units = ["B", "KB", "MB", "GB"];
  let size = bytes;
  let unitIndex = 0;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }

  return `${size.toFixed(1)} ${units[unitIndex]}`;
}

// Format relative time (e.g., "2 hours ago")
export function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

  if (diffInMinutes < 1) return "just now";
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  if (diffInHours < 24) return `${diffInHours}h ago`;
  if (diffInDays < 30) return `${diffInDays}d ago`;

  return date.toLocaleDateString();
}

// Generate a random ID
export function generateId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

// Debounce function
export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

// Throttle function
export function throttle<T extends (...args: unknown[]) => unknown>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => {
        inThrottle = false;
      }, limit);
    }
  };
}

// Validate external media URL
export function isValidMediaUrl(url: string): boolean {
  try {
    const urlObj = new URL(url);
    return (
      urlObj.hostname === "dhammadownload.com" ||
      urlObj.hostname.endsWith(".dhammadownload.com")
    );
  } catch {
    return false;
  }
}

// Convert content type to display name
export function getContentTypeDisplay(contentType: string): string {
  const typeMap: Record<string, string> = {
    audio: "Audio",
    video: "Video",
    ebook: "E-book",
    other: "Other"
  };
  return typeMap[contentType] || "Unknown";
}

// Get content type icon
export function getContentTypeIcon(contentType: string): string {
  const iconMap: Record<string, string> = {
    audio: "🎵",
    video: "🎥",
    ebook: "📖",
    other: "📄"
  };
  return iconMap[contentType] || "📄";
}

// Generate content thumbnail URL (placeholder for now)
export function generateThumbnailUrl(content: {
  id: string;
  contentType: string;
}): string {
  // In a real app, this would generate thumbnails or use a service
  const colors = [
    "bg-blue-500",
    "bg-green-500",
    "bg-purple-500",
    "bg-orange-500",
    "bg-pink-500"
  ];
  const colorIndex = parseInt(content.id.slice(-1), 36) % colors.length;
  return `https://placehold.co/300x300/${colors[colorIndex].replace("bg-", "").replace("-500", "")}/white?text=${getContentTypeIcon(content.contentType)}`;
}

// Parse tags from string
export function parseTags(tagString: string): string[] {
  if (!tagString) return [];
  return tagString
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);
}

// Format tags for display
export function formatTags(tags: string[]): string {
  return tags.join(", ");
}

// Calculate reading time for text content
export function calculateReadingTime(text: string): number {
  const wordsPerMinute = 200;
  const words = text.split(/\s+/).length;
  return Math.ceil(words / wordsPerMinute);
}

// Extract highlights from search results
export function highlightSearchTerms(text: string, searchTerm: string): string {
  if (!searchTerm) return text;

  const regex = new RegExp(`(${searchTerm})`, "gi");
  return text.replace(regex, "<mark>$1</mark>");
}

// Local storage helpers with error handling
export const localStorage = {
  get: <T>(key: string, defaultValue: T): T => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch {
      return defaultValue;
    }
  },

  set: <T>(key: string, value: T): void => {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.warn("Failed to save to localStorage:", error);
    }
  },

  remove: (key: string): void => {
    try {
      window.localStorage.removeItem(key);
    } catch (error) {
      console.warn("Failed to remove from localStorage:", error);
    }
  }
};

// Copy text to clipboard
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // Fallback for older browsers
    try {
      const textArea = document.createElement("textarea");
      textArea.value = text;
      textArea.style.position = "fixed";
      textArea.style.left = "-999999px";
      textArea.style.top = "-999999px";
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      const success = document.execCommand("copy");
      document.body.removeChild(textArea);
      return success;
    } catch {
      return false;
    }
  }
}
