"use client";

import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useLiveRegion } from "@/components/ui/live-region";
import { Collapsible, CollapsibleContent } from "@/components/ui/collapsible";
import {
  Search,
  Filter,
  ChevronDown,
  ChevronRight,
  X,
  Clock,
  Calendar,
  User,
  Tag,
  BookOpen,
  Play,
  Video,
  FileText,
  Mic,
  Globe,
  TrendingUp,
  History,
  Bookmark
} from "lucide-react";

interface SearchFilter {
  contentTypes: string[];
  languages: string[];
  speakers: string[];
  categories: string[];
  tags: string[];
  dateRange: {
    start?: string;
    end?: string;
  };
  durationRange: {
    min?: number;
    max?: number;
  };
  hasTranscription: boolean;
  isBookmarked: boolean;
}

interface SearchResult {
  id: string;
  title: string;
  type: string;
  speaker: string;
  description: string;
  duration?: number;
  language: string;
  category: string;
  tags: string[];
  dateRecorded?: string;
  relevanceScore: number;
  matchedTerms: string[];
  highlights: {
    title?: string;
    description?: string;
    transcript?: string;
  };
}

interface SearchSuggestion {
  term: string;
  type: "recent" | "popular" | "speaker" | "category" | "tag";
  icon: React.ReactNode;
  frequency?: number;
}

const SEARCH_HISTORY_KEY = "dhamma-search-history";
const MAX_SEARCH_HISTORY = 10;

// Mock data - in real app this would come from API
const MOCK_SPEAKERS = [
  "Ajahn Chah",
  "Ajahn Sumedho",
  "Bhante Henepola Gunaratana",
  "Joseph Goldstein",
  "Tara Brach"
];
const MOCK_CATEGORIES = [
  "Meditation",
  "Suttas",
  "Abhidhamma",
  "Ethics",
  "Philosophy"
];
const MOCK_LANGUAGES = ["English", "Pali", "Thai", "German", "Spanish"];
const MOCK_TAGS = [
  "mindfulness",
  "loving-kindness",
  "vipassana",
  "samatha",
  "dhamma-talk",
  "Q&A"
];

const DEFAULT_FILTERS: SearchFilter = {
  contentTypes: [],
  languages: [],
  speakers: [],
  categories: [],
  tags: [],
  dateRange: {},
  durationRange: {},
  hasTranscription: false,
  isBookmarked: false
};

export function EnhancedSearch() {
  const [query, setQuery] = useState("");
  const [filters, setFilters] = useState<SearchFilter>(DEFAULT_FILTERS);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [selectedTab, setSelectedTab] = useState("all");
  const [sortBy, setSortBy] = useState<
    "relevance" | "date" | "title" | "duration"
  >("relevance");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [resultCount, setResultCount] = useState(0);
  const { announce } = useLiveRegion();
  const searchInputRef = useRef<HTMLInputElement>(null);
  const suggestionTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Load search history
  useEffect(() => {
    if (typeof window === "undefined") return; // Server-side check

    const saved = localStorage.getItem(SEARCH_HISTORY_KEY);
    if (saved) {
      setSearchHistory(JSON.parse(saved));
    }
  }, []);

  // Save search history
  const saveSearchHistory = useCallback(
    (searchQuery: string) => {
      if (!searchQuery.trim()) return;

      const updated = [
        searchQuery,
        ...searchHistory.filter((h) => h !== searchQuery)
      ].slice(0, MAX_SEARCH_HISTORY);

      setSearchHistory(updated);
      if (typeof window !== "undefined") {
        localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(updated));
      }
    },
    [searchHistory]
  );

  // Generate search suggestions
  const generateSuggestions = useCallback(
    (searchQuery: string) => {
      const query_lower = searchQuery.toLowerCase();
      const suggestions: SearchSuggestion[] = [];

      // Recent searches
      searchHistory
        .filter((term) => term.toLowerCase().includes(query_lower))
        .slice(0, 3)
        .forEach((term) => {
          suggestions.push({
            term,
            type: "recent",
            icon: <History className="h-4 w-4" />
          });
        });

      // Popular terms (mock)
      const popularTerms = [
        "meditation",
        "mindfulness",
        "loving-kindness",
        "vipassana"
      ];
      popularTerms
        .filter((term) => term.includes(query_lower))
        .slice(0, 2)
        .forEach((term) => {
          suggestions.push({
            term,
            type: "popular",
            icon: <TrendingUp className="h-4 w-4" />,
            frequency: Math.floor(Math.random() * 100) + 50
          });
        });

      // Speakers
      MOCK_SPEAKERS.filter((speaker) =>
        speaker.toLowerCase().includes(query_lower)
      )
        .slice(0, 3)
        .forEach((speaker) => {
          suggestions.push({
            term: speaker,
            type: "speaker",
            icon: <User className="h-4 w-4" />
          });
        });

      // Categories
      MOCK_CATEGORIES.filter((category) =>
        category.toLowerCase().includes(query_lower)
      )
        .slice(0, 2)
        .forEach((category) => {
          suggestions.push({
            term: category,
            type: "category",
            icon: <BookOpen className="h-4 w-4" />
          });
        });

      // Tags
      MOCK_TAGS.filter((tag) => tag.toLowerCase().includes(query_lower))
        .slice(0, 3)
        .forEach((tag) => {
          suggestions.push({
            term: tag,
            type: "tag",
            icon: <Tag className="h-4 w-4" />
          });
        });

      setSuggestions(suggestions.slice(0, 10));
    },
    [searchHistory]
  );

  // Handle query change with debounced suggestions
  const handleQueryChange = useCallback(
    (value: string) => {
      setQuery(value);

      if (suggestionTimeoutRef.current) {
        clearTimeout(suggestionTimeoutRef.current);
      }

      if (value.trim().length > 0) {
        setShowSuggestions(true);
        suggestionTimeoutRef.current = setTimeout(() => {
          generateSuggestions(value);
        }, 300);
      } else {
        setShowSuggestions(false);
        setSuggestions([]);
      }
    },
    [generateSuggestions]
  );

  // Mock search function
  const performSearch = useCallback(
    async (searchQuery: string, searchFilters: SearchFilter) => {
      if (!searchQuery.trim()) {
        setResults([]);
        setResultCount(0);
        return;
      }

      setIsLoading(true);
      saveSearchHistory(searchQuery);
      setShowSuggestions(false);

      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 800));

      // Mock search results with highlights
      const mockResults: SearchResult[] = Array.from(
        { length: Math.floor(Math.random() * 20) + 5 },
        (_, i) => ({
          id: `result-${i}`,
          title: `Dhamma Talk: ${searchQuery} and the Path to Liberation ${i + 1}`,
          type: ["audio", "video", "ebook"][Math.floor(Math.random() * 3)],
          speaker:
            MOCK_SPEAKERS[Math.floor(Math.random() * MOCK_SPEAKERS.length)],
          description: `This teaching explores the profound aspects of ${searchQuery} in Buddhist practice, offering practical guidance for daily life and meditation.`,
          duration: Math.floor(Math.random() * 3600) + 600,
          language:
            MOCK_LANGUAGES[Math.floor(Math.random() * MOCK_LANGUAGES.length)],
          category:
            MOCK_CATEGORIES[Math.floor(Math.random() * MOCK_CATEGORIES.length)],
          tags: MOCK_TAGS.slice(0, Math.floor(Math.random() * 4) + 1),
          dateRecorded: new Date(
            Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000
          )
            .toISOString()
            .split("T")[0],
          relevanceScore: Math.random() * 100,
          matchedTerms: [searchQuery],
          highlights: {
            title: `Dhamma Talk: <mark>${searchQuery}</mark> and the Path to Liberation ${i + 1}`,
            description: `This teaching explores the profound aspects of <mark>${searchQuery}</mark> in Buddhist practice...`
          }
        })
      );

      // Apply filters
      let filteredResults = mockResults;

      if (searchFilters.contentTypes.length > 0) {
        filteredResults = filteredResults.filter((r) =>
          searchFilters.contentTypes.includes(r.type)
        );
      }

      if (searchFilters.speakers.length > 0) {
        filteredResults = filteredResults.filter((r) =>
          searchFilters.speakers.includes(r.speaker)
        );
      }

      if (searchFilters.languages.length > 0) {
        filteredResults = filteredResults.filter((r) =>
          searchFilters.languages.includes(r.language)
        );
      }

      // Sort results
      filteredResults.sort((a, b) => {
        switch (sortBy) {
          case "date":
            return (
              new Date(b.dateRecorded || 0).getTime() -
              new Date(a.dateRecorded || 0).getTime()
            );
          case "title":
            return a.title.localeCompare(b.title);
          case "duration":
            return (b.duration || 0) - (a.duration || 0);
          default: // relevance
            return b.relevanceScore - a.relevanceScore;
        }
      });

      setResults(filteredResults);
      setResultCount(filteredResults.length);
      setIsLoading(false);

      announce(`Found ${filteredResults.length} results for "${searchQuery}"`);
    },
    [saveSearchHistory, sortBy, announce]
  );

  // Handle search
  const handleSearch = useCallback(() => {
    if (query.trim()) {
      performSearch(query, filters);
    }
  }, [query, filters, performSearch]);

  // Handle filter change
  const handleFilterChange = useCallback(
    (
      key: keyof SearchFilter,
      value:
        | string[]
        | string
        | boolean
        | { start?: string; end?: string }
        | { min?: number; max?: number }
    ) => {
      const newFilters = { ...filters, [key]: value };
      setFilters(newFilters);

      if (query.trim()) {
        performSearch(query, newFilters);
      }
    },
    [filters, query, performSearch]
  );

  // Clear all filters
  const clearFilters = useCallback(() => {
    setFilters(DEFAULT_FILTERS);
    if (query.trim()) {
      performSearch(query, DEFAULT_FILTERS);
    }
  }, [query, performSearch]);

  // Handle suggestion selection
  const handleSuggestionSelect = useCallback(
    (suggestion: SearchSuggestion) => {
      setQuery(suggestion.term);
      setShowSuggestions(false);
      performSearch(suggestion.term, filters);
    },
    [filters, performSearch]
  );

  // Filter results by tab
  const filteredResults = useMemo(() => {
    if (selectedTab === "all") return results;
    return results.filter((result) => result.type === selectedTab);
  }, [results, selectedTab]);

  // Format duration
  const formatDuration = useCallback((seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  }, []);

  // Get content type icon
  const getContentTypeIcon = useCallback((type: string) => {
    switch (type) {
      case "audio":
        return <Mic className="h-4 w-4" />;
      case "video":
        return <Video className="h-4 w-4" />;
      case "ebook":
        return <FileText className="h-4 w-4" />;
      default:
        return <BookOpen className="h-4 w-4" />;
    }
  }, []);

  // Handle enter key
  const handleKeyPress = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter") {
        handleSearch();
      }
    },
    [handleSearch]
  );

  return (
    <div className="space-y-6">
      <div className="relative">
        {/* Search Input */}
        <div className="relative">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                ref={searchInputRef}
                type="text"
                placeholder="Search Dhamma content, speakers, topics..."
                value={query}
                onChange={(e) => handleQueryChange(e.target.value)}
                onKeyPress={handleKeyPress}
                onFocus={() => query.trim() && setShowSuggestions(true)}
                className="pl-10 pr-4 h-12 text-base"
              />
              {query && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setQuery("");
                    setShowSuggestions(false);
                    setResults([]);
                    searchInputRef.current?.focus();
                  }}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
                  aria-label="Clear search"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
            <Button
              onClick={handleSearch}
              disabled={!query.trim() || isLoading}
              className="h-12 px-6"
            >
              {isLoading ? "Searching..." : "Search"}
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="h-12 px-4"
              aria-label="Toggle filters"
            >
              <Filter className="h-4 w-4 mr-2" />
              Filters
              {showFilters ? (
                <ChevronDown className="h-4 w-4 ml-2" />
              ) : (
                <ChevronRight className="h-4 w-4 ml-2" />
              )}
            </Button>
          </div>

          {/* Search Suggestions */}
          {showSuggestions && suggestions.length > 0 && (
            <Card className="absolute top-full mt-2 w-full z-50 shadow-lg">
              <CardContent className="p-0">
                <div className="max-h-80 overflow-y-auto">
                  {suggestions.map((suggestion, index) => (
                    <button
                      key={`${suggestion.type}-${suggestion.term}-${index}`}
                      type="button"
                      onClick={() => handleSuggestionSelect(suggestion)}
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-muted/50 text-left transition-colors border-b last:border-b-0"
                    >
                      <div className="text-muted-foreground">
                        {suggestion.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium truncate">
                          {suggestion.term}
                        </div>
                        <div className="text-sm text-muted-foreground flex items-center gap-2">
                          <span className="capitalize">{suggestion.type}</span>
                          {suggestion.frequency && (
                            <span>• {suggestion.frequency} searches</span>
                          )}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Advanced Filters */}
        <Collapsible open={showFilters}>
          <CollapsibleContent className="mt-4">
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Advanced Filters</CardTitle>
                  <Button variant="outline" size="sm" onClick={clearFilters}>
                    Clear All
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {/* Content Types */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Content Type</Label>
                    <div className="space-y-2">
                      {[
                        {
                          value: "audio",
                          label: "Audio",
                          icon: <Mic className="h-4 w-4" />
                        },
                        {
                          value: "video",
                          label: "Video",
                          icon: <Video className="h-4 w-4" />
                        },
                        {
                          value: "ebook",
                          label: "E-books",
                          icon: <FileText className="h-4 w-4" />
                        }
                      ].map((type) => (
                        <div
                          key={type.value}
                          className="flex items-center space-x-2"
                        >
                          <Checkbox
                            id={type.value}
                            checked={filters.contentTypes.includes(type.value)}
                            onCheckedChange={(checked) => {
                              const newTypes = checked
                                ? [...filters.contentTypes, type.value]
                                : filters.contentTypes.filter(
                                    (t) => t !== type.value
                                  );
                              handleFilterChange("contentTypes", newTypes);
                            }}
                          />
                          <Label
                            htmlFor={type.value}
                            className="flex items-center gap-2 text-sm"
                          >
                            {type.icon}
                            {type.label}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Languages */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Language</Label>
                    <Select
                      value={filters.languages[0] || ""}
                      onValueChange={(value) =>
                        handleFilterChange("languages", value ? [value] : [])
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select language" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">All Languages</SelectItem>
                        {MOCK_LANGUAGES.map((lang) => (
                          <SelectItem key={lang} value={lang}>
                            {lang}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Sort By */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Sort By</Label>
                    <Select
                      value={sortBy}
                      onValueChange={(
                        value: "relevance" | "date" | "title" | "duration"
                      ) => setSortBy(value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="relevance">Relevance</SelectItem>
                        <SelectItem value="date">Date</SelectItem>
                        <SelectItem value="title">Title</SelectItem>
                        <SelectItem value="duration">Duration</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Special Filters */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium">Special Filters</Label>
                  <div className="flex flex-wrap gap-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="hasTranscription"
                        checked={filters.hasTranscription}
                        onCheckedChange={(checked) =>
                          handleFilterChange("hasTranscription", checked)
                        }
                      />
                      <Label htmlFor="hasTranscription" className="text-sm">
                        Has Transcription
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="isBookmarked"
                        checked={filters.isBookmarked}
                        onCheckedChange={(checked) =>
                          handleFilterChange("isBookmarked", checked)
                        }
                      />
                      <Label
                        htmlFor="isBookmarked"
                        className="flex items-center gap-2 text-sm"
                      >
                        <Bookmark className="h-4 w-4" />
                        Bookmarked Only
                      </Label>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </CollapsibleContent>
        </Collapsible>
      </div>

      {/* Search Results */}
      {(results.length > 0 || query.trim()) && (
        <div className="space-y-4">
          {/* Results Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h2 className="text-xl font-semibold">
                {isLoading ? "Searching..." : `Search Results`}
              </h2>
              {!isLoading && resultCount > 0 && (
                <Badge variant="secondary">
                  {resultCount} result{resultCount !== 1 ? "s" : ""}
                </Badge>
              )}
            </div>
          </div>

          {/* Content Type Tabs - mobile-friendly scrollable */}
          <Tabs value={selectedTab} onValueChange={setSelectedTab}>
            <div className="overflow-x-auto scrollbar-hide">
              <TabsList className="grid grid-cols-4 min-w-max sm:w-full">
                <TabsTrigger
                  value="all"
                  className="flex items-center gap-2 whitespace-nowrap"
                >
                  <Globe className="h-4 w-4" />
                  <span className="hidden sm:inline">All</span> (
                  {results.length})
                </TabsTrigger>
                <TabsTrigger
                  value="audio"
                  className="flex items-center gap-2 whitespace-nowrap"
                >
                  <Mic className="h-4 w-4" />
                  <span className="hidden sm:inline">Audio</span> (
                  {results.filter((r) => r.type === "audio").length})
                </TabsTrigger>
                <TabsTrigger
                  value="video"
                  className="flex items-center gap-2 whitespace-nowrap"
                >
                  <Video className="h-4 w-4" />
                  <span className="hidden sm:inline">Video</span> (
                  {results.filter((r) => r.type === "video").length})
                </TabsTrigger>
                <TabsTrigger
                  value="ebook"
                  className="flex items-center gap-2 whitespace-nowrap"
                >
                  <FileText className="h-4 w-4" />
                  <span className="hidden sm:inline">E-books</span> (
                  {results.filter((r) => r.type === "ebook").length})
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value={selectedTab} className="space-y-4">
              {/* Results List */}
              {isLoading && (
                <div className="space-y-4">
                  {Array.from(
                    { length: 5 },
                    (_, i) => `loading-${Date.now()}-${i}`
                  ).map((key) => (
                    <Card key={key} className="animate-pulse">
                      <CardContent className="p-6">
                        <div className="space-y-3">
                          <div className="h-4 bg-muted rounded w-3/4"></div>
                          <div className="h-3 bg-muted rounded w-1/2"></div>
                          <div className="h-3 bg-muted rounded w-full"></div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}

              {!isLoading && filteredResults.length === 0 && (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <Search className="h-16 w-16 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium mb-2">
                      No results found
                    </h3>
                    <p className="text-muted-foreground text-center max-w-md">
                      {query.trim()
                        ? `We couldn't find any content matching "${query}". Try adjusting your search terms or filters.`
                        : "Enter a search term to find Dhamma content."}
                    </p>
                  </CardContent>
                </Card>
              )}

              {!isLoading &&
                filteredResults.length > 0 &&
                filteredResults.map((result) => (
                  <Card
                    key={result.id}
                    className="hover:shadow-md transition-shadow cursor-pointer"
                  >
                    <CardContent className="p-6">
                      <div className="space-y-3">
                        {/* Title and Type - mobile-first layout */}
                        <div className="space-y-3">
                          <div className="flex-1 min-w-0">
                            <h3 className="text-lg font-semibold line-clamp-2">
                              {result.title}
                            </h3>

                            {/* Mobile-friendly metadata layout */}
                            <div className="flex flex-wrap items-center gap-2 mt-2">
                              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                {getContentTypeIcon(result.type)}
                                <span className="capitalize">
                                  {result.type}
                                </span>
                              </div>
                              {result.duration && (
                                <>
                                  <span className="text-muted-foreground hidden sm:inline">
                                    •
                                  </span>
                                  <span className="text-sm text-muted-foreground flex items-center gap-1">
                                    <Clock className="h-3 w-3" />
                                    {formatDuration(result.duration)}
                                  </span>
                                </>
                              )}
                              <span className="text-muted-foreground hidden sm:inline">
                                •
                              </span>
                              <span className="text-sm text-muted-foreground flex items-center gap-1">
                                <User className="h-3 w-3" />
                                <span className="truncate max-w-32 sm:max-w-none">
                                  {result.speaker}
                                </span>
                              </span>
                            </div>
                          </div>

                          {/* Action buttons - responsive positioning */}
                          <div className="flex items-center gap-2 sm:absolute sm:top-0 sm:right-0">
                            <Badge variant="outline" className="text-xs">
                              {result.relevanceScore.toFixed(0)}% match
                            </Badge>
                            <Button variant="ghost" size="sm">
                              <Play className="h-4 w-4" />
                              <span className="sr-only">
                                Play {result.title}
                              </span>
                            </Button>
                          </div>
                        </div>

                        {/* Description */}
                        <p className="text-muted-foreground line-clamp-2">
                          {result.description}
                        </p>

                        {/* Metadata */}
                        <div className="flex items-center justify-between text-sm text-muted-foreground">
                          <div className="flex items-center gap-4">
                            <span className="flex items-center gap-1">
                              <BookOpen className="h-3 w-3" />
                              {result.category}
                            </span>
                            <span className="flex items-center gap-1">
                              <Globe className="h-3 w-3" />
                              {result.language}
                            </span>
                            {result.dateRecorded && (
                              <span className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {new Date(
                                  result.dateRecorded
                                ).toLocaleDateString()}
                              </span>
                            )}
                          </div>

                          {/* Tags */}
                          <div className="flex gap-1">
                            {result.tags.slice(0, 3).map((tag) => (
                              <Badge
                                key={`${result.id}-${tag}`}
                                variant="secondary"
                                className="text-xs"
                              >
                                {tag}
                              </Badge>
                            ))}
                            {result.tags.length > 3 && (
                              <Badge variant="secondary" className="text-xs">
                                +{result.tags.length - 3}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </TabsContent>
          </Tabs>
        </div>
      )}
    </div>
  );
}
