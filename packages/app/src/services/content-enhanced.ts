// Enhanced Content service with dedicated speakers collection support
import type {
  DhammaContent,
  SearchQuery,
  SearchResult,
  ContentFilters,
  Speaker,
  PaginatedResponse
} from "@/types";
import { db } from "../firebase";
import {
  doc,
  getDoc,
  collection,
  getDocs,
  query,
  orderBy,
  limit as firestoreLimit,
  type QueryDocumentSnapshot
} from "firebase/firestore";

// In-memory cache for all content and speakers
interface ContentCache {
  ebooks: DhammaContent[];
  sermons: DhammaContent[];
  videos: DhammaContent[];
  speakers: Speaker[];
  lastFetch: number;
}

let contentCache: ContentCache | null = null;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Helper function to convert Firestore document to DhammaContent
function convertFirestoreDoc(
  doc: QueryDocumentSnapshot,
  contentType: DhammaContent["contentType"]
): DhammaContent {
  const data = doc.data();
  return {
    id: doc.id,
    ...data,
    contentType,
    createdAt: data.createdAt?.toDate() || new Date(),
    dateRecorded: data.dateRecorded?.toDate(),
    scrapedDate: data.scrapedDate?.toDate(),
    updatedAt: data.updatedAt?.toDate(),
    downloadCount: data.downloadCount || 0,
    avgRating: data.avgRating || 0,
    reviewCount: data.reviewCount || 0,
    featured: data.featured || false
  } as DhammaContent;
}

// Helper function to convert Firestore document to Speaker
function convertFirestoreSpeakerDoc(doc: QueryDocumentSnapshot): Speaker {
  const data = doc.data();
  return {
    id: doc.id,
    name: data.name,
    bio: data.bio,
    profileImageUrl: data.profileImageUrl,
    contentTypes: data.contentTypes || [],
    contentRefs: data.contentRefs || { ebooks: [], sermons: [], videos: [] },
    contentCounts: data.contentCounts || {
      ebooks: 0,
      sermons: 0,
      videos: 0,
      total: 0
    },
    featured: data.featured || false,
    createdAt: data.createdAt?.toDate() || new Date(),
    updatedAt: data.updatedAt?.toDate() || new Date()
  };
}

// Get collection name for content type
function getCollectionName(contentType: DhammaContent["contentType"]): string {
  switch (contentType) {
    case "ebook":
      return "ebooks";
    case "sermon":
      return "sermons";
    case "video":
      return "videos";
    default:
      return "sermons";
  }
}

// Check Firebase connection
async function checkFirebaseConnection(): Promise<boolean> {
  try {
    const testQuery = query(collection(db, "sermons"), firestoreLimit(1));
    const snapshot = await getDocs(testQuery);
    return snapshot.size >= 0;
  } catch (error) {
    console.error("Firebase connection check failed:", error);
    return false;
  }
}

// Check if speakers collection exists and has data
async function checkSpeakersCollection(): Promise<boolean> {
  try {
    const speakersQuery = query(collection(db, "speakers"), firestoreLimit(1));
    const snapshot = await getDocs(speakersQuery);
    return snapshot.size > 0;
  } catch (error) {
    console.error("Speakers collection check failed:", error);
    return false;
  }
}

// Load speakers from the dedicated speakers collection
async function loadSpeakersFromCollection(): Promise<Speaker[]> {
  try {
    console.log("📚 Loading speakers from dedicated collection...");
    const speakersQuery = query(
      collection(db, "speakers"),
      orderBy("name", "asc")
    );
    const snapshot = await getDocs(speakersQuery);

    const speakers: Speaker[] = [];
    snapshot.forEach((doc) => {
      speakers.push(convertFirestoreSpeakerDoc(doc));
    });

    console.log(`✅ Loaded ${speakers.length} speakers from collection`);
    return speakers;
  } catch (error) {
    console.error("❌ Error loading speakers from collection:", error);
    return [];
  }
}

// Fallback: Extract speakers from content collections (legacy method)
async function extractSpeakersFromContent(): Promise<Speaker[]> {
  console.log("🔄 Extracting speakers from content collections (fallback)...");

  const contentCollections = ["ebooks", "sermons", "videos"];
  const speakerMap = new Map<
    string,
    { name: string; contentTypes: Set<string> }
  >();

  for (const collectionName of contentCollections) {
    try {
      const q = query(collection(db, collectionName));
      const snapshot = await getDocs(q);

      snapshot.forEach((doc) => {
        const data = doc.data();
        if (data.speaker) {
          const speakerName = data.speaker.trim();
          const speakerId = speakerName.toLowerCase().replace(/\s+/g, "-");

          if (!speakerMap.has(speakerId)) {
            speakerMap.set(speakerId, {
              name: speakerName,
              contentTypes: new Set()
            });
          }

          const contentType =
            collectionName === "ebooks"
              ? "ebook"
              : collectionName === "sermons"
                ? "sermon"
                : "video";
          speakerMap.get(speakerId)?.contentTypes.add(contentType);
        }
      });
    } catch (error) {
      console.error(
        `❌ Error extracting speakers from ${collectionName}:`,
        error
      );
    }
  }

  const speakers: Speaker[] = Array.from(speakerMap.entries()).map(
    ([id, info]) => ({
      id,
      name: info.name,
      contentTypes: Array.from(
        info.contentTypes
      ) as DhammaContent["contentType"][],
      contentRefs: { ebooks: [], sermons: [], videos: [] },
      contentCounts: { ebooks: 0, sermons: 0, videos: 0, total: 0 },
      featured: false,
      createdAt: new Date(),
      updatedAt: new Date()
    })
  );

  console.log(`✅ Extracted ${speakers.length} speakers from content`);
  return speakers;
}

// Load all content into cache
async function loadAllContent(): Promise<ContentCache> {
  console.log("🔄 Loading content into cache...");
  const isConnected = await checkFirebaseConnection();

  if (!isConnected) {
    console.log("❌ Firebase not accessible, using mock data");
    return {
      ebooks: getMockContent("ebook"),
      sermons: getMockContent("sermon"),
      videos: getMockContent("video"),
      speakers: getMockSpeakers(),
      lastFetch: Date.now()
    };
  }

  const cache: ContentCache = {
    ebooks: [],
    sermons: [],
    videos: [],
    speakers: [],
    lastFetch: Date.now()
  };

  // Load content from each collection
  for (const [type, collectionName] of [
    ["ebook", "ebooks"],
    ["sermon", "sermons"],
    ["video", "videos"]
  ] as const) {
    try {
      console.log(`📚 Loading ${collectionName}...`);
      const q = query(
        collection(db, collectionName),
        orderBy("createdAt", "desc")
      );
      const snapshot = await getDocs(q);
      const items: DhammaContent[] = [];

      snapshot.forEach((doc) => {
        items.push(convertFirestoreDoc(doc, type));
      });

      if (type === "ebook") cache.ebooks = items;
      else if (type === "sermon") cache.sermons = items;
      else if (type === "video") cache.videos = items;

      console.log(`✅ Loaded ${items.length} ${type}s`);
    } catch (error) {
      console.error(`❌ Error loading ${collectionName}:`, error);
      const mockItems = getMockContent(type);
      if (type === "ebook") cache.ebooks = mockItems;
      else if (type === "sermon") cache.sermons = mockItems;
      else if (type === "video") cache.videos = mockItems;
    }
  }

  // Load speakers - try dedicated collection first, fallback to content extraction
  const hasSpeakersCollection = await checkSpeakersCollection();
  if (hasSpeakersCollection) {
    cache.speakers = await loadSpeakersFromCollection();
  } else {
    cache.speakers = await extractSpeakersFromContent();
  }

  const allContentCount =
    cache.ebooks.length + cache.sermons.length + cache.videos.length;
  console.log(
    `🎯 Cache loaded: ${allContentCount} items, ${cache.speakers.length} speakers`
  );
  return cache;
}

// Get or refresh content cache
async function getContentCache(): Promise<ContentCache> {
  if (!contentCache || Date.now() - contentCache.lastFetch > CACHE_DURATION) {
    contentCache = await loadAllContent();
  }
  return contentCache;
}

// EXPORTED FUNCTIONS

export async function getContentById(
  id: string,
  contentType: DhammaContent["contentType"]
): Promise<DhammaContent | null> {
  try {
    // Try Firebase first
    const collectionName = getCollectionName(contentType);
    const docRef = doc(db, collectionName, id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return convertFirestoreDoc(docSnap as QueryDocumentSnapshot, contentType);
    }

    // Fall back to cache
    const cache = await getContentCache();
    let contentArray: DhammaContent[] = [];

    if (contentType === "ebook") contentArray = cache.ebooks;
    else if (contentType === "sermon") contentArray = cache.sermons;
    else if (contentType === "video") contentArray = cache.videos;

    return contentArray.find((item) => item.id === id) || null;
  } catch (error) {
    console.error("Error fetching content by ID:", error);
    return null;
  }
}

export async function getContent(
  filters: ContentFilters = {},
  sortBy: "createdAt" | "title" = "createdAt",
  sortOrder: "asc" | "desc" = "desc"
): Promise<PaginatedResponse<DhammaContent>> {
  try {
    const cache = await getContentCache();
    const contentTypes = filters.contentType || ["ebook", "sermon", "video"];
    let allContent: DhammaContent[] = [];

    // Collect content from requested types
    contentTypes.forEach((type) => {
      if (type === "ebook") allContent = [...allContent, ...cache.ebooks];
      else if (type === "sermon")
        allContent = [...allContent, ...cache.sermons];
      else if (type === "video") allContent = [...allContent, ...cache.videos];
    });

    // Apply filters
    if (filters.speakers?.length) {
      allContent = allContent.filter((content) =>
        filters.speakers?.some((speaker) =>
          content.speaker.toLowerCase().includes(speaker.toLowerCase())
        )
      );
    }

    if (filters.categories?.length) {
      allContent = allContent.filter((content) =>
        filters.categories?.includes(content.category)
      );
    }

    if (filters.languages?.length) {
      allContent = allContent.filter((content) =>
        filters.languages?.includes(content.language)
      );
    }

    if (filters.featured !== undefined) {
      allContent = allContent.filter(
        (content) => content.featured === filters.featured
      );
    }

    // Apply sorting
    allContent.sort((a, b) => {
      if (sortBy === "title") {
        const comparison = a.title.localeCompare(b.title);
        return sortOrder === "asc" ? comparison : -comparison;
      } else {
        const aTime = a.createdAt.getTime();
        const bTime = b.createdAt.getTime();
        return sortOrder === "asc" ? aTime - bTime : bTime - aTime;
      }
    });

    return {
      items: allContent,
      total: allContent.length,
      hasMore: false,
      page: 1,
      limit: allContent.length
    };
  } catch (error) {
    console.error("Error fetching content:", error);
    return {
      items: getMockContent(),
      total: 0,
      hasMore: false,
      page: 1,
      limit: 20
    };
  }
}

export async function getFeaturedContent(limit = 10): Promise<DhammaContent[]> {
  try {
    const cache = await getContentCache();
    const allContent = [...cache.ebooks, ...cache.sermons, ...cache.videos];
    return allContent.filter((content) => content.featured).slice(0, limit);
  } catch (error) {
    console.error("Error fetching featured content:", error);
    return getMockContent()
      .filter((content) => content.featured)
      .slice(0, limit);
  }
}

export async function getSpeakers(
  contentType?: DhammaContent["contentType"]
): Promise<Speaker[]> {
  try {
    const cache = await getContentCache();

    if (contentType) {
      // Filter speakers by content type
      return cache.speakers.filter((speaker) =>
        speaker.contentTypes.includes(contentType)
      );
    }

    return cache.speakers;
  } catch (error) {
    console.error("Error fetching speakers:", error);
    return getMockSpeakers();
  }
}

export async function getSpeakerById(
  speakerId: string
): Promise<Speaker | null> {
  try {
    // First try the speakers collection
    const hasSpeakersCollection = await checkSpeakersCollection();
    if (hasSpeakersCollection) {
      const speakerRef = doc(db, "speakers", speakerId);
      const speakerSnap = await getDoc(speakerRef);

      if (speakerSnap.exists()) {
        return convertFirestoreSpeakerDoc(speakerSnap as QueryDocumentSnapshot);
      }
    }

    // Fallback to cache
    const speakers = await getSpeakers();
    return speakers.find((speaker) => speaker.id === speakerId) || null;
  } catch (error) {
    console.error("Error fetching speaker by ID:", error);
    return null;
  }
}

export async function getContentBySpeaker(
  speakerName: string,
  contentType: DhammaContent["contentType"]
): Promise<DhammaContent[]> {
  try {
    // First try using speaker's contentRefs if available
    const speaker = await getSpeakerById(
      speakerName.toLowerCase().replace(/\s+/g, "-")
    );

    if (speaker?.contentRefs) {
      const contentIds =
        speaker.contentRefs[
          contentType === "ebook"
            ? "ebooks"
            : contentType === "sermon"
              ? "sermons"
              : "videos"
        ];

      if (contentIds.length > 0) {
        // Get content by IDs
        const collectionName = getCollectionName(contentType);
        const content: DhammaContent[] = [];

        // Fetch content documents by ID (in batches if needed)
        for (const contentId of contentIds.slice(0, 50)) {
          // Limit to 50 for performance
          try {
            const docRef = doc(db, collectionName, contentId);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
              content.push(
                convertFirestoreDoc(
                  docSnap as QueryDocumentSnapshot,
                  contentType
                )
              );
            }
          } catch (error) {
            console.error(`Error fetching content ${contentId}:`, error);
          }
        }

        // Sort by creation date, newest first
        content.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
        return content;
      }
    }

    // Fallback to cache filtering
    const cache = await getContentCache();
    let contentArray: DhammaContent[] = [];

    if (contentType === "ebook") contentArray = cache.ebooks;
    else if (contentType === "sermon") contentArray = cache.sermons;
    else if (contentType === "video") contentArray = cache.videos;

    const content = contentArray.filter((item) =>
      item.speaker.toLowerCase().includes(speakerName.toLowerCase())
    );

    // Sort by creation date, newest first
    content.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    return content;
  } catch (error) {
    console.error("Error fetching content by speaker:", error);
    return getMockContentBySpeaker(speakerName, contentType);
  }
}

export async function searchContent(
  searchQuery: SearchQuery
): Promise<SearchResult> {
  try {
    const cache = await getContentCache();
    let allContent = [...cache.ebooks, ...cache.sermons, ...cache.videos];

    // Apply text search
    if (searchQuery.query) {
      const query = searchQuery.query.toLowerCase();
      allContent = allContent.filter(
        (item) =>
          item.title.toLowerCase().includes(query) ||
          item.description?.toLowerCase().includes(query) ||
          item.speaker.toLowerCase().includes(query) ||
          item.tags.toLowerCase().includes(query)
      );
    }

    // Apply filters
    if (searchQuery.filters.contentType?.length) {
      allContent = allContent.filter((item) =>
        searchQuery.filters.contentType?.includes(item.contentType)
      );
    }

    if (searchQuery.filters.speakers?.length) {
      allContent = allContent.filter((item) =>
        searchQuery.filters.speakers?.some((speaker) =>
          item.speaker.toLowerCase().includes(speaker.toLowerCase())
        )
      );
    }

    // Apply sorting
    if (searchQuery.sortBy === "title") {
      allContent.sort((a, b) => {
        const comparison = a.title.localeCompare(b.title);
        return searchQuery.sortOrder === "asc" ? comparison : -comparison;
      });
    } else if (searchQuery.sortBy === "date") {
      allContent.sort((a, b) => {
        const aTime = a.createdAt.getTime();
        const bTime = b.createdAt.getTime();
        return searchQuery.sortOrder === "asc" ? aTime - bTime : bTime - aTime;
      });
    }

    return {
      content: allContent,
      total: allContent.length,
      page: searchQuery.page,
      hasMore: false,
      facets: {
        speakers: [],
        categories: [],
        languages: [],
        contentTypes: []
      }
    };
  } catch (error) {
    console.error("Error searching content:", error);
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
}

// Mock data functions (for fallback)
function getMockContent(
  contentType?: DhammaContent["contentType"]
): DhammaContent[] {
  const allMockData: DhammaContent[] = [
    {
      id: "mock-sermon-1",
      title: "Introduction to Mindfulness Meditation",
      speaker: "Venerable Thich Nhat Hanh",
      contentType: "sermon",
      fileUrl: "https://example.com/audio1.mp3",
      language: "English",
      category: "Meditation",
      tags: "mindfulness, meditation, beginner",
      description:
        "A gentle introduction to the practice of mindfulness meditation and its benefits in daily life.",
      createdAt: new Date("2024-01-15"),
      durationEstimate: 1800,
      downloadCount: 1250,
      avgRating: 4.8,
      reviewCount: 87,
      featured: true
    },
    {
      id: "mock-video-1",
      title: "The Four Noble Truths Explained",
      speaker: "Bhante Henepola Gunaratana",
      contentType: "video",
      fileUrl: "https://example.com/video1.mp4",
      language: "English",
      category: "Dhamma Teaching",
      tags: "four noble truths, buddhism, fundamental",
      description:
        "A comprehensive explanation of the Four Noble Truths, the foundation of Buddhist teaching.",
      createdAt: new Date("2024-01-10"),
      durationEstimate: 2700,
      downloadCount: 950,
      avgRating: 4.9,
      reviewCount: 123,
      featured: true
    },
    {
      id: "mock-ebook-1",
      title: "The Heart Sutra Commentary",
      speaker: "Ajahn Chah",
      contentType: "ebook",
      fileUrl: "https://example.com/book1.pdf",
      language: "English",
      category: "Sutra Study",
      tags: "heart sutra, emptiness, wisdom",
      description:
        "An insightful commentary on the Heart Sutra and the concept of emptiness.",
      createdAt: new Date("2024-01-05"),
      fileSizeEstimate: 2048000,
      downloadCount: 567,
      avgRating: 4.7,
      reviewCount: 45,
      featured: false
    }
  ];

  if (!contentType) return allMockData;
  return allMockData.filter((item) => item.contentType === contentType);
}

function getMockSpeakers(): Speaker[] {
  return [
    {
      id: "venerable-thich-nhat-hanh",
      name: "Venerable Thich Nhat Hanh",
      bio: "Venerable Thich Nhat Hanh is a respected Buddhist teacher and spiritual guide, sharing wisdom through dharma teachings, meditation guidance, and spiritual discourses.",
      contentTypes: ["sermon", "video", "ebook"],
      contentRefs: { ebooks: [], sermons: [], videos: [] },
      contentCounts: { ebooks: 5, sermons: 25, videos: 10, total: 40 },
      featured: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: "bhante-henepola-gunaratana",
      name: "Bhante Henepola Gunaratana",
      bio: "Bhante Henepola Gunaratana is a respected Buddhist teacher and spiritual guide, sharing wisdom through dharma teachings, meditation guidance, and spiritual discourses.",
      contentTypes: ["sermon", "video"],
      contentRefs: { ebooks: [], sermons: [], videos: [] },
      contentCounts: { ebooks: 0, sermons: 15, videos: 8, total: 23 },
      featured: false,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ];
}

function getMockContentBySpeaker(
  speakerName: string,
  contentType: DhammaContent["contentType"]
): DhammaContent[] {
  const allMockContent = getMockContent();
  return allMockContent
    .filter(
      (content) =>
        content.speaker.toLowerCase().includes(speakerName.toLowerCase()) &&
        content.contentType === contentType
    )
    .slice(0, 10);
}

// Clear cache function (useful for development)
export function clearContentCache(): void {
  contentCache = null;
}
