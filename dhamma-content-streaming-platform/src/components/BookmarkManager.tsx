"use client";

import { useState, useEffect } from "react";
import { FeatureIcons } from "@/components/ui/icons";
import DefaultMediaCover from "./DefaultMediaCover";

interface Bookmark {
  id: string;
  contentId: string;
  title: string;
  type: "video" | "audio" | "ebook" | "other";
  speaker?: string;
  duration?: number;
  imageUrl?: string;
  bookmarkedAt: string;
  position?: number; // For resume playback
  category?: string;
  notes?: string;
  tags: string[];
}

interface BookmarkManagerProps {
  userId?: string;
  className?: string;
}

const mockBookmarks: Bookmark[] = [
  {
    id: "bm-1",
    contentId: "content-1",
    title: "The Four Foundations of Mindfulness",
    type: "audio",
    speaker: "Ajahn Chah",
    duration: 2400, // 40 minutes
    bookmarkedAt: "2024-01-15T10:30:00Z",
    position: 1200, // 20 minutes in
    category: "Meditation",
    notes: "Great explanation of satipatthana",
    tags: ["mindfulness", "meditation", "core-teaching"]
  },
  {
    id: "bm-2",
    contentId: "content-2",
    title: "Understanding Dependent Origination",
    type: "video",
    speaker: "Bhikkhu Bodhi",
    duration: 3600, // 60 minutes
    bookmarkedAt: "2024-01-14T15:45:00Z",
    position: 900, // 15 minutes in
    category: "Philosophy",
    notes: "Complex topic, need to review multiple times",
    tags: ["philosophy", "dependent-origination", "advanced"]
  },
  {
    id: "bm-3",
    contentId: "content-3",
    title: "Loving-Kindness Meditation Guide",
    type: "audio",
    speaker: "Sharon Salzberg",
    duration: 1800, // 30 minutes
    bookmarkedAt: "2024-01-13T08:20:00Z",
    category: "Meditation",
    notes: "Perfect for morning practice",
    tags: ["metta", "meditation", "beginner-friendly"]
  }
];

export default function BookmarkManager({
  className = ""
}: Omit<BookmarkManagerProps, "userId">) {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>(mockBookmarks);
  const [filteredBookmarks, setFilteredBookmarks] =
    useState<Bookmark[]>(mockBookmarks);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"date" | "title" | "speaker">("date");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [isEditingNotes, setIsEditingNotes] = useState<string | null>(null);
  const [editingNotes, setEditingNotes] = useState("");

  // Get unique categories and types for filtering
  const categories = Array.from(
    new Set(bookmarks.filter((b) => b.category).map((b) => b.category))
  );
  const types = Array.from(new Set(bookmarks.map((b) => b.type)));

  // Format duration
  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric"
    });
  };

  // Calculate progress percentage
  const getProgress = (bookmark: Bookmark) => {
    if (!bookmark.position || !bookmark.duration) return 0;
    return Math.round((bookmark.position / bookmark.duration) * 100);
  };

  // Filter and sort bookmarks
  useEffect(() => {
    let filtered = [...bookmarks];

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (bookmark) =>
          bookmark.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          bookmark.speaker?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          bookmark.notes?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          bookmark.tags.some((tag) =>
            tag.toLowerCase().includes(searchQuery.toLowerCase())
          )
      );
    }

    // Category filter
    if (selectedCategory !== "all") {
      filtered = filtered.filter(
        (bookmark) => bookmark.category === selectedCategory
      );
    }

    // Type filter
    if (selectedType !== "all") {
      filtered = filtered.filter((bookmark) => bookmark.type === selectedType);
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "title":
          return a.title.localeCompare(b.title);
        case "speaker":
          return (a.speaker || "").localeCompare(b.speaker || "");
        case "date":
        default:
          return (
            new Date(b.bookmarkedAt).getTime() -
            new Date(a.bookmarkedAt).getTime()
          );
      }
    });

    setFilteredBookmarks(filtered);
  }, [bookmarks, searchQuery, selectedCategory, selectedType, sortBy]);

  // Remove bookmark
  const removeBookmark = (bookmarkId: string) => {
    setBookmarks(bookmarks.filter((b) => b.id !== bookmarkId));
  };

  // Update notes
  const updateNotes = (bookmarkId: string, notes: string) => {
    setBookmarks(
      bookmarks.map((b) => (b.id === bookmarkId ? { ...b, notes } : b))
    );
    setIsEditingNotes(null);
    setEditingNotes("");
  };

  // Start editing notes
  const startEditingNotes = (bookmark: Bookmark) => {
    setIsEditingNotes(bookmark.id);
    setEditingNotes(bookmark.notes || "");
  };

  // Cancel editing notes
  const cancelEditingNotes = () => {
    setIsEditingNotes(null);
    setEditingNotes("");
  };

  return (
    <div
      className={`bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 ${className}`}
    >
      {/* Header */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            My Bookmarks
          </h2>
          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={() => setViewMode(viewMode === "grid" ? "list" : "grid")}
              className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500"
              aria-label={`Switch to ${viewMode === "grid" ? "list" : "grid"} view`}
            >
              <FeatureIcons.Filter className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="space-y-4">
          {/* Search */}
          <div className="relative">
            <FeatureIcons.Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search bookmarks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-4">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="all">All Categories</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>

            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="all">All Types</option>
              {types.map((type) => (
                <option key={type} value={type}>
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </option>
              ))}
            </select>

            <select
              value={sortBy}
              onChange={(e) =>
                setSortBy(e.target.value as "date" | "title" | "speaker")
              }
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="date">Sort by Date</option>
              <option value="title">Sort by Title</option>
              <option value="speaker">Sort by Speaker</option>
            </select>
          </div>
        </div>
      </div>

      {/* Bookmarks List */}
      <div className="p-6">
        {filteredBookmarks.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <FeatureIcons.Filter className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No bookmarks found
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              {searchQuery ||
              selectedCategory !== "all" ||
              selectedType !== "all"
                ? "Try adjusting your search or filters"
                : "Start bookmarking content to see it here"}
            </p>
          </div>
        ) : (
          <div
            className={
              viewMode === "grid"
                ? "grid grid-cols-1 md:grid-cols-2 gap-6"
                : "space-y-4"
            }
          >
            {filteredBookmarks.map((bookmark) => (
              <div
                key={bookmark.id}
                className={`border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow ${
                  viewMode === "list" ? "flex items-center space-x-4" : ""
                }`}
              >
                {/* Content Image/Icon */}
                <div className={viewMode === "list" ? "flex-shrink-0" : "mb-3"}>
                  <div
                    className={`relative ${viewMode === "list" ? "w-16 h-16" : "w-full h-32"} bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden`}
                  >
                    {bookmark.imageUrl ? (
                      <div className="w-full h-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center">
                        <span className="text-gray-500 dark:text-gray-400 text-xs">
                          {bookmark.title}
                        </span>
                      </div>
                    ) : (
                      <DefaultMediaCover
                        type={
                          bookmark.type === "ebook" || bookmark.type === "other"
                            ? "audio"
                            : bookmark.type
                        }
                        className="w-full h-full"
                      />
                    )}

                    {/* Progress indicator */}
                    {bookmark.position && bookmark.duration && (
                      <div className="absolute bottom-0 left-0 right-0 h-1 bg-black bg-opacity-20">
                        <div
                          className="h-full bg-orange-500"
                          style={{ width: `${getProgress(bookmark)}%` }}
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* Content Info */}
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-medium text-gray-900 dark:text-white line-clamp-2">
                      {bookmark.title}
                    </h3>
                    <button
                      type="button"
                      onClick={() => removeBookmark(bookmark.id)}
                      className="flex-shrink-0 ml-2 p-1 text-gray-400 hover:text-red-500 rounded transition-colors focus:outline-none focus:ring-2 focus:ring-red-500"
                      aria-label="Remove bookmark"
                    >
                      <FeatureIcons.Close className="w-4 h-4" />
                    </button>
                  </div>

                  {bookmark.speaker && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                      by {bookmark.speaker}
                    </p>
                  )}

                  <div className="flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400 mb-2">
                    <span className="capitalize">{bookmark.type}</span>
                    {bookmark.duration && (
                      <span>{formatDuration(bookmark.duration)}</span>
                    )}
                    {bookmark.category && <span>{bookmark.category}</span>}
                    <span>{formatDate(bookmark.bookmarkedAt)}</span>
                  </div>

                  {/* Progress info */}
                  {bookmark.position && bookmark.duration && (
                    <p className="text-xs text-orange-600 dark:text-orange-400 mb-2">
                      {getProgress(bookmark)}% complete • Resume at{" "}
                      {formatDuration(bookmark.position)}
                    </p>
                  )}

                  {/* Tags */}
                  {bookmark.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-2">
                      {bookmark.tags.map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Notes */}
                  <div className="mt-2">
                    {isEditingNotes === bookmark.id ? (
                      <div className="space-y-2">
                        <textarea
                          value={editingNotes}
                          onChange={(e) => setEditingNotes(e.target.value)}
                          placeholder="Add your notes..."
                          rows={2}
                          className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                        />
                        <div className="flex space-x-2">
                          <button
                            type="button"
                            onClick={() =>
                              updateNotes(bookmark.id, editingNotes)
                            }
                            className="px-3 py-1 text-xs bg-orange-600 hover:bg-orange-700 text-white rounded transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500"
                          >
                            Save
                          </button>
                          <button
                            type="button"
                            onClick={cancelEditingNotes}
                            className="px-3 py-1 text-xs text-gray-600 dark:text-gray-400 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-start justify-between">
                        <p className="text-sm text-gray-600 dark:text-gray-400 flex-1">
                          {bookmark.notes || "No notes added"}
                        </p>
                        <button
                          type="button"
                          onClick={() => startEditingNotes(bookmark)}
                          className="ml-2 text-xs text-orange-600 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300 focus:outline-none focus:ring-2 focus:ring-orange-500 rounded px-1"
                        >
                          {bookmark.notes ? "Edit" : "Add note"}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
