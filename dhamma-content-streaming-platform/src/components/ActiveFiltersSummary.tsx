"use client";

import { useSearchParams, usePathname, useRouter } from "next/navigation";
import { useCallback } from "react";
import { FeatureIcons } from "@/components/ui/icons";

interface ActiveFilterChipProps {
  label: string;
  onRemove: () => void;
}

function ActiveFilterChip({ label, onRemove }: ActiveFilterChipProps) {
  return (
    <span className="inline-flex items-center gap-1 px-3 py-1 bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200 text-sm font-medium rounded-full">
      {label}
      <button
        type="button"
        onClick={onRemove}
        className="ml-1 hover:bg-orange-200 dark:hover:bg-orange-800 rounded-full p-0.5 transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500"
        aria-label={`Remove ${label} filter`}
      >
        <FeatureIcons.Close className="w-3 h-3" />
      </button>
    </span>
  );
}

interface ActiveFiltersSummaryProps {
  readonly search?: string;
  readonly type?: string;
  readonly className?: string;
}

export default function ActiveFiltersSummary({
  search,
  type,
  className = ""
}: ActiveFiltersSummaryProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const createQueryString = useCallback(
    (updates: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams.toString());

      Object.entries(updates).forEach(([key, value]) => {
        if (value === null || value === "") {
          params.delete(key);
        } else {
          params.set(key, value);
        }
      });

      // Reset to page 1 when filters change
      params.set("page", "1");

      return params.toString();
    },
    [searchParams]
  );

  const removeFilter = (paramName: string) => {
    const queryString = createQueryString({ [paramName]: null });
    router.push(`${pathname}?${queryString}`);
  };

  const clearAllFilters = () => {
    const queryString = createQueryString({
      search: null,
      speaker: null,
      category: null,
      language: null,
      duration: null,
      dateRange: null,
      sort: null
    });
    router.push(`${pathname}?${queryString}`);
  };

  // Define filter labels
  const filterLabels: Record<string, Record<string, string>> = {
    duration: {
      short: "Short (< 30 min)",
      medium: "Medium (30-60 min)",
      long: "Long (> 60 min)"
    },
    dateRange: {
      week: "This Week",
      month: "This Month",
      year: "This Year",
      all: "All Time"
    },
    sort: {
      relevance: "Most Relevant",
      date: "Newest First",
      popularity: "Most Popular",
      duration: "By Duration",
      title: "Alphabetical"
    },
    language: {
      english: "English",
      burmese: "Burmese",
      pali: "Pali",
      thai: "Thai",
      chinese: "Chinese",
      japanese: "Japanese"
    },
    category: {
      meditation: "Meditation",
      "dharma-talk": "Dharma Talk",
      sutra: "Sutra",
      mindfulness: "Mindfulness",
      vipassana: "Vipassana",
      zen: "Zen",
      theravada: "Theravada",
      mahayana: "Mahayana"
    },
    speaker: {
      "ajahn-chah": "Ajahn Chah",
      "thich-nhat-hanh": "Thich Nhat Hanh",
      "dalai-lama": "Dalai Lama",
      "joseph-goldstein": "Joseph Goldstein",
      "jack-kornfield": "Jack Kornfield"
    }
  };

  // Get active filters
  const activeFilters: Array<{ key: string; value: string; label: string }> = [];

  // Add search term if present
  if (search?.trim()) {
    activeFilters.push({ key: 'search', value: search, label: `"${search}"` });
  }

  const filterParams = ['speaker', 'category', 'language', 'duration', 'dateRange', 'sort'];

  filterParams.forEach(param => {
    const value = searchParams.get(param);
    if (value && value !== "" && !(param === 'sort' && value === 'relevance')) {
      const label = filterLabels[param]?.[value] || value;
      activeFilters.push({ key: param, value, label });
    }
  });

  // Fallback for legacy props
  if (type && type !== "all") {
    activeFilters.push({ key: 'type', value: type, label: type });
  }

  // Don't render if no active filters
  if (activeFilters.length === 0) {
    return null;
  }

  return (
    <div className={`bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 ${className}`}>
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1">
          <FeatureIcons.Filter className="w-4 h-4" />
          Active filters:
        </span>

        <div className="flex flex-wrap gap-2">
          {activeFilters.map(({ key, label }) => (
            <ActiveFilterChip
              key={key}
              label={label}
              onRemove={() => removeFilter(key)}
            />
          ))}
        </div>

        {activeFilters.length > 1 && (
          <button
            type="button"
            onClick={clearAllFilters}
            className="ml-2 text-sm text-orange-600 hover:text-orange-700 dark:text-orange-400 dark:hover:text-orange-300 font-medium underline underline-offset-2"
          >
            Clear all
          </button>
        )}
      </div>
    </div>
  );
}
