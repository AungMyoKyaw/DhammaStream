// Main Content service for DhammaStream
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
  collection,
  getDocs,
  query,
  orderBy,
  doc,
  getDoc,
  limit as firestoreLimit,
  type QueryDocumentSnapshot
} from "firebase/firestore";

// In-memory cache for all content
interface ContentCache {
  ebooks: DhammaContent[];
  sermons: DhammaContent[];
  videos: DhammaContent[];
  lastFetch: number;
  speakers: Speaker[];
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
    downloadCount: data.downloadCount || 0,
    avgRating: data.avgRating || 0,
    reviewCount: data.reviewCount || 0,
    featured: data.featured || false
  } as DhammaContent;
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

  // Generate speakers list
  const allContent = [...cache.ebooks, ...cache.sermons, ...cache.videos];
  const speakerNames = new Set<string>();
  allContent.forEach((content) => {
    if (content.speaker) {
      speakerNames.add(content.speaker);
    }
  });

  cache.speakers = Array.from(speakerNames)
    .sort()
    .map((name) => ({
      id: name.toLowerCase().replace(/\s+/g, "-"),
      name
    }));

  console.log(
    `🎯 Cache loaded: ${allContent.length} items, ${cache.speakers.length} speakers`
  );
  return cache;
}

// Get or refresh cache
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

    // Sort content
    allContent.sort((a, b) => {
      let comparison = 0;
      if (sortBy === "title") {
        comparison = a.title.localeCompare(b.title);
      } else {
        comparison = a.createdAt.getTime() - b.createdAt.getTime();
      }
      return sortOrder === "desc" ? -comparison : comparison;
    });

    return {
      items: allContent,
      total: allContent.length,
      page: 1,
      limit: allContent.length,
      hasMore: false
    };
  } catch (error) {
    console.error("Error fetching content:", error);
    return {
      items: [],
      total: 0,
      page: 1,
      limit: 0,
      hasMore: false
    };
  }
}

export async function searchContent(
  searchQuery: SearchQuery
): Promise<SearchResult> {
  try {
    const cache = await getContentCache();
    const contentTypes = searchQuery.filters?.contentType || [
      "ebook",
      "sermon",
      "video"
    ];
    let allContent: DhammaContent[] = [];

    // Collect content
    contentTypes.forEach((type) => {
      if (type === "ebook") allContent = [...allContent, ...cache.ebooks];
      else if (type === "sermon")
        allContent = [...allContent, ...cache.sermons];
      else if (type === "video") allContent = [...allContent, ...cache.videos];
    });

    // Apply search filter
    if (searchQuery.query?.trim()) {
      const searchLower = searchQuery.query.toLowerCase();
      allContent = allContent.filter((content) => {
        return (
          content.title.toLowerCase().includes(searchLower) ||
          content.description?.toLowerCase().includes(searchLower) ||
          content.speaker.toLowerCase().includes(searchLower) ||
          content.tags.toLowerCase().includes(searchLower) ||
          content.category.toLowerCase().includes(searchLower)
        );
      });
    }

    // Apply other filters
    if (searchQuery.filters?.speakers?.length) {
      allContent = allContent.filter((content) =>
        searchQuery.filters?.speakers?.some((speaker) =>
          content.speaker.toLowerCase().includes(speaker.toLowerCase())
        )
      );
    }

    // Sort results
    allContent.sort((a, b) => {
      const comparison = a.createdAt.getTime() - b.createdAt.getTime();
      return searchQuery.sortOrder === "desc" ? -comparison : comparison;
    });

    return {
      content: allContent,
      total: allContent.length,
      page: searchQuery.page || 1,
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

export async function getFeaturedContent(limit = 10): Promise<DhammaContent[]> {
  try {
    const result = await getContent({ featured: true }, "createdAt", "desc");
    return result.items.slice(0, limit);
  } catch (error) {
    console.error("Error fetching featured content:", error);
    return getMockContent()
      .filter((c) => c.featured)
      .slice(0, limit);
  }
}

export async function getRandomContent(
  contentType?: DhammaContent["contentType"],
  limit = 5
): Promise<DhammaContent[]> {
  try {
    const filters: ContentFilters = contentType
      ? { contentType: [contentType] }
      : {};
    const result = await getContent(filters);

    // Shuffle and return limited results
    const shuffled = [...result.items].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, limit);
  } catch (error) {
    console.error("Error fetching random content:", error);
    return getMockContent().slice(0, limit);
  }
}

export async function getSpeakers(
  contentType?: DhammaContent["contentType"]
): Promise<Speaker[]> {
  try {
    const cache = await getContentCache();

    if (contentType) {
      let contentArray: DhammaContent[] = [];
      if (contentType === "ebook") contentArray = cache.ebooks;
      else if (contentType === "sermon") contentArray = cache.sermons;
      else if (contentType === "video") contentArray = cache.videos;

      const speakerNames = new Set<string>();
      contentArray.forEach((content) => {
        if (content.speaker) speakerNames.add(content.speaker);
      });

      return Array.from(speakerNames)
        .sort()
        .map((name) => ({
          id: name.toLowerCase().replace(/\s+/g, "-"),
          name
        }));
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

// Mock data functions
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
    },
    {
      id: "mock-sermon-2",
      title: "Walking Meditation Practice",
      speaker: "Ajahn Brahm",
      contentType: "sermon",
      fileUrl: "https://example.com/audio2.mp3",
      language: "English",
      category: "Meditation",
      tags: "walking meditation, mindfulness, practice",
      description:
        "Learn the art of walking meditation and how to maintain mindfulness while moving.",
      createdAt: new Date("2024-01-12"),
      durationEstimate: 1200,
      downloadCount: 789,
      avgRating: 4.6,
      reviewCount: 67,
      featured: false
    },
    {
      id: "mock-video-2",
      title: "Loving-Kindness Meditation Guide",
      speaker: "Sharon Salzberg",
      contentType: "video",
      fileUrl: "https://example.com/video2.mp4",
      language: "English",
      category: "Meditation",
      tags: "loving-kindness, metta, compassion",
      description:
        "A step-by-step guide to practicing loving-kindness meditation for self and others.",
      createdAt: new Date("2024-01-08"),
      durationEstimate: 2100,
      downloadCount: 1100,
      avgRating: 4.8,
      reviewCount: 89,
      featured: true
    }
  ];

  if (contentType) {
    return allMockData.filter((item) => item.contentType === contentType);
  }

  return allMockData;
}

function getMockSpeakers(): Speaker[] {
  return [
    { id: "venerable-thich-nhat-hanh", name: "Venerable Thich Nhat Hanh" },
    { id: "bhante-henepola-gunaratana", name: "Bhante Henepola Gunaratana" },
    { id: "ajahn-chah", name: "Ajahn Chah" },
    { id: "ajahn-brahm", name: "Ajahn Brahm" },
    { id: "sharon-salzberg", name: "Sharon Salzberg" }
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
