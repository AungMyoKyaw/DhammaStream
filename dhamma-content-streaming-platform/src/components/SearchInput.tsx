"use client";

import { useSearchParams, usePathname, useRouter } from "next/navigation";
import { useCallback, useState, useEffect } from "react";
import { FeatureIcons } from "@/components/ui/icons";

interface SearchInputProps {
  placeholder?: string;
  className?: string;
}

export default function SearchInput({
  placeholder = "Search content...",
  className = ""
}: Readonly<SearchInputProps>) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [searchTerm, setSearchTerm] = useState(
    searchParams.get("search") || ""
  );

  // Update local state when URL changes
  useEffect(() => {
    setSearchTerm(searchParams.get("search") || "");
  }, [searchParams]);

  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set(name, value);
        // Reset to page 1 when searching
        params.set("page", "1");
      } else {
        params.delete(name);
        params.delete("page");
      }
      return params.toString();
    },
    [searchParams]
  );

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    const queryString = createQueryString("search", value);
    router.push(`${pathname}?${queryString}`);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSearch(searchTerm);
  };

  const handleClear = () => {
    setSearchTerm("");
    handleSearch("");
  };

  return (
    <div className={`relative ${className}`}>
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative flex items-center">
          <span className="absolute left-4 flex items-center pointer-events-none">
            <FeatureIcons.search
              className="w-5 h-5 text-gray-400 dark:text-gray-500"
              aria-hidden="true"
            />
          </span>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={placeholder}
            className="block w-full pl-12 pr-24 py-4 text-lg border border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 placeholder-gray-400 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400 text-gray-900 dark:text-white shadow-sm hover:shadow-md transition-all"
          />
          {searchTerm && (
            <button
              type="button"
              onClick={handleClear}
              className="absolute right-16 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-400 rounded-full p-1"
              aria-label="Clear search"
            >
              <FeatureIcons.close className="h-4 w-4" aria-hidden="true" />
            </button>
          )}
          <button
            type="submit"
            className="absolute right-2 bg-orange-600 hover:bg-orange-700 dark:bg-orange-500 dark:hover:bg-orange-600 text-white font-medium rounded-lg px-4 py-2 transition-colors focus:outline-none focus:ring-2 focus:ring-orange-400 focus:ring-offset-2 dark:focus:ring-offset-gray-700"
            aria-label="Search"
          >
            Search
          </button>
        </div>
      </form>
    </div>
  );
}
