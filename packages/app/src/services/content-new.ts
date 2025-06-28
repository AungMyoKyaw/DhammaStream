// Optimized Content service - No pagination, loads all data upfront for performance
import type {
  DhammaContent,
  SearchQuery,
  SearchResult,
  ContentFilters,
  Speaker
} from "@/types";
import { db } from "../firebase";
import { collection, getDocs, query, orderBy } from "firebase/firestore";

// In-memory cache for all content to eliminate repeated Firestore calls
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
  doc: any,
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

// Check Firebase connection
async function checkFirebaseConnection(): Promise<boolean> {
  try {
    const testQuery = query(collection(db, "sermons"));
    const snapshot = await getDocs(testQuery);
    return snapshot.size >= 0;
  } catch (error) {
    console.error("Firebase connection check failed:", error);
    return false;
  }
}

// Load all content from all collections into memory cache
async function loadAllContent(): Promise<ContentCache> {
  console.log("🔄 Loading all content into memory cache...");

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

  const contentTypes: Array<{
    type: DhammaContent["contentType"];
    collectionName: string;
  }> = [
    { type: "ebook", collectionName: "ebooks" },
    { type: "sermon", collectionName: "sermons" },
    { type: "video", collectionName: "videos" }
  ];

  // Load all content types in parallel for maximum performance
  const loadPromises = contentTypes.map(async ({ type, collectionName }) => {
    try {
      console.log(`📚 Loading all ${collectionName}...`);
      const q = query(
        collection(db, collectionName),
        orderBy("createdAt", "desc")
      );
      const querySnapshot = await getDocs(q);

      const items: DhammaContent[] = [];
      querySnapshot.forEach((doc) => {
        items.push(convertFirestoreDoc(doc, type));
      });

      console.log(`✅ Loaded ${items.length} items from ${collectionName}`);
      return { type, items };
    } catch (error) {
      console.error(`❌ Error loading ${collectionName}:`, error);
      return { type, items: getMockContent(type) };
    }
  });

  const results = await Promise.all(loadPromises);

  // Populate cache
  results.forEach(({ type, items }) => {
    if (type === "ebook") cache.ebooks = items;
    else if (type === "sermon") cache.sermons = items;
    else if (type === "video") cache.videos = items;
  });

  // Extract unique speakers from all content
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
    `🎯 Cache loaded: ${allContent.length} total items, ${cache.speakers.length} speakers`
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

// Fetch content by ID from cache
export async function getContentById(
  id: string,
  contentType: DhammaContent["contentType"]
): Promise<DhammaContent | null> {
  try {
    console.log(`🔍 Fetching content by ID: ${id} (${contentType})`);

    const cache = await getContentCache();
    let contentArray: DhammaContent[];

    if (contentType === "ebook") contentArray = cache.ebooks;
    else if (contentType === "sermon") contentArray = cache.sermons;
    else contentArray = cache.videos;

    const content = contentArray.find((item) => item.id === id);

    if (content) {
      console.log(`✅ Found content: ${content.title}`);
      return content;
    } else {
      console.log(`❌ Content not found: ${id}`);
      return null;
    }
  } catch (error) {
    console.error("❌ Error fetching content by ID:", error);
    return null;
  }
}

// Get all content with filtering and sorting (no pagination)
export async function getContent(
  filters: ContentFilters = {},
  _page = 1,
  _pageLimit = 50,
  sortBy: "createdAt" | "title" = "createdAt",
  sortOrder: "asc" | "desc" = "desc"
): Promise<{ items: DhammaContent[]; total: number; hasMore: boolean }> {
  try {
    console.log("🔄 Fetching all content...", { filters, sortBy, sortOrder });

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
    if (filters.speakers && filters.speakers.length > 0) {
      allContent = allContent.filter((content) =>
        filters.speakers?.some((speaker) =>
          content.speaker.toLowerCase().includes(speaker.toLowerCase())
        )
      );
    }

    if (filters.categories && filters.categories.length > 0) {
      allContent = allContent.filter((content) =>
        filters.categories?.includes(content.category)
      );
    }

    if (filters.languages && filters.languages.length > 0) {
      allContent = allContent.filter((content) =>
        filters.languages?.includes(content.language)
      );
    }

    if (filters.difficulty && filters.difficulty.length > 0) {
      allContent = allContent.filter(
        (content) =>
          content.difficulty && filters.difficulty?.includes(content.difficulty)
      );
    }

    if (filters.featured !== undefined) {
      allContent = allContent.filter(
        (content) => content.featured === filters.featured
      );
    }

    if (filters.minDuration) {
      allContent = allContent.filter(
        (content) =>
          (content.durationEstimate || 0) >= (filters.minDuration || 0)
      );
    }

    if (filters.maxDuration) {
      allContent = allContent.filter(
        (content) =>
          (content.durationEstimate || 0) <= (filters.maxDuration || 0)
      );
    }

    // Sort content
    allContent.sort((a, b) => {
      let comparison = 0;

      switch (sortBy) {
        case "title":
          comparison = a.title.localeCompare(b.title);
          break;
        case "createdAt":
        default:
          comparison = a.createdAt.getTime() - b.createdAt.getTime();
          break;
      }

      return sortOrder === "desc" ? -comparison : comparison;
    });

    console.log(`✅ Filtered and sorted ${allContent.length} items`);
    return {
      items: allContent,
      total: allContent.length,
      hasMore: false // No pagination
    };
  } catch (error) {
    console.error("❌ Error fetching all content:", error);
    return {
      items: getMockContent(),
      total: 0,
      hasMore: false
    };
  }
}

// Get featured content
export async function getFeaturedContent(limit = 10): Promise<DhammaContent[]> {
  try {
    console.log("🔄 Fetching featured content...");

    const result = await getContent(
      { featured: true },
      1,
      limit,
      "createdAt",
      "desc"
    );
    const featured = result.items.slice(0, limit);

    console.log(`✅ Found ${featured.length} featured items`);
    return featured;
  } catch (error) {
    console.error("❌ Error fetching featured content:", error);
    return getMockContent()
      .filter((c) => c.featured)
      .slice(0, limit);
  }
}

// Search content with advanced filtering
export async function searchContent(
  searchQuery: SearchQuery
): Promise<SearchResult> {
  try {
    console.log("🔍 Searching content...", searchQuery);

    const cache = await getContentCache();
    const contentTypes = searchQuery.filters?.contentType || [
      "ebook",
      "sermon",
      "video"
    ];

    let allContent: DhammaContent[] = [];

    // Collect content from requested types
    contentTypes.forEach((type) => {
      if (type === "ebook") allContent = [...allContent, ...cache.ebooks];
      else if (type === "sermon")
        allContent = [...allContent, ...cache.sermons];
      else if (type === "video") allContent = [...allContent, ...cache.videos];
    });

    // Apply search query if provided
    if (searchQuery.query?.trim()) {
      const searchLower = searchQuery.query.toLowerCase();
      allContent = allContent.filter((content) => {
        const titleMatch = content.title.toLowerCase().includes(searchLower);
        const descMatch =
          content.description?.toLowerCase().includes(searchLower) || false;
        const speakerMatch = content.speaker
          .toLowerCase()
          .includes(searchLower);
        const tagsMatch = content.tags.toLowerCase().includes(searchLower);
        const categoryMatch = content.category
          .toLowerCase()
          .includes(searchLower);

        return (
          titleMatch || descMatch || speakerMatch || tagsMatch || categoryMatch
        );
      });
    }

    // Apply additional filters
    if (
      searchQuery.filters?.speakers &&
      searchQuery.filters.speakers.length > 0
    ) {
      allContent = allContent.filter((content) =>
        searchQuery.filters?.speakers?.some((speaker) =>
          content.speaker.toLowerCase().includes(speaker.toLowerCase())
        )
      );
    }

    if (
      searchQuery.filters?.categories &&
      searchQuery.filters.categories.length > 0
    ) {
      allContent = allContent.filter((content) =>
        searchQuery.filters?.categories?.includes(content.category)
      );
    }

    if (
      searchQuery.filters?.languages &&
      searchQuery.filters.languages.length > 0
    ) {
      allContent = allContent.filter((content) =>
        searchQuery.filters?.languages?.includes(content.language)
      );
    }

    if (
      searchQuery.filters?.difficulty &&
      searchQuery.filters.difficulty.length > 0
    ) {
      allContent = allContent.filter(
        (content) =>
          content.difficulty &&
          searchQuery.filters?.difficulty?.includes(content.difficulty)
      );
    }

    // Sort results
    const sortBy =
      searchQuery.sortBy === "relevance" ? "createdAt" : searchQuery.sortBy;
    allContent.sort((a, b) => {
      let comparison = 0;

      switch (sortBy) {
        case "title":
          comparison = a.title.localeCompare(b.title);
          break;
        case "rating":
          comparison = (a.avgRating || 0) - (b.avgRating || 0);
          break;
        case "duration":
          comparison = (a.durationEstimate || 0) - (b.durationEstimate || 0);
          break;
        case "date":
        default:
          comparison = a.createdAt.getTime() - b.createdAt.getTime();
          break;
      }

      return searchQuery.sortOrder === "desc" ? -comparison : comparison;
    });

    // Generate facets for better search experience
    const facets = {
      speakers: generateFacets(allContent, "speaker"),
      categories: generateFacets(allContent, "category"),
      languages: generateFacets(allContent, "language"),
      contentTypes: generateContentTypeFacets(allContent)
    };

    console.log(`🎯 Search complete: ${allContent.length} results`);

    return {
      content: allContent,
      total: allContent.length,
      page: searchQuery.page,
      hasMore: false,
      facets
    };
  } catch (error) {
    console.error("❌ Error searching content:", error);
    return getMockSearchResult(searchQuery);
  }
}

// Get all speakers
export async function getSpeakers(
  contentType?: DhammaContent["contentType"]
): Promise<Speaker[]> {
  try {
    console.log("🔄 Fetching speakers...", { contentType });

    const cache = await getContentCache();

    if (contentType) {
      // Filter speakers by content type
      let contentArray: DhammaContent[];
      if (contentType === "ebook") contentArray = cache.ebooks;
      else if (contentType === "sermon") contentArray = cache.sermons;
      else contentArray = cache.videos;

      const speakerNames = new Set<string>();
      contentArray.forEach((content) => {
        if (content.speaker) {
          speakerNames.add(content.speaker);
        }
      });

      const speakers = Array.from(speakerNames)
        .sort()
        .map((name) => ({
          id: name.toLowerCase().replace(/\s+/g, "-"),
          name
        }));

      console.log(`✅ Found ${speakers.length} speakers for ${contentType}`);
      return speakers;
    }

    console.log(`✅ Found ${cache.speakers.length} total speakers`);
    return cache.speakers;
  } catch (error) {
    console.error("❌ Error fetching speakers:", error);
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

// Get content by speaker
export async function getContentBySpeaker(
  speakerName: string,
  contentType: DhammaContent["contentType"]
): Promise<DhammaContent[]> {
  try {
    console.log("🔄 Fetching content by speaker...", {
      speakerName,
      contentType
    });

    const cache = await getContentCache();
    let contentArray: DhammaContent[];

    if (contentType === "ebook") contentArray = cache.ebooks;
    else if (contentType === "sermon") contentArray = cache.sermons;
    else contentArray = cache.videos;

    const content = contentArray.filter((item) =>
      item.speaker.toLowerCase().includes(speakerName.toLowerCase())
    );

    // Sort by creation date, newest first
    content.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    console.log(`✅ Found ${content.length} items by ${speakerName}`);
    return content;
  } catch (error) {
    console.error("❌ Error fetching content by speaker:", error);
    return getMockContentBySpeaker(speakerName, contentType);
  }
}

// Get random content (from cache for performance)
export async function getRandomContent(
  contentType?: DhammaContent["contentType"],
  limit = 5
): Promise<DhammaContent[]> {
  try {
    console.log("🔄 Fetching random content...", { contentType, limit });

    const filters: ContentFilters = contentType
      ? { contentType: [contentType] }
      : {};
    const result = await getContent(filters);
    const allContent = result.items;

    // Shuffle array and return limited results
    const shuffled = [...allContent].sort(() => Math.random() - 0.5);
    const randomContent = shuffled.slice(0, limit);

    console.log(`🎲 Returning ${randomContent.length} random items`);
    return randomContent;
  } catch (error) {
    console.error("❌ Error fetching random content:", error);
    return getMockContent().slice(0, limit);
  }
}

// Helper function to generate facets for search
function generateFacets(
  content: DhammaContent[],
  field: keyof DhammaContent
): Array<{ name: string; count: number }> {
  const counts = new Map<string, number>();

  content.forEach((item) => {
    const value = item[field] as string;
    if (value) {
      counts.set(value, (counts.get(value) || 0) + 1);
    }
  });

  return Array.from(counts.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);
}

function generateContentTypeFacets(
  content: DhammaContent[]
): Array<{ type: string; count: number }> {
  const counts = new Map<string, number>();

  content.forEach((item) => {
    counts.set(item.contentType, (counts.get(item.contentType) || 0) + 1);
  });

  return Array.from(counts.entries())
    .map(([type, count]) => ({ type, count }))
    .sort((a, b) => b.count - a.count);
}

// Mock data functions (improved for development)
function getMockContent(
  contentType?: DhammaContent["contentType"],
  limit = 20
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

  let filteredData = allMockData;
  if (contentType) {
    filteredData = allMockData.filter(
      (item) => item.contentType === contentType
    );
  }

  return filteredData.slice(0, limit);
}

function getMockSpeakers(): Speaker[] {
  return [
    { id: "venerable-thich-nhat-hanh", name: "Venerable Thich Nhat Hanh" },
    { id: "bhante-henepola-gunaratana", name: "Bhante Henepola Gunaratana" },
    { id: "ajahn-chah", name: "Ajahn Chah" },
    { id: "ajahn-brahm", name: "Ajahn Brahm" },
    { id: "sharon-salzberg", name: "Sharon Salzberg" },
    { id: "jack-kornfield", name: "Jack Kornfield" },
    { id: "pema-chodron", name: "Pema Chödrön" },
    { id: "dalai-lama", name: "His Holiness the Dalai Lama" }
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

function getMockSearchResult(searchQuery: SearchQuery): SearchResult {
  const mockData = getMockContent();

  let filteredData = mockData;
  if (searchQuery.query) {
    const query = searchQuery.query.toLowerCase();
    filteredData = mockData.filter(
      (item) =>
        item.title.toLowerCase().includes(query) ||
        item.description?.toLowerCase().includes(query) ||
        item.speaker.toLowerCase().includes(query)
    );
  }

  return {
    content: filteredData,
    total: filteredData.length,
    page: searchQuery.page,
    hasMore: false,
    facets: {
      speakers: [],
      categories: [],
      languages: [],
      contentTypes: []
    }
  };
}

// Force cache refresh (useful for development)
export function clearContentCache(): void {
  contentCache = null;
  console.log("🗑️ Content cache cleared");
}
