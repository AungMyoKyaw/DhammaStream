import type { ResumeData } from "@/types/database";

const RESUME_STORAGE_KEY = "dhamma-resume-data";

function getStorageKey(contentId: number): string {
  return `${RESUME_STORAGE_KEY}-${contentId}`;
}

// Save resume position for a content item
export function savePosition(contentId: number, position: number): void {
  if (typeof window === "undefined") return;

  const resumeData: ResumeData = {
    contentId,
    position,
    lastPlayed: new Date().toISOString()
  };

  try {
    localStorage.setItem(getStorageKey(contentId), JSON.stringify(resumeData));
  } catch (error) {
    console.warn("Failed to save resume position:", error);
  }
}

// Get resume position for a content item
export function getPosition(contentId: number): number | null {
  if (typeof window === "undefined") return null;

  try {
    const data = localStorage.getItem(getStorageKey(contentId));
    if (!data) return null;

    const resumeData: ResumeData = JSON.parse(data);

    // Return position if content was played in the last 30 days
    const lastPlayed = new Date(resumeData.lastPlayed);
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    if (lastPlayed > thirtyDaysAgo) {
      return resumeData.position;
    }

    // Clean up old data
    clearPosition(contentId);
    return null;
  } catch (error) {
    console.warn("Failed to get resume position:", error);
    return null;
  }
}

// Clear resume position for a content item
export function clearPosition(contentId: number): void {
  if (typeof window === "undefined") return;

  try {
    localStorage.removeItem(getStorageKey(contentId));
  } catch (error) {
    console.warn("Failed to clear resume position:", error);
  }
}

// Get all resume data (for potential future features like "Continue Watching")
export function getAllResumeData(): ResumeData[] {
  if (typeof window === "undefined") return [];

  const resumeData: ResumeData[] = [];

  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(RESUME_STORAGE_KEY)) {
        const data = localStorage.getItem(key);
        if (data) {
          const parsed: ResumeData = JSON.parse(data);
          resumeData.push(parsed);
        }
      }
    }
  } catch (error) {
    console.warn("Failed to get all resume data:", error);
  }

  return resumeData.sort(
    (a, b) =>
      new Date(b.lastPlayed).getTime() - new Date(a.lastPlayed).getTime()
  );
}

// Clean up old resume data (called periodically)
export function cleanupOldData(): void {
  if (typeof window === "undefined") return;

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  try {
    const keysToRemove: string[] = [];

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(RESUME_STORAGE_KEY)) {
        const data = localStorage.getItem(key);
        if (data) {
          const resumeData: ResumeData = JSON.parse(data);
          const lastPlayed = new Date(resumeData.lastPlayed);

          if (lastPlayed <= thirtyDaysAgo) {
            keysToRemove.push(key);
          }
        }
      }
    }

    keysToRemove.forEach((key) => localStorage.removeItem(key));
  } catch (error) {
    console.warn("Failed to cleanup old resume data:", error);
  }
}
