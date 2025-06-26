// Fallback content for when Firebase is unavailable
import type { DhammaContent } from "@/types/content";

export const fallbackContent: DhammaContent[] = [
  {
    id: "fallback-1",
    title: "Introduction to Mindfulness",
    speaker: "Sample Teacher",
    contentType: "audio",
    fileUrl: "",
    durationEstimate: 1800,
    language: "en",
    category: "Meditation",
    tags: ["mindfulness", "meditation", "beginner"],
    description:
      "A basic introduction to mindfulness practice and its benefits.",
    createdAt: new Date(),
    updatedAt: new Date(),
    downloadCount: 0,
    avgRating: 4.5,
    reviewCount: 10,
    featured: true,
    difficulty: "beginner",
    relatedContent: [],
    qualityScore: 85
  },
  {
    id: "fallback-2",
    title: "The Four Foundations of Mindfulness",
    speaker: "Sample Teacher",
    contentType: "audio",
    fileUrl: "",
    durationEstimate: 2400,
    language: "en",
    category: "Dharma Teaching",
    tags: ["satipatthana", "mindfulness", "intermediate"],
    description:
      "An exploration of the four foundations of mindfulness practice.",
    createdAt: new Date(),
    updatedAt: new Date(),
    downloadCount: 0,
    avgRating: 4.7,
    reviewCount: 15,
    featured: false,
    difficulty: "intermediate",
    relatedContent: [],
    qualityScore: 90
  }
];

export const getFallbackContent = (type?: "featured"): DhammaContent[] => {
  switch (type) {
    case "featured":
      return fallbackContent.filter((content) => content.featured);
    default:
      return fallbackContent;
  }
};

export const offlineMessage = {
  title: "Offline Mode",
  description: "You're currently offline. Showing cached content.",
  action: "Refresh when online"
};

export const errorMessage = {
  title: "Unable to Load Content",
  description:
    "There was an error loading content from the server. Please check your connection and try again.",
  action: "Retry"
};
