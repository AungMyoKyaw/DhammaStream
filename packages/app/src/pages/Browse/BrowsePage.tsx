import { useId, useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  Search,
  Grid,
  List,
  SlidersHorizontal,
  Play,
  Clock,
  User
} from "lucide-react";
import { Button } from "@/components/common/Button";
import { usePlayerStore } from "@/store";
import type { DhammaContent, ContentFilters } from "@/types/content";
import { getContent, searchContent } from "@/services/content";

import { formatDuration } from "@/utils";
import { cn } from "@/utils";

// Content card component for results
function ContentCard({ content }: { content: DhammaContent }) {
  const { dispatch, currentContent, isPlaying } = usePlayerStore();
  const isCurrentContent = currentContent?.id === content.id;

  const handlePlay = () => {
    dispatch({
      type: "PLAY",
      content,
      options: { autoplay: true }
    });
  };

  return (
    <div className="bg-card border border-border rounded-lg p-4 hover:shadow-lg transition-shadow">
      {/* Content Type Badge */}
      <div className="flex items-center justify-between mb-3">
        <span
          className={cn(
            "inline-flex items-center px-2 py-1 rounded-full text-xs font-medium",
            content.contentType === "sermon" &&
              "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
            content.contentType === "video" &&
              "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
            content.contentType === "ebook" &&
              "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
          )}
        >
          {content.contentType.toUpperCase()}
        </span>
      </div>

      {/* Content Info */}
      <h3 className="font-semibold text-foreground mb-2 line-clamp-2">
        {content.title}
      </h3>

      <Link
        to={`/speakers/${encodeURIComponent(content.speaker)}`}
        className="text-sm text-muted-foreground mb-3 flex items-center hover:text-foreground transition-colors"
      >
        <User className="h-4 w-4 mr-1" />
        {content.speaker || "Unknown Speaker"}
      </Link>

      <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
        {content.description}
      </p>

      {/* Metadata */}
      <div className="flex items-center justify-between text-xs text-muted-foreground mb-4">
        <div className="flex items-center space-x-4">
          <span className="flex items-center">
            <Clock className="h-3 w-3 mr-1" />
            {formatDuration(content.durationEstimate || 0)}
          </span>
          <span>{content.downloadCount} downloads</span>
          <span>★ {content.avgRating}</span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center space-x-2">
        <Button
          variant={isCurrentContent && isPlaying ? "secondary" : "player"}
          size="sm"
          onClick={handlePlay}
          className="flex-1"
        >
          <Play className="h-4 w-4 mr-2" />
          {isCurrentContent && isPlaying ? "Now Playing" : "Play"}
        </Button>
      </div>
    </div>
  );
}

export default function BrowsePage() {
  const languageSelectId = useId();
  const [searchParams] = useSearchParams();

  const [searchQuery, setSearchQuery] = useState(() => {
    return searchParams.get("q") || "";
  });
  const [filters, setFilters] = useState<ContentFilters>({
    speakers: [],
    categories: [],
    languages: [],
    difficulty: []
  });
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [sortBy, setSortBy] = useState<
    "relevance" | "date" | "title" | "rating" | "duration"
  >("relevance");
  const [showFilters, setShowFilters] = useState(false);

  // Update search query when URL params change
  useEffect(() => {
    const queryParam = searchParams.get("q");
    if (queryParam && queryParam !== searchQuery) {
      setSearchQuery(queryParam);
    }
  }, [searchParams, searchQuery]);

  // Use React Query for content fetching with fallback
  const {
    data: contentData,
    isLoading,
    error
  } = useQuery({
    queryKey: ["browse-content", searchQuery, filters, sortBy],
    queryFn: async () => {
      try {
        if (searchQuery.trim()) {
          // Use search function if there's a query
          const searchResult = await searchContent({
            query: searchQuery,
            filters,
            sortBy,
            sortOrder: "desc",
            page: 1,
            limit: 1000 // Get all results, no pagination
          });
          return {
            items: searchResult.content,
            total: searchResult.total
          };
        } else {
          // Use general content fetching for browsing
          const mappedSortBy =
            sortBy === "relevance"
              ? "createdAt"
              : sortBy === "date"
                ? "createdAt"
                : sortBy === "title"
                  ? "title"
                  : "createdAt";

          const result = await getContent(filters, mappedSortBy, "desc");
          return result;
        }
      } catch (error) {
        console.error("Error fetching content:", error);
        // Return fallback content on error
        return {
          items: [],
          total: 0
        };
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1
  });

  const results = contentData?.items || [];
  const totalResults = contentData?.total || 0;

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Search Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-4">
          Browse Content
        </h1>

        {/* Search Bar */}
        <div className="flex gap-4 mb-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search dharma content, teachers, topics..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={cn(
                "w-full pl-10 pr-4 py-3 bg-background border border-border rounded-lg",
                "focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent",
                "placeholder:text-muted-foreground"
              )}
            />
          </div>

          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center space-x-2"
          >
            <SlidersHorizontal className="h-4 w-4" />
            <span>Filters</span>
          </Button>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="bg-card border border-border rounded-lg p-4 mb-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Content Type */}
              <div>
                <h4 className="block text-sm font-medium text-foreground mb-2">
                  Content Type
                </h4>
                <div className="space-y-2">
                  {(["sermon", "video", "ebook"] as const).map((type) => (
                    <label key={type} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={filters.contentType?.includes(type)}
                        onChange={(e) => {
                          const newTypes = e.target.checked
                            ? [...(filters.contentType || []), type]
                            : (filters.contentType || []).filter(
                                (t: DhammaContent["contentType"]) => t !== type
                              );
                          setFilters({ ...filters, contentType: newTypes });
                        }}
                        className="mr-2"
                      />
                      <span className="text-sm capitalize">{type}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Difficulty */}
              <div>
                <h4 className="block text-sm font-medium text-foreground mb-2">
                  Difficulty
                </h4>
                <div className="space-y-2">
                  {(["beginner", "intermediate", "advanced"] as const).map(
                    (level) => (
                      <label key={level} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={filters.difficulty?.includes(level)}
                          onChange={(e) => {
                            const newLevels = e.target.checked
                              ? [...(filters.difficulty || []), level]
                              : (filters.difficulty || []).filter(
                                  (l: DhammaContent["difficulty"]) =>
                                    l !== level
                                );
                            setFilters({ ...filters, difficulty: newLevels });
                          }}
                          className="mr-2"
                        />
                        <span className="text-sm capitalize">{level}</span>
                      </label>
                    )
                  )}
                </div>
              </div>

              {/* Language */}
              <div>
                <label
                  htmlFor={languageSelectId}
                  className="block text-sm font-medium text-foreground mb-2"
                >
                  Language
                </label>
                <select
                  id={languageSelectId}
                  value={filters.languages?.[0] || ""}
                  onChange={(e) => {
                    setFilters({
                      ...filters,
                      languages: e.target.value ? [e.target.value] : []
                    });
                  }}
                  className="w-full p-2 border border-border rounded bg-background text-foreground"
                >
                  <option value="">All Languages</option>
                  <option value="en">English</option>
                  <option value="my">Myanmar</option>
                  <option value="th">Thai</option>
                  <option value="zh">Chinese</option>
                </select>
              </div>

              {/* Clear Filters */}
              <div className="flex items-end">
                <Button
                  variant="outline"
                  onClick={() =>
                    setFilters({
                      contentType: [],
                      speakers: [],
                      categories: [],
                      languages: [],
                      difficulty: []
                    })
                  }
                  className="w-full"
                >
                  Clear Filters
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <span className="text-sm text-muted-foreground">
              {isLoading ? "Loading..." : `${totalResults} results`}
              {error && (
                <span className="text-orange-600 ml-2">
                  (showing fallback content)
                </span>
              )}
            </span>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
              className="px-3 py-1 border border-border rounded bg-background text-foreground text-sm"
            >
              <option value="relevance">Sort by Relevance</option>
              <option value="date">Sort by Date</option>
              <option value="title">Sort by Title</option>
              <option value="rating">Sort by Rating</option>
              <option value="duration">Sort by Duration</option>
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <Button
              variant={viewMode === "grid" ? "default" : "ghost"}
              size="icon-sm"
              onClick={() => setViewMode("grid")}
            >
              <Grid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "ghost"}
              size="icon-sm"
              onClick={() => setViewMode("list")}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="mb-8">
        {isLoading ? (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }, (_, i) => (
                <div
                  key={`content-skeleton-${Date.now()}-${i}`}
                  className="animate-pulse"
                >
                  <div className="bg-card border border-border rounded-lg p-4">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16 mb-3"></div>
                    <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-3"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full mb-4"></div>
                    <div className="flex items-center space-x-4 mb-4">
                      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
                      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
                      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-12"></div>
                    </div>
                    <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : results.length > 0 ? (
          <div
            className={cn(
              viewMode === "grid"
                ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                : "space-y-4"
            )}
          >
            {results.map((content: DhammaContent) => (
              <ContentCard key={content.id} content={content} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No results found.</p>
            <p className="text-sm text-muted-foreground mt-2">
              Try adjusting your search terms or filters.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
