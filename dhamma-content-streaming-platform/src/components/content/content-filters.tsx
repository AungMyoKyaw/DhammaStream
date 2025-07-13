"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { X } from "lucide-react";

const CONTENT_TYPES = [
  { value: "audio", label: "Audio" },
  { value: "video", label: "Video" },
  { value: "ebook", label: "Ebook" },
  { value: "other", label: "Other" }
];

const LANGUAGES = [
  { value: "Myanmar", label: "Myanmar" },
  { value: "English", label: "English" },
  { value: "Pali", label: "Pali" }
];

export function ContentFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const updateFilter = (key: string, value: string | null) => {
    try {
      const params = new URLSearchParams(searchParams);

      if (value && value !== "" && !value.startsWith("all-")) {
        params.set(key, value);
      } else {
        params.delete(key);
      }

      router.push(`/content?${params.toString()}`);
    } catch (error) {
      console.error("Error updating filter:", error);
    }
  };

  const clearAllFilters = () => {
    const params = new URLSearchParams(searchParams);
    // Keep search query but remove all other filters
    params.forEach((_, key) => {
      if (key !== "search") {
        params.delete(key);
      }
    });
    router.push(`/content?${params.toString()}`);
  };

  const hasActiveFilters = Array.from(searchParams.entries()).some(
    ([key]) => key !== "search"
  );

  return (
    <div className="space-y-4">
      {/* Clear All Filters */}
      {hasActiveFilters && (
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Active Filters</span>
          <Button variant="ghost" size="sm" onClick={clearAllFilters}>
            Clear All
          </Button>
        </div>
      )}

      {/* Content Type Filter */}
      <div className="space-y-2">
        <span className="text-sm font-medium">Content Type</span>
        <Select
          value={searchParams.get("content_type") || "all-types"}
          onValueChange={(value) => {
            updateFilter("content_type", value);
          }}
        >
          <SelectTrigger>
            <SelectValue placeholder="All types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all-types">All types</SelectItem>
            {CONTENT_TYPES.map((type) => (
              <SelectItem key={type.value} value={type.value}>
                {type.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Language Filter */}
      <div className="space-y-2">
        <span className="text-sm font-medium">Language</span>
        <Select
          value={searchParams.get("language") || "all-languages"}
          onValueChange={(value) => {
            updateFilter("language", value);
          }}
        >
          <SelectTrigger>
            <SelectValue placeholder="All languages" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all-languages">All languages</SelectItem>
            {LANGUAGES.map((language) => (
              <SelectItem key={language.value} value={language.value}>
                {language.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Separator />

      {/* Active Filter Tags */}
      <div className="space-y-2">
        <span className="text-sm font-medium">Active Filters</span>
        <div className="flex flex-wrap gap-2">
          {searchParams.get("content_type") && (
            <Badge variant="secondary" className="flex items-center gap-1">
              {
                CONTENT_TYPES.find(
                  (t) => t.value === searchParams.get("content_type")
                )?.label
              }
              <Button
                variant="ghost"
                size="sm"
                className="p-0 w-4 h-4"
                onClick={() => updateFilter("content_type", null)}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          )}

          {searchParams.get("language") && (
            <Badge variant="secondary" className="flex items-center gap-1">
              {
                LANGUAGES.find((l) => l.value === searchParams.get("language"))
                  ?.label
              }
              <Button
                variant="ghost"
                size="sm"
                className="p-0 w-4 h-4"
                onClick={() => updateFilter("language", null)}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          )}
        </div>
      </div>
    </div>
  );
}
