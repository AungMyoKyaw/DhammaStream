"use client";

import { useSearchParams, usePathname, useRouter } from "next/navigation";
import { useCallback } from "react";
import { FeatureIcons } from "@/components/ui/icons";

interface PaginationControlsProps {
  readonly currentPage: number;
  readonly totalPages: number;
  readonly totalItems?: number;
  readonly itemsPerPage?: number;
  readonly className?: string;
}

export default function PaginationControls({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  className = ""
}: PaginationControlsProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value && value !== "1") {
        params.set(name, value);
      } else {
        params.delete(name);
      }
      return params.toString();
    },
    [searchParams]
  );

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return;

    const queryString = createQueryString("page", page.toString());
    const url = queryString ? `${pathname}?${queryString}` : pathname;
    router.push(url);
  };

  // Don't render if there's only one page or no pages
  if (totalPages <= 1) return null;

  // Generate page numbers to show
  const getPageNumbers = () => {
    const showPages = 5; // Show 5 page numbers at most

    if (totalPages <= showPages) {
      // Show all pages if total is small
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    return getPaginationForLargeSet();
  };

  const getPaginationForLargeSet = (): (number | string)[] => {
    if (currentPage <= 3) {
      return getEarlyPages();
    }

    if (currentPage >= totalPages - 2) {
      return getLatePages();
    }

    return getMiddlePages();
  };

  const getEarlyPages = () => {
    const pages: (number | string)[] = [];
    for (let i = 1; i <= 4; i++) {
      pages.push(i);
    }
    pages.push("...");
    pages.push(totalPages);
    return pages;
  };

  const getLatePages = () => {
    const pages: (number | string)[] = [];
    pages.push(1);
    pages.push("...");
    for (let i = totalPages - 3; i <= totalPages; i++) {
      pages.push(i);
    }
    return pages;
  };

  const getMiddlePages = () => {
    const pages: (number | string)[] = [];
    pages.push(1);
    pages.push("...");
    for (let i = currentPage - 1; i <= currentPage + 1; i++) {
      pages.push(i);
    }
    pages.push("...");
    pages.push(totalPages);
    return pages;
  };

  const pageNumbers = getPageNumbers();

  // Calculate pagination context
  const getPaginationContext = () => {
    if (!totalItems || !itemsPerPage) return null;

    const startItem =
      totalItems === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
    const endItem = Math.min(currentPage * itemsPerPage, totalItems);

    return { startItem, endItem };
  };

  const context = getPaginationContext();
  const ChevronLeftIcon = FeatureIcons.ChevronLeft;
  const ChevronRightIcon = FeatureIcons.ChevronRight;

  return (
    <div className="space-y-4">
      {/* Pagination Context */}
      {context && (
        <div className="text-center text-sm text-gray-600">
          Showing {context.startItem}-{context.endItem} of {totalItems} items
        </div>
      )}

      {/* Pagination Controls */}
      <nav
        className={`flex items-center justify-center space-x-1 sm:space-x-2 ${className}`}
        aria-label="Pagination"
      >
        {/* Previous button */}
        <button
          type="button"
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          className="px-2 py-2 sm:px-3 sm:py-2 text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors flex items-center gap-1"
          aria-label="Go to previous page"
        >
          <ChevronLeftIcon className="w-3 h-3 sm:w-4 sm:h-4" />
          <span className="hidden sm:inline">Previous</span>
        </button>

        {/* Page numbers */}
        <div className="flex space-x-0.5 sm:space-x-1">
          {pageNumbers.map((page, index) => {
            // Create unique keys for ellipsis elements by using their position
            const key = page === "..." ? `ellipsis-${index}` : `page-${page}`;

            return (
              <span key={key}>
                {page === "..." ? (
                  <span className="px-2 py-2 sm:px-3 sm:py-2 text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">
                    ...
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => handlePageChange(Number(page))}
                    className={`px-2 py-2 sm:px-3 sm:py-2 text-xs sm:text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 transition-colors min-w-[36px] sm:min-w-[40px] ${
                      currentPage === page
                        ? "bg-orange-600 text-white border border-orange-600 dark:bg-orange-500 dark:border-orange-500"
                        : "text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
                    }`}
                    aria-current={currentPage === page ? "page" : undefined}
                    aria-label={`Go to page ${page}`}
                  >
                    {page}
                  </button>
                )}
              </span>
            );
          })}
        </div>

        {/* Next button */}
        <button
          type="button"
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          className="px-2 py-2 sm:px-3 sm:py-2 text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors flex items-center gap-1"
          aria-label="Go to next page"
        >
          <span className="hidden sm:inline">Next</span>
          <ChevronRightIcon className="w-3 h-3 sm:w-4 sm:h-4" />
        </button>
      </nav>
    </div>
  );
}
