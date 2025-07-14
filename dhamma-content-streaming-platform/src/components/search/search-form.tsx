"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Search, Filter, X, Clock, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger
} from "@/components/ui/collapsible";
import { useLiveRegion } from "@/components/ui/live-region";
import { useInteractionTracking } from "@/hooks/use-performance";

export function SearchForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { announce } = useLiveRegion();
  const { trackInteraction } = useInteractionTracking();

  const [keywords, setKeywords] = useState(searchParams.get("q") || "");
  const [speaker, setSpeaker] = useState(
    searchParams.get("speaker") || "all-speakers"
  );
  const [categories, setCategories] = useState<string[]>(
    searchParams.get("categories")?.split(",").filter(Boolean) || []
  );
  const [language, setLanguage] = useState(
    searchParams.get("language") || "all-languages"
  );
  const [contentTypes, setContentTypes] = useState<string[]>(
    searchParams.get("types")?.split(",").filter(Boolean) || []
  );
  const [sortBy, setSortBy] = useState(searchParams.get("sort") || "relevance");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);

  // Load recent searches from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem("dhamma-recent-searches");
      if (stored) {
        setRecentSearches(JSON.parse(stored).slice(0, 5));
      }
    } catch (error) {
      console.warn("Failed to load recent searches:", error);
    }
  }, []);

  // Save search to recent searches
  const saveRecentSearch = useCallback((query: string) => {
    if (!query.trim()) return;

    try {
      const current = JSON.parse(
        localStorage.getItem("dhamma-recent-searches") || "[]"
      );
      const updated = [
        query,
        ...current.filter((s: string) => s !== query)
      ].slice(0, 5);
      localStorage.setItem("dhamma-recent-searches", JSON.stringify(updated));
      setRecentSearches(updated);
    } catch (error) {
      console.warn("Failed to save recent search:", error);
    }
  }, []);

  // Debounced search suggestions
  useEffect(() => {
    if (keywords.length < 2) {
      setSuggestions([]);
      return;
    }

    const timer = setTimeout(() => {
      // Mock suggestions - in real app, fetch from API
      const mockSuggestions = [
        "Four Noble Truths",
        "Noble Eightfold Path",
        "Mindfulness meditation",
        "Buddhist philosophy",
        "Loving kindness"
      ].filter((s) => s.toLowerCase().includes(keywords.toLowerCase()));

      setSuggestions(mockSuggestions.slice(0, 3));
    }, 300);

    return () => clearTimeout(timer);
  }, [keywords]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!keywords.trim()) {
      announce("Please enter search keywords", "assertive");
      return;
    }

    setIsSearching(true);
    const startTime = performance.now();

    try {
      const params = new URLSearchParams();

      if (keywords) {
        params.set("q", keywords);
        saveRecentSearch(keywords);
      }
      if (speaker && speaker !== "all-speakers") params.set("speaker", speaker);
      if (categories.length > 0) params.set("categories", categories.join(","));
      if (language && language !== "all-languages")
        params.set("language", language);
      if (contentTypes.length > 0) params.set("types", contentTypes.join(","));
      if (sortBy !== "relevance") params.set("sort", sortBy);

      trackInteraction("search-submit", "search-form", startTime);
      announce(`Searching for "${keywords}"`, "polite");

      router.push(`/search?${params.toString()}`);
    } finally {
      setIsSearching(false);
    }
  };

  const addCategory = (category: string) => {
    setCategories([...categories, category]);
  };

  const removeCategory = (category: string) => {
    setCategories(categories.filter((c) => c !== category));
  };

  const handleCategoryChange = (category: string, checked: boolean) => {
    if (checked) {
      addCategory(category);
    } else {
      removeCategory(category);
    }
  };

  const addContentType = (type: string) => {
    setContentTypes([...contentTypes, type]);
  };

  const removeContentType = (type: string) => {
    setContentTypes(contentTypes.filter((t) => t !== type));
  };

  const handleContentTypeChange = (type: string, checked: boolean) => {
    if (checked) {
      addContentType(type);
    } else {
      removeContentType(type);
    }
  };

  const clearFilters = () => {
    setKeywords("");
    setSpeaker("all-speakers");
    setCategories([]);
    setLanguage("all-languages");
    setContentTypes([]);
    setSortBy("relevance");
    router.push("/search");
  };

  return (
    <Card>
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Main Search */}
          <div className="space-y-2">
            <div className="flex gap-4">
              <div className="flex-1 relative">
                <Label htmlFor="keywords" className="sr-only">
                  Search keywords
                </Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="keywords"
                    name="keywords"
                    type="text"
                    placeholder="Search for dhamma talks, teachings, or topics..."
                    value={keywords}
                    onChange={(e) => setKeywords(e.target.value)}
                    className="pl-10"
                    aria-describedby="search-help"
                    autoComplete="off"
                  />
                  <div id="search-help" className="sr-only">
                    Enter keywords to search for Buddhist content including
                    talks, teachings, and topics
                  </div>
                </div>

                {/* Search Suggestions Dropdown */}
                {(suggestions.length > 0 || recentSearches.length > 0) &&
                  keywords.length === 0 && (
                    <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-white border rounded-lg shadow-lg max-h-64 overflow-y-auto">
                      {recentSearches.length > 0 && (
                        <div className="p-3 border-b">
                          <div className="flex items-center gap-2 mb-2">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm font-medium text-muted-foreground">
                              Recent Searches
                            </span>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {recentSearches.map((search) => (
                              <Badge
                                key={`recent-${search}`}
                                variant="secondary"
                                className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                                onClick={() => {
                                  setKeywords(search);
                                  // Trigger search immediately
                                  const e = new Event("submit", {
                                    bubbles: true
                                  });
                                  document
                                    .querySelector("form")
                                    ?.dispatchEvent(e);
                                }}
                              >
                                {search}
                                <X
                                  className="ml-1 h-3 w-3 hover:bg-destructive hover:text-destructive-foreground rounded-full p-0.5"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    const updated = recentSearches.filter(
                                      (s) => s !== search
                                    );
                                    setRecentSearches(updated);
                                    localStorage.setItem(
                                      "dhamma-recent-searches",
                                      JSON.stringify(updated)
                                    );
                                  }}
                                />
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                {/* Live suggestions while typing */}
                {suggestions.length > 0 && keywords.length > 1 && (
                  <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-white border rounded-lg shadow-lg">
                    <div className="p-2">
                      <div className="text-sm font-medium text-muted-foreground mb-2">
                        Suggestions
                      </div>
                      {suggestions.map((suggestion) => (
                        <button
                          key={`suggestion-${suggestion}`}
                          type="button"
                          className="w-full text-left px-3 py-2 hover:bg-muted rounded text-sm transition-colors focus:outline-none focus:bg-muted"
                          onClick={() => {
                            setKeywords(suggestion);
                            // Focus back to input after selection
                            document.getElementById("keywords")?.focus();
                          }}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") {
                              e.preventDefault();
                              setKeywords(suggestion);
                              document.getElementById("keywords")?.focus();
                            }
                          }}
                        >
                          {suggestion}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <Button
                type="submit"
                disabled={isSearching}
                aria-describedby="search-button-help"
              >
                {isSearching ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Search className="h-4 w-4" />
                )}
                {isSearching ? "Searching..." : "Search"}
              </Button>
              <span id="search-button-help" className="sr-only">
                Submit search form to find content
              </span>
            </div>

            {/* Active Filters Display */}
            {(categories.length > 0 ||
              contentTypes.length > 0 ||
              speaker !== "all-speakers" ||
              language !== "all-languages") && (
              <div className="flex flex-wrap gap-2 pt-2">
                <span className="text-sm text-muted-foreground">
                  Active filters:
                </span>

                {speaker !== "all-speakers" && (
                  <Badge variant="outline" className="gap-1">
                    Speaker: {speaker}
                    <X
                      className="h-3 w-3 cursor-pointer"
                      onClick={() => setSpeaker("all-speakers")}
                    />
                  </Badge>
                )}

                {language !== "all-languages" && (
                  <Badge variant="outline" className="gap-1">
                    Language: {language}
                    <X
                      className="h-3 w-3 cursor-pointer"
                      onClick={() => setLanguage("all-languages")}
                    />
                  </Badge>
                )}

                {categories.map((category) => (
                  <Badge key={category} variant="outline" className="gap-1">
                    {category.replace("-", " ")}
                    <X
                      className="h-3 w-3 cursor-pointer"
                      onClick={() => removeCategory(category)}
                    />
                  </Badge>
                ))}

                {contentTypes.map((type) => (
                  <Badge key={type} variant="outline" className="gap-1">
                    {type}
                    <X
                      className="h-3 w-3 cursor-pointer"
                      onClick={() => removeContentType(type)}
                    />
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Advanced Filters Toggle */}
          <Collapsible open={showAdvanced} onOpenChange={setShowAdvanced}>
            <CollapsibleTrigger asChild>
              <Button variant="outline" type="button" className="w-full">
                <Filter className="h-4 w-4 mr-2" />
                {showAdvanced ? "Hide" : "Show"} Advanced Filters
              </Button>
            </CollapsibleTrigger>

            <CollapsibleContent className="space-y-4 mt-4">
              {/* Speaker and Language */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="speaker">Speaker</Label>
                  <Select value={speaker} onValueChange={setSpeaker}>
                    <SelectTrigger id="speaker">
                      <SelectValue placeholder="Select a speaker" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all-speakers">All Speakers</SelectItem>
                      <SelectItem value="ajahn-chah">Ajahn Chah</SelectItem>
                      <SelectItem value="thanissaro-bhikkhu">
                        Thanissaro Bhikkhu
                      </SelectItem>
                      <SelectItem value="ajahn-brahm">Ajahn Brahm</SelectItem>
                      <SelectItem value="bhante-henepola-gunaratana">
                        Bhante Henepola Gunaratana
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="language">Language</Label>
                  <Select value={language} onValueChange={setLanguage}>
                    <SelectTrigger id="language">
                      <SelectValue placeholder="Select language" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all-languages">
                        All Languages
                      </SelectItem>
                      <SelectItem value="english">English</SelectItem>
                      <SelectItem value="pali">Pāli</SelectItem>
                      <SelectItem value="thai">Thai</SelectItem>
                      <SelectItem value="burmese">Burmese</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Categories */}
              <div className="space-y-3">
                <Label>Categories</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {[
                    "sutta-study",
                    "dhamma-talks",
                    "guided-meditation",
                    "chanting",
                    "retreat-talks"
                  ].map((category) => (
                    <div key={category} className="flex items-center space-x-2">
                      <Checkbox
                        id={`category-${category}`}
                        checked={categories.includes(category)}
                        onCheckedChange={(checked: boolean) =>
                          handleCategoryChange(category, checked)
                        }
                      />
                      <Label
                        htmlFor={`category-${category}`}
                        className="text-sm font-normal capitalize"
                      >
                        {category.replace("-", " ")}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Content Types */}
              <div className="space-y-3">
                <Label>Content Type</Label>
                <div className="flex flex-wrap gap-3">
                  {[
                    { value: "audio", label: "Audio" },
                    { value: "video", label: "Video" },
                    { value: "ebook", label: "E-book" }
                  ].map((type) => (
                    <div
                      key={type.value}
                      className="flex items-center space-x-2"
                    >
                      <Checkbox
                        id={`type-${type.value}`}
                        checked={contentTypes.includes(type.value)}
                        onCheckedChange={(checked: boolean) =>
                          handleContentTypeChange(type.value, checked)
                        }
                      />
                      <Label
                        htmlFor={`type-${type.value}`}
                        className="text-sm font-normal"
                      >
                        {type.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Sort By */}
              <div className="space-y-2">
                <Label htmlFor="sortBy">Sort By</Label>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger id="sortBy">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="relevance">Relevance</SelectItem>
                    <SelectItem value="date-desc">Newest First</SelectItem>
                    <SelectItem value="date-asc">Oldest First</SelectItem>
                    <SelectItem value="title">Title A-Z</SelectItem>
                    <SelectItem value="duration-desc">Longest First</SelectItem>
                    <SelectItem value="duration-asc">Shortest First</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Clear Filters */}
              <div className="flex justify-end">
                <Button type="button" variant="outline" onClick={clearFilters}>
                  Clear All Filters
                </Button>
              </div>
            </CollapsibleContent>
          </Collapsible>
        </form>
      </CardContent>
    </Card>
  );
}
