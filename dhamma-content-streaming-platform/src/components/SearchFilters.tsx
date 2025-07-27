"use client";

import { useSearchParams, usePathname, useRouter } from "next/navigation";
import { useCallback, useState, useEffect } from "react";
import { FeatureIcons } from "@/components/ui/icons";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface SearchFiltersProps {
  className?: string;
}

export interface FilterOptions {
  speaker?: string;
  category?: string;
  language?: string;
  duration?: string;
  dateRange?: string;
  sortBy?: string;
}

const durationOptions = [
  { value: "short", label: "Short (< 30 min)", max: 30 },
  { value: "medium", label: "Medium (30-60 min)", min: 30, max: 60 },
  { value: "long", label: "Long (> 60 min)", min: 60 }
];

const dateRangeOptions = [
  { value: "week", label: "This Week" },
  { value: "month", label: "This Month" },
  { value: "year", label: "This Year" },
  { value: "all", label: "All Time" }
];

const sortOptions = [
  { value: "relevance", label: "Most Relevant" },
  { value: "date", label: "Newest First" },
  { value: "popularity", label: "Most Popular" },
  { value: "duration", label: "Duration" },
  { value: "title", label: "Alphabetical" }
];

export default function SearchFilters({ className = "" }: SearchFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [isExpanded, setIsExpanded] = useState(false);
  const [filters, setFilters] = useState<FilterOptions>({
    speaker: searchParams.get("speaker") || "",
    category: searchParams.get("category") || "",
    language: searchParams.get("language") || "",
    duration: searchParams.get("duration") || "",
    dateRange: searchParams.get("dateRange") || "",
    sortBy: searchParams.get("sort") || "relevance"
  });

  // Check if any filters are active
  const hasActiveFilters = Object.values(filters).some(value => value && value !== "relevance");

  useEffect(() => {
    setFilters({
      speaker: searchParams.get("speaker") || "",
      category: searchParams.get("category") || "",
      language: searchParams.get("language") || "",
      duration: searchParams.get("duration") || "",
      dateRange: searchParams.get("dateRange") || "",
      sortBy: searchParams.get("sort") || "relevance"
    });
  }, [searchParams]);

  const createQueryString = useCallback(
    (updates: Partial<FilterOptions>) => {
      const params = new URLSearchParams(searchParams.toString());

      Object.entries(updates).forEach(([key, value]) => {
        const paramKey = key === "sortBy" ? "sort" : key;
        if (value && value !== "") {
          params.set(paramKey, value);
        } else {
          params.delete(paramKey);
        }
      });

      // Reset to page 1 when filters change
      params.set("page", "1");

      return params.toString();
    },
    [searchParams]
  );

  const handleFilterChange = (key: keyof FilterOptions, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);

    const queryString = createQueryString({ [key]: value });
    router.push(`${pathname}?${queryString}`);
  };

  const clearAllFilters = () => {
    const clearedFilters = {
      speaker: "",
      category: "",
      language: "",
      duration: "",
      dateRange: "",
      sortBy: "relevance"
    };
    setFilters(clearedFilters);

    const queryString = createQueryString(clearedFilters);
    router.push(`${pathname}?${queryString}`);
  };

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 ${className}`}>
      {/* Filter Toggle Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <FeatureIcons.Filter className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Filters
          </h3>
          {hasActiveFilters && (
            <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200 rounded-full">
              Active
            </span>
          )}
        </div>

        <div className="flex items-center space-x-2">
          {hasActiveFilters && (
            <button
              type="button"
              onClick={clearAllFilters}
              className="text-sm text-orange-600 hover:text-orange-700 dark:text-orange-400 dark:hover:text-orange-300 font-medium"
            >
              Clear All
            </button>
          )}
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 rounded-md text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-500"
            aria-label={isExpanded ? "Collapse filters" : "Expand filters"}
          >
            <FeatureIcons.ChevronDown
              className={`w-5 h-5 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
            />
          </button>
        </div>
      </div>

      {/* Quick Sort */}
      <div className="mb-4">
        <div className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Sort by
        </div>
        <Select
          value={filters.sortBy}
          onValueChange={(value) => handleFilterChange("sortBy", value)}
        >
          <SelectTrigger className="w-full" aria-label="Sort by">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {sortOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Expandable Filters */}
      {isExpanded && (
        <div className="space-y-4 border-t border-gray-200 dark:border-gray-600 pt-4">
          {/* Duration Filter */}
          <div>
            <div className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Duration
            </div>
            <Select
              value={filters.duration}
              onValueChange={(value) => handleFilterChange("duration", value)}
            >
              <SelectTrigger className="w-full" aria-label="Filter by duration">
                <SelectValue placeholder="Any duration" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Any duration</SelectItem>
                {durationOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Language Filter */}
          <div>
            <div className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Language
            </div>
            <Select
              value={filters.language}
              onValueChange={(value) => handleFilterChange("language", value)}
            >
              <SelectTrigger className="w-full" aria-label="Filter by language">
                <SelectValue placeholder="Any language" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Any language</SelectItem>
                <SelectItem value="english">English</SelectItem>
                <SelectItem value="burmese">Burmese</SelectItem>
                <SelectItem value="pali">Pali</SelectItem>
                <SelectItem value="thai">Thai</SelectItem>
                <SelectItem value="chinese">Chinese</SelectItem>
                <SelectItem value="japanese">Japanese</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Date Range Filter */}
          <div>
            <div className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Date Added
            </div>
            <Select
              value={filters.dateRange}
              onValueChange={(value) => handleFilterChange("dateRange", value)}
            >
              <SelectTrigger className="w-full" aria-label="Filter by date added">
                <SelectValue placeholder="Any time" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Any time</SelectItem>
                {dateRangeOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Category Filter - Will be populated from database */}
          <div>
            <div className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Category
            </div>
            <Select
              value={filters.category}
              onValueChange={(value) => handleFilterChange("category", value)}
            >
              <SelectTrigger className="w-full" aria-label="Filter by category">
                <SelectValue placeholder="Any category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Any category</SelectItem>
                <SelectItem value="meditation">Meditation</SelectItem>
                <SelectItem value="dharma-talk">Dharma Talk</SelectItem>
                <SelectItem value="sutra">Sutra</SelectItem>
                <SelectItem value="mindfulness">Mindfulness</SelectItem>
                <SelectItem value="vipassana">Vipassana</SelectItem>
                <SelectItem value="zen">Zen</SelectItem>
                <SelectItem value="theravada">Theravada</SelectItem>
                <SelectItem value="mahayana">Mahayana</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Speaker Filter - Will be populated from database */}
          <div>
            <div className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Teacher/Speaker
            </div>
            <Select
              value={filters.speaker}
              onValueChange={(value) => handleFilterChange("speaker", value)}
            >
              <SelectTrigger className="w-full" aria-label="Filter by teacher or speaker">
                <SelectValue placeholder="Any teacher" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Any teacher</SelectItem>
                {/* These would be populated from the database */}
                <SelectItem value="ajahn-chah">Ajahn Chah</SelectItem>
                <SelectItem value="thich-nhat-hanh">Thich Nhat Hanh</SelectItem>
                <SelectItem value="dalai-lama">Dalai Lama</SelectItem>
                <SelectItem value="joseph-goldstein">Joseph Goldstein</SelectItem>
                <SelectItem value="jack-kornfield">Jack Kornfield</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      )}
    </div>
  );
}
