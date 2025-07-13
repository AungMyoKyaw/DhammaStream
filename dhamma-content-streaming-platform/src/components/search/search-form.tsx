"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Search, Filter } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger
} from "@/components/ui/collapsible";

export function SearchForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const params = new URLSearchParams();

    if (keywords) params.set("q", keywords);
    if (speaker && speaker !== "all-speakers") params.set("speaker", speaker);
    if (categories.length > 0) params.set("categories", categories.join(","));
    if (language && language !== "all-languages")
      params.set("language", language);
    if (contentTypes.length > 0) params.set("types", contentTypes.join(","));
    if (sortBy !== "relevance") params.set("sort", sortBy);

    router.push(`/search?${params.toString()}`);
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
          <div className="flex gap-4">
            <div className="flex-1">
              <Label htmlFor="keywords" className="sr-only">
                Search keywords
              </Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="keywords"
                  type="text"
                  placeholder="Search for dhamma talks, teachings, or topics..."
                  value={keywords}
                  onChange={(e) => setKeywords(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Button type="submit">Search</Button>
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
