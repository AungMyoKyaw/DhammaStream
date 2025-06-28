// Optimized Content service for Firestore operations with no pagination - loads all data upfront
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
  where,
  orderBy,
  limit,
  type QueryDocumentSnapshot,
  type QueryConstraint
} from "firebase/firestore";

// Get collection name based on content type
function getCollectionName(contentType: DhammaContent["contentType"]): string {
  switch (contentType) {
    case "ebook":
      return "ebooks";
    case "sermon":
      return "sermons";
    case "video":
      return "videos";
    default:
      return "sermons"; // Default fallback
  }
}

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
    // Set defaults for optional fields
    downloadCount: data.downloadCount || 0,
    avgRating: data.avgRating || 0,
    reviewCount: data.reviewCount || 0,
    featured: data.featured || false
  } as DhammaContent;
}

// Helper function to check if Firebase is properly configured and accessible
async function checkFirebaseConnection(): Promise<boolean> {
  try {
    // Try a simple read operation on one of the collections
    const testQuery = query(collection(db, "sermons"), limit(1));
    await getDocs(testQuery);
    return true;
  } catch (error) {
    console.error("Firebase connection check failed:", error);
    return false;
  }
}

// Fetch content by ID from appropriate collection
export async function getContentById(
  id: string,
  contentType: DhammaContent["contentType"]
): Promise<DhammaContent | null> {
  try {
    console.log(`🔍 Fetching content by ID: ${id} (${contentType})`);

    const collectionName = getCollectionName(contentType);
    const docRef = doc(db, collectionName, id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      const content = {
        id: docSnap.id,
        ...data,
        contentType,
        createdAt: data.createdAt?.toDate() || new Date(),
        dateRecorded: data.dateRecorded?.toDate(),
        scrapedDate: data.scrapedDate?.toDate(),
        // Set defaults for optional fields
        downloadCount: data.downloadCount || 0,
        avgRating: data.avgRating || 0,
        reviewCount: data.reviewCount || 0,
        featured: data.featured || false
      } as DhammaContent;

      console.log(`✅ Found content: ${content.title}`);
      return content;
    } else {
      console.log(`❌ Content not found: ${id}`);
      return null;
    }
  } catch (error) {
    console.error("❌ Error fetching content by ID:", error);

    // Only fall back to mock data if Firebase is not properly configured
    if (!(await checkFirebaseConnection())) {
      console.log("🔄 Falling back to mock data");
      const mockContent = getMockContent(1).find(
        (c) => c.id === id || c.id === "mock-1"
      );
      return mockContent || null;
    }

    throw new Error("Failed to fetch content");
  }
}

// Improved content fetching with proper pagination
export async function getContent(
  filters: ContentFilters = {},
  page = 1,
  pageLimit = 20,
  sortBy: "createdAt" | "title" = "createdAt",
  sortOrder: "asc" | "desc" = "desc"
): Promise<PaginatedResponse<DhammaContent>> {
  try {
    console.log("🔄 Fetching content with improved pagination...", {
      filters,
      page,
      pageLimit,
      sortBy,
      sortOrder
    });

    // Check Firebase connection first
    const isConnected = await checkFirebaseConnection();
    if (!isConnected) {
      console.log("❌ Firebase not accessible, using mock data");
      return getMockPaginatedContent(filters, page, pageLimit);
    }

    const contentTypes = filters.contentType || ["ebook", "sermon", "video"];
    const allContent: DhammaContent[] = [];

    // Query each collection with proper pagination
    for (const contentType of contentTypes) {
      const collectionName = getCollectionName(contentType);
      console.log(`🔍 Querying collection: ${collectionName}`);

      try {
        // Build query constraints
        const constraints: QueryConstraint[] = [];

        // Add filters
        if (filters.speakers && filters.speakers.length > 0) {
          constraints.push(
            where("speaker", "in", filters.speakers.slice(0, 10))
          ); // Firestore limit
        }

        if (filters.categories && filters.categories.length > 0) {
          constraints.push(
            where("category", "in", filters.categories.slice(0, 10))
          );
        }

        if (filters.languages && filters.languages.length > 0) {
          constraints.push(
            where("language", "in", filters.languages.slice(0, 10))
          );
        }

        if (filters.featured !== undefined) {
          constraints.push(where("featured", "==", filters.featured));
        }

        // Add sorting
        constraints.push(orderBy(sortBy, sortOrder));

        // Add pagination limit
        constraints.push(limit(pageLimit));

        // Create and execute query
        const q = query(collection(db, collectionName), ...constraints);
        const querySnapshot = await getDocs(q);

        console.log(
          `📄 Found ${querySnapshot.size} documents in ${collectionName}`
        );

        querySnapshot.forEach((doc) => {
          allContent.push(convertFirestoreDoc(doc, contentType));
        });
      } catch (collectionError) {
        console.error(`❌ Error querying ${collectionName}:`, collectionError);
        // Continue with other collections even if one fails
      }
    }

    // Sort all content together if we have multiple collections
    if (contentTypes.length > 1) {
      allContent.sort((a, b) => {
        if (sortBy === "title") {
          return sortOrder === "asc"
            ? a.title.localeCompare(b.title)
            : b.title.localeCompare(a.title);
        } else {
          const aTime = a.createdAt.getTime();
          const bTime = b.createdAt.getTime();
          return sortOrder === "asc" ? aTime - bTime : bTime - aTime;
        }
      });
    }

    console.log("✅ Content fetch complete:", {
      totalFound: allContent.length,
      hasMore: allContent.length === pageLimit * contentTypes.length
    });

    return {
      items: allContent,
      total: allContent.length, // Note: This is not the true total, would need separate count query
      page,
      limit: pageLimit,
      hasMore: allContent.length === pageLimit * contentTypes.length
    };
  } catch (error) {
    console.error("❌ Error fetching content:", error);

    // Fall back to mock data only if Firebase is completely inaccessible
    console.log("🔄 Falling back to mock data");
    return getMockPaginatedContent(filters, page, pageLimit);
  }
}

// Get featured content for home page
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

    console.log(`✅ Found ${result.items.length} featured items`);
    return result.items;
  } catch (error) {
    console.error("❌ Error fetching featured content:", error);
    return getMockContent(limit).filter((c) => c.featured);
  }
}

// Improved search with better error handling
export async function searchContent(
  searchQuery: SearchQuery
): Promise<SearchResult> {
  try {
    console.log("🔍 Searching content...", searchQuery);

    // Check Firebase connection first
    const isConnected = await checkFirebaseConnection();
    if (!isConnected) {
      console.log("❌ Firebase not accessible, using mock search");
      return getMockSearchResult(searchQuery);
    }

    const contentTypes = searchQuery.filters?.contentType || [
      "ebook",
      "sermon",
      "video"
    ];
    const allContent: DhammaContent[] = [];

    // Query each collection
    for (const contentType of contentTypes) {
      const collectionName = getCollectionName(contentType);

      try {
        const constraints: QueryConstraint[] = [];

        // Apply filters from searchQuery.filters
        if (searchQuery.filters) {
          if (
            searchQuery.filters.speakers &&
            searchQuery.filters.speakers.length > 0
          ) {
            constraints.push(
              where("speaker", "in", searchQuery.filters.speakers.slice(0, 10))
            );
          }
          if (
            searchQuery.filters.categories &&
            searchQuery.filters.categories.length > 0
          ) {
            constraints.push(
              where(
                "category",
                "in",
                searchQuery.filters.categories.slice(0, 10)
              )
            );
          }
          if (
            searchQuery.filters.languages &&
            searchQuery.filters.languages.length > 0
          ) {
            constraints.push(
              where(
                "language",
                "in",
                searchQuery.filters.languages.slice(0, 10)
              )
            );
          }
        }

        const sortByField =
          searchQuery.sortBy === "relevance" ? "createdAt" : searchQuery.sortBy;
        constraints.push(orderBy(sortByField, searchQuery.sortOrder));

        if (searchQuery.limit) {
          constraints.push(limit(searchQuery.limit));
        }

        const q = query(collection(db, collectionName), ...constraints);
        const querySnapshot = await getDocs(q);

        querySnapshot.forEach((doc) => {
          const content = convertFirestoreDoc(doc, contentType);

          // Simple text search in title and description
          if (searchQuery.query) {
            const searchLower = searchQuery.query.toLowerCase();
            const titleMatch = content.title
              .toLowerCase()
              .includes(searchLower);
            const descMatch = content.description
              ?.toLowerCase()
              .includes(searchLower);
            const speakerMatch = content.speaker
              .toLowerCase()
              .includes(searchLower);

            if (titleMatch || descMatch || speakerMatch) {
              allContent.push(content);
            }
          } else {
            allContent.push(content);
          }
        });
      } catch (collectionError) {
        console.error(`❌ Error searching ${collectionName}:`, collectionError);
      }
    }

    // Apply pagination
    const startIndex = searchQuery.page
      ? (searchQuery.page - 1) * (searchQuery.limit || 20)
      : 0;
    const endIndex = startIndex + (searchQuery.limit || 20);
    const paginatedContent = allContent.slice(startIndex, endIndex);

    return {
      content: paginatedContent,
      total: allContent.length,
      page: searchQuery.page,
      hasMore: endIndex < allContent.length,
      facets: {
        speakers: [],
        categories: [],
        languages: [],
        contentTypes: []
      }
    };
  } catch (error) {
    console.error("❌ Error searching content:", error);
    return getMockSearchResult(searchQuery);
  }
}

// Get speakers with better error handling
export async function getSpeakers(
  contentType?: DhammaContent["contentType"]
): Promise<Speaker[]> {
  try {
    console.log("🔄 Fetching speakers...", { contentType });

    // Check Firebase connection first
    const isConnected = await checkFirebaseConnection();
    if (!isConnected) {
      console.log("❌ Firebase not accessible, using mock speakers");
      return getMockSpeakers();
    }

    const contentTypes: DhammaContent["contentType"][] = contentType
      ? [contentType]
      : ["ebook", "sermon", "video"];
    const speakerNames = new Set<string>();

    // Query each collection to get unique speakers
    for (const type of contentTypes) {
      try {
        const collectionName = getCollectionName(type);
        const q = query(collection(db, collectionName), limit(1000)); // Reasonable limit
        const querySnapshot = await getDocs(q);

        querySnapshot.forEach((doc) => {
          const data = doc.data();
          if (data.speaker) {
            speakerNames.add(data.speaker);
          }
        });
      } catch (collectionError) {
        console.error(
          `❌ Error fetching speakers from ${type}:`,
          collectionError
        );
      }
    }

    const speakers = Array.from(speakerNames)
      .sort((a, b) => a.localeCompare(b))
      .map((name) => ({ id: name.toLowerCase().replace(/\s+/g, "-"), name }));

    console.log(`✅ Found ${speakers.length} unique speakers`);
    return speakers;
  } catch (error) {
    console.error("❌ Error fetching speakers:", error);
    return getMockSpeakers();
  }
}

export async function getSpeakerById(
  speakerId: string
): Promise<Speaker | null> {
  try {
    // Since speakers are derived from content, we convert the ID back to a name
    const name = speakerId
      .replace(/-/g, " ")
      .replace(/\b\w/g, (l) => l.toUpperCase());
    return { id: speakerId, name };
  } catch (error) {
    console.error("Error fetching speaker by ID:", error);
    return null;
  }
}

// Get content by speaker with improved error handling
export async function getContentBySpeaker(
  speakerName: string,
  contentType: DhammaContent["contentType"]
): Promise<DhammaContent[]> {
  try {
    console.log("🔄 Fetching content by speaker...", {
      speakerName,
      contentType
    });

    // Check Firebase connection first
    const isConnected = await checkFirebaseConnection();
    if (!isConnected) {
      console.log("❌ Firebase not accessible, using mock content by speaker");
      return getMockContentBySpeaker(speakerName, contentType);
    }

    const collectionName = getCollectionName(contentType);
    const q = query(
      collection(db, collectionName),
      where("speaker", "==", speakerName),
      orderBy("createdAt", "desc"),
      limit(50) // Reasonable limit
    );

    const querySnapshot = await getDocs(q);
    const content: DhammaContent[] = [];

    querySnapshot.forEach((doc) => {
      content.push(convertFirestoreDoc(doc, contentType));
    });

    console.log(`✅ Found ${content.length} items by ${speakerName}`);
    return content;
  } catch (error) {
    console.error("❌ Error fetching content by speaker:", error);
    return getMockContentBySpeaker(speakerName, contentType);
  }
}

// Get random content with better performance
export async function getRandomContent(
  contentType?: DhammaContent["contentType"],
  limit = 5
): Promise<DhammaContent[]> {
  try {
    console.log("🔄 Fetching random content...", { contentType, limit });

    // For random content, we'll fetch recent content instead of truly random
    // This is more performant than fetching all content and randomizing
    const filters: ContentFilters = contentType
      ? { contentType: [contentType] }
      : {};
    const result = await getContent(filters, 1, limit * 2, "createdAt", "desc");

    // Shuffle and return limited results
    const shuffled = result.items.sort(() => Math.random() - 0.5);
    const randomContent = shuffled.slice(0, limit);

    console.log(`🎲 Returning ${randomContent.length} random items`);
    return randomContent;
  } catch (error) {
    console.error("❌ Error fetching random content:", error);
    return getMockContent(limit);
  }
}

// Mock data functions (improved)
function getMockPaginatedContent(
  filters: ContentFilters,
  page: number,
  pageLimit: number
): PaginatedResponse<DhammaContent> {
  const mockData = getMockContent(50); // Generate more mock data

  // Apply filters
  let filteredData = mockData;

  if (filters.contentType && filters.contentType.length > 0) {
    filteredData = filteredData.filter((item) =>
      filters.contentType?.includes(item.contentType)
    );
  }

  if (filters.speakers && filters.speakers.length > 0) {
    filteredData = filteredData.filter((item) =>
      filters.speakers?.some((speaker) =>
        item.speaker.toLowerCase().includes(speaker.toLowerCase())
      )
    );
  }

  if (filters.featured !== undefined) {
    filteredData = filteredData.filter(
      (item) => item.featured === filters.featured
    );
  }

  // Apply pagination
  const startIndex = (page - 1) * pageLimit;
  const endIndex = startIndex + pageLimit;
  const paginatedItems = filteredData.slice(startIndex, endIndex);

  return {
    items: paginatedItems,
    total: filteredData.length,
    page,
    limit: pageLimit,
    hasMore: endIndex < filteredData.length
  };
}

function getMockSearchResult(searchQuery: SearchQuery): SearchResult {
  const mockData = getMockContent(20);

  // Simple search filtering
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

  const startIndex = searchQuery.page
    ? (searchQuery.page - 1) * (searchQuery.limit || 20)
    : 0;
  const endIndex = startIndex + (searchQuery.limit || 20);
  const paginatedContent = filteredData.slice(startIndex, endIndex);

  return {
    content: paginatedContent,
    total: filteredData.length,
    page: searchQuery.page,
    hasMore: endIndex < filteredData.length,
    facets: {
      speakers: [],
      categories: [],
      languages: [],
      contentTypes: []
    }
  };
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
  const allMockContent = getMockContent(20);
  return allMockContent
    .filter(
      (content) =>
        content.speaker.toLowerCase().includes(speakerName.toLowerCase()) &&
        content.contentType === contentType
    )
    .slice(0, 5);
}

function getMockContent(limit = 5): DhammaContent[] {
  const mockData: DhammaContent[] = [
    {
      id: "mock-1",
      title: "Introduction to Mindfulness Meditation",
      speaker: "Venerable Thich Nhat Hanh",
      contentType: "sermon",
      fileUrl: "https://example.com/audio1.mp3",
      language: "English",
      category: "Meditation",
      tags: "mindfulness, meditation, beginner",
      description:
        "A gentle introduction to the practice of mindfulness meditation and its benefits in daily life.",
      createdAt: new Date(),
      durationEstimate: 1800,
      downloadCount: 1250,
      avgRating: 4.8,
      reviewCount: 87,
      featured: true
    },
    {
      id: "mock-2",
      title: "The Four Noble Truths Explained",
      speaker: "Bhante Henepola Gunaratana",
      contentType: "video",
      fileUrl: "https://example.com/video1.mp4",
      language: "English",
      category: "Dhamma Teaching",
      tags: "four noble truths, buddhism, fundamental",
      description:
        "A comprehensive explanation of the Four Noble Truths, the foundation of Buddhist teaching.",
      createdAt: new Date(),
      durationEstimate: 2700,
      downloadCount: 950,
      avgRating: 4.9,
      reviewCount: 123,
      featured: true
    },
    {
      id: "mock-3",
      title: "The Heart Sutra Commentary",
      speaker: "Ajahn Chah",
      contentType: "ebook",
      fileUrl: "https://example.com/book1.pdf",
      language: "English",
      category: "Sutra Study",
      tags: "heart sutra, emptiness, wisdom",
      description:
        "An insightful commentary on the Heart Sutra and the concept of emptiness.",
      createdAt: new Date(),
      fileSizeEstimate: 2048000,
      downloadCount: 567,
      avgRating: 4.7,
      reviewCount: 45,
      featured: false
    },
    {
      id: "mock-4",
      title: "Walking Meditation Practice",
      speaker: "Ajahn Brahm",
      contentType: "sermon",
      fileUrl: "https://example.com/audio2.mp3",
      language: "English",
      category: "Meditation",
      tags: "walking meditation, mindfulness, practice",
      description:
        "Learn the art of walking meditation and how to maintain mindfulness while moving.",
      createdAt: new Date(),
      durationEstimate: 1200,
      downloadCount: 789,
      avgRating: 4.6,
      reviewCount: 67,
      featured: false
    },
    {
      id: "mock-5",
      title: "Loving-Kindness Meditation Guide",
      speaker: "Sharon Salzberg",
      contentType: "video",
      fileUrl: "https://example.com/video2.mp4",
      language: "English",
      category: "Meditation",
      tags: "loving-kindness, metta, compassion",
      description:
        "A step-by-step guide to practicing loving-kindness meditation for self and others.",
      createdAt: new Date(),
      durationEstimate: 2100,
      downloadCount: 1100,
      avgRating: 4.8,
      reviewCount: 89,
      featured: true
    }
  ];

  return mockData.slice(0, limit);
}
