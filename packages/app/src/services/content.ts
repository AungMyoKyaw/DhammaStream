// Content service for Firestore operations
import {
  collection,
  doc,
  getDocs,
  getDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  type DocumentSnapshot,
  type QueryConstraint
} from "firebase/firestore";
import { db } from "./firebase";
import type {
  DhammaContent,
  ContentFilters,
  SearchQuery,
  SearchResult,
  PaginatedResponse
} from "@/types";

// Collection names based on firebase-seeder implementation
export const COLLECTIONS = {
  SERMONS: "sermons",
  VIDEOS: "videos",
  EBOOKS: "ebooks"
} as const;

// Get collection name based on content type
export function getCollectionName(
  contentType: DhammaContent["contentType"]
): string {
  const collectionMap: Record<string, string> = {
    audio: COLLECTIONS.SERMONS,
    video: COLLECTIONS.VIDEOS,
    ebook: COLLECTIONS.EBOOKS
  };
  // Default to sermons if unknown content type
  return collectionMap[contentType] || COLLECTIONS.SERMONS;
}

// Fetch content by ID
export async function getContentById(
  id: string,
  contentType?: DhammaContent["contentType"]
): Promise<DhammaContent | null> {
  try {
    if (contentType) {
      const collectionName = getCollectionName(contentType);
      const docRef = doc(db, collectionName, id);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        return convertFirestoreDoc(docSnap);
      }
    } else {
      // Search across all collections if type is unknown
      const collections = [
        COLLECTIONS.SERMONS,
        COLLECTIONS.VIDEOS,
        COLLECTIONS.EBOOKS
      ];

      for (const collectionName of collections) {
        const docRef = doc(db, collectionName, id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          return convertFirestoreDoc(docSnap);
        }
      }
    }
    return null;
  } catch (error) {
    console.error("Error fetching content by ID:", error);
    throw new Error("Failed to fetch content");
  }
}

// Convert Firestore document to DhammaContent
function convertFirestoreDoc(doc: DocumentSnapshot): DhammaContent {
  const data = doc.data();
  if (!data) throw new Error("Document data is undefined");

  return {
    id: doc.id,
    title: data.title,
    speaker: data.speaker || undefined,
    contentType: data.contentType,
    fileUrl: data.fileUrl,
    fileSizeEstimate: data.fileSizeEstimate || undefined,
    durationEstimate: data.durationEstimate || undefined,
    language: data.language,
    category: data.category || undefined,
    tags: data.tags || [],
    description: data.description || undefined,
    dateRecorded: data.dateRecorded?.toDate(),
    sourcePage: data.sourcePage || undefined,
    scrapedDate: data.scrapedDate?.toDate(),
    createdAt: data.createdAt?.toDate() || new Date(),
    updatedAt: data.updatedAt?.toDate() || new Date(),
    downloadCount: data.downloadCount || 0,
    avgRating: data.avgRating || 0,
    reviewCount: data.reviewCount || 0,
    featured: data.featured || false,
    difficulty: data.difficulty || "beginner",
    transcription: data.transcription || undefined,
    thumbnailUrl: data.thumbnailUrl || undefined,
    chapters: data.chapters || [],
    relatedContent: data.relatedContent || [],
    qualityScore: data.qualityScore || undefined
  };
}

// Map search sort fields to Firestore fields
function mapSortField(
  sortBy: SearchQuery["sortBy"]
): "createdAt" | "title" | "avgRating" | "downloadCount" {
  const sortMap: Record<
    SearchQuery["sortBy"],
    "createdAt" | "title" | "avgRating" | "downloadCount"
  > = {
    relevance: "avgRating", // Default to rating for relevance
    date: "createdAt",
    title: "title",
    rating: "avgRating",
    duration: "downloadCount" // Map duration to download count for now
  };
  return sortMap[sortBy];
}

// Fetch content with filters and pagination
export async function getContent(
  filters: ContentFilters = {},
  page = 1,
  pageLimit = 20,
  sortBy: "createdAt" | "title" | "avgRating" | "downloadCount" = "createdAt",
  sortOrder: "asc" | "desc" = "desc",
  lastDoc?: DocumentSnapshot
): Promise<PaginatedResponse<DhammaContent>> {
  try {
    const queries: QueryConstraint[] = [];

    // Add filters
    if (filters.contentType && filters.contentType.length > 0) {
      queries.push(where("contentType", "in", filters.contentType));
    }

    if (filters.speakers && filters.speakers.length > 0) {
      queries.push(where("speaker", "in", filters.speakers));
    }

    if (filters.categories && filters.categories.length > 0) {
      queries.push(where("category", "in", filters.categories));
    }

    if (filters.languages && filters.languages.length > 0) {
      queries.push(where("language", "in", filters.languages));
    }

    if (filters.difficulty && filters.difficulty.length > 0) {
      queries.push(where("difficulty", "in", filters.difficulty));
    }

    if (filters.featured !== undefined) {
      queries.push(where("featured", "==", filters.featured));
    }

    // Add sorting
    queries.push(orderBy(sortBy, sortOrder));

    // Add pagination
    if (lastDoc) {
      queries.push(startAfter(lastDoc));
    }

    queries.push(limit(pageLimit));

    // Determine which collections to query
    const collectionsToQuery =
      filters.contentType && filters.contentType.length > 0
        ? filters.contentType.map(getCollectionName)
        : [COLLECTIONS.SERMONS, COLLECTIONS.VIDEOS, COLLECTIONS.EBOOKS];

    // Execute queries across relevant collections
    const allResults: DhammaContent[] = [];

    for (const collectionName of collectionsToQuery) {
      const q = query(collection(db, collectionName), ...queries);
      const querySnapshot = await getDocs(q);

      querySnapshot.forEach((doc) => {
        allResults.push(convertFirestoreDoc(doc));
      });
    }

    // Sort and paginate the combined results
    allResults.sort((a, b) => {
      const aValue = a[sortBy as keyof DhammaContent] as string | number | Date;
      const bValue = b[sortBy as keyof DhammaContent] as string | number | Date;

      if (sortOrder === "asc") {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    const startIndex = (page - 1) * pageLimit;
    const endIndex = startIndex + pageLimit;
    const paginatedResults = allResults.slice(startIndex, endIndex);

    return {
      items: paginatedResults,
      total: allResults.length,
      page,
      limit: pageLimit,
      hasMore: endIndex < allResults.length
    };
  } catch (error) {
    console.error("Error fetching content:", error);
    throw new Error("Failed to fetch content");
  }
}

// Get featured content for home page
export async function getFeaturedContent(limit = 10): Promise<DhammaContent[]> {
  const result = await getContent(
    { featured: true },
    1,
    limit,
    "avgRating",
    "desc"
  );
  return result.items;
}

// Search content (basic implementation - can be enhanced with Algolia later)
export async function searchContent(
  searchQuery: SearchQuery
): Promise<SearchResult> {
  try {
    // For now, filter by title containing the search term
    // In production, this should use Algolia or similar search service
    const mappedSortBy = mapSortField(searchQuery.sortBy);
    const result = await getContent(
      searchQuery.filters,
      searchQuery.page,
      searchQuery.limit,
      mappedSortBy,
      searchQuery.sortOrder
    );

    // Filter by search query
    const filteredItems = result.items.filter(
      (item) =>
        item.title.toLowerCase().includes(searchQuery.query.toLowerCase()) ||
        item.description
          ?.toLowerCase()
          .includes(searchQuery.query.toLowerCase()) ||
        item.speaker?.toLowerCase().includes(searchQuery.query.toLowerCase())
    );

    return {
      content: filteredItems,
      total: filteredItems.length,
      page: searchQuery.page,
      hasMore: filteredItems.length === searchQuery.limit,
      facets: {
        speakers: [],
        categories: [],
        languages: [],
        contentTypes: []
      }
    };
  } catch (error) {
    console.error("Error searching content:", error);
    throw new Error("Failed to search content");
  }
}

// Get random content for home page
export async function getRandomContent(
  contentType?: DhammaContent["contentType"],
  limit = 5
): Promise<DhammaContent[]> {
  try {
    const filters: ContentFilters = contentType
      ? { contentType: [contentType] }
      : {};
    const result = await getContent(filters, 1, limit * 3); // Get more to randomize from

    // Shuffle and return limited results
    const shuffled = result.items.sort(() => Math.random() - 0.5);
    return shuffled.slice(0, limit);
  } catch (error) {
    console.error("Error fetching random content:", error);
    return [];
  }
}
