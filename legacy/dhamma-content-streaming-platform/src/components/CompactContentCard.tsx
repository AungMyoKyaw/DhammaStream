"use client";
import Link from "next/link";
import type { DhammaContentWithRelations } from "@/types/database";
import { getContentTypeConfig } from "@/lib/content-images";
import { ContentTypeIcons } from "@/components/ui/icons";
import { FeatureIcons } from "@/components/ui/icons";
import { useState, useRef } from "react";

interface CompactContentCardProps {
  readonly content: DhammaContentWithRelations;
}

function CompactContentCard({ content }: CompactContentCardProps) {
  const contentConfig = getContentTypeConfig(content.content_type);
  const IconComponent = ContentTypeIcons[contentConfig.iconType];

  // Tooltip for long titles
  const [showTooltip, setShowTooltip] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);
  const titleRef = useRef<HTMLHeadingElement | null>(null);

  // Helper to check if title is truncated
  const isTruncated = (el: HTMLElement | null) => {
    if (!el) return false;
    return el.scrollWidth > el.clientWidth;
  };

  const handleClick = (e: React.MouseEvent) => {
    setIsNavigating(true);
    // Navigation will occur, loading state will be cleared when component unmounts
  };

  return (
    <Link
      href={`/content-item/${content.id}`}
      className="group focus:outline-none focus:ring-2 focus:ring-orange-400 dark:focus:ring-orange-500"
      aria-label={`View details for ${content.title}`}
      tabIndex={0}
      onClick={handleClick}
    >
      <div
        className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 p-3 sm:p-4 border border-gray-100 dark:border-gray-700 h-full flex gap-3 sm:gap-4 group/card relative ${
          isNavigating ? "opacity-75 pointer-events-none" : ""
        }`}
        style={{ minHeight: 90 }}
      >
        {/* Content type icon */}
        <div className="flex-shrink-0">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center border border-orange-200 dark:border-orange-800 relative">
            {isNavigating ? (
              <div className="animate-spin rounded-full h-5 w-5 sm:h-6 sm:w-6 border-2 border-orange-600 dark:border-orange-400 border-t-transparent"></div>
            ) : (
              <IconComponent
                className="w-5 h-5 sm:w-6 sm:h-6 text-orange-600 dark:text-orange-400"
                aria-label={content.content_type}
              />
            )}
          </div>
        </div>

        {/* Content details */}
        <div className="flex-1 min-w-0">
          {/* Header: Type + Date */}
          <div className="flex items-center justify-between mb-1 sm:mb-2">
            <span className="text-xs font-semibold text-orange-600 dark:text-orange-400 uppercase tracking-wide">
              {content.content_type}
            </span>
            {content.date_recorded && (
              <span className="text-xs text-gray-500 dark:text-gray-400 items-center gap-1 hidden sm:flex">
                <FeatureIcons.Calendar className="w-3 h-3" />
                {new Date(content.date_recorded).toLocaleDateString()}
              </span>
            )}
          </div>

          {/* Title */}
          <h3
            ref={titleRef}
            className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white mb-2 group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors line-clamp-2 cursor-pointer leading-tight"
            aria-label={content.title}
            onMouseEnter={() => setShowTooltip(isTruncated(titleRef.current))}
            onMouseLeave={() => setShowTooltip(false)}
            onFocus={() => setShowTooltip(isTruncated(titleRef.current))}
            onBlur={() => setShowTooltip(false)}
          >
            {content.title}
            {/* Tooltip for truncated title */}
            {showTooltip && (
              <span className="absolute z-10 left-1/2 -translate-x-1/2 top-0 mt-8 px-3 py-2 bg-gray-900 dark:bg-gray-700 text-white text-xs rounded shadow-lg whitespace-pre-line max-w-xs">
                {content.title}
              </span>
            )}
          </h3>

          {/* Metadata + Action */}
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2 sm:gap-3 text-xs text-gray-500 dark:text-gray-400 flex-wrap">
              {content.duration_estimate && (
                <span className="flex items-center gap-1">
                  <FeatureIcons.Clock className="w-3 h-3" />
                  {Math.floor(content.duration_estimate / 60)}h{" "}
                  {content.duration_estimate % 60}m
                </span>
              )}
              {content.language && (
                <span className="flex items-center gap-1">
                  <FeatureIcons.Globe className="w-3 h-3" />
                  {content.language}
                </span>
              )}
              {/* Show date on mobile if hidden in header */}
              {content.date_recorded && (
                <span className="flex items-center gap-1 sm:hidden">
                  <FeatureIcons.Calendar className="w-3 h-3" />
                  {new Date(content.date_recorded).toLocaleDateString()}
                </span>
              )}
            </div>

            <div className="text-orange-600 dark:text-orange-400 text-xs sm:text-sm font-medium group-hover:underline flex items-center gap-1 flex-shrink-0">
              <span className="hidden sm:inline">
                {content.content_type === "video" && "Watch"}
                {content.content_type === "audio" && "Listen"}
                {content.content_type === "ebook" && "Read"}
                {content.content_type === "other" && "View"}
              </span>
              <span className="sm:hidden">
                {content.content_type === "video" && "Watch"}
                {content.content_type === "audio" && "Listen"}
                {content.content_type === "ebook" && "Read"}
                {content.content_type === "other" && "View"}
              </span>
              {isNavigating ? (
                <div className="animate-spin rounded-full h-3 w-3 sm:h-4 sm:w-4 border border-orange-600 dark:border-orange-400 border-t-transparent"></div>
              ) : (
                <FeatureIcons.ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 transition-transform group-hover:translate-x-1" />
              )}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

export default CompactContentCard;
