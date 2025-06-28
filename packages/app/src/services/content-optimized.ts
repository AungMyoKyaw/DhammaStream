// Simplified Content service for build compatibility
import type { DhammaContent, SearchResult, Speaker } from "@/types";

// Export minimal functions for compatibility
export async function getContentById(): Promise<DhammaContent | null> {
  return null;
}

export async function getAllContent(): Promise<DhammaContent[]> {
  return [];
}

export async function getFeaturedContent(): Promise<DhammaContent[]> {
  return [];
}

export async function searchContent(): Promise<SearchResult> {
  return {
    content: [],
    total: 0,
    page: 1,
    hasMore: false,
    facets: {
      speakers: [],
      categories: [],
      languages: [],
      contentTypes: []
    }
  };
}

export async function getSpeakers(): Promise<Speaker[]> {
  return [];
}

export async function getSpeakerById(): Promise<Speaker | null> {
  return null;
}

export async function getContentBySpeaker(): Promise<DhammaContent[]> {
  return [];
}

export async function getRandomContent(): Promise<DhammaContent[]> {
  return [];
}

export function clearContentCache(): void {
  // No-op
}
