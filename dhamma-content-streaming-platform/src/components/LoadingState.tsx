"use client";

import { forwardRef } from "react";

interface LoadingStateProps {
  message?: string;
  size?: "sm" | "md" | "lg";
  variant?: "spinner" | "pulse" | "skeleton";
  className?: string;
  showIcon?: boolean;
}

const LoadingState = forwardRef<HTMLDivElement, LoadingStateProps>(
  (
    {
      message = "Loading...",
      size = "md",
      variant = "spinner",
      className = "",
      showIcon = true
    },
    ref
  ) => {
    const sizeClasses = {
      sm: "text-sm",
      md: "text-base",
      lg: "text-lg"
    };

    const spinnerSizes = {
      sm: "w-4 h-4",
      md: "w-6 h-6",
      lg: "w-8 h-8"
    };

    if (variant === "skeleton") {
      return (
        <div ref={ref} className={`animate-pulse ${className}`}>
          <div className="bg-gray-200 dark:bg-gray-700 rounded-lg h-4 w-3/4 mb-2"></div>
          <div className="bg-gray-200 dark:bg-gray-700 rounded-lg h-4 w-1/2"></div>
        </div>
      );
    }

    if (variant === "pulse") {
      return (
        <div
          ref={ref}
          className={`flex items-center justify-center space-x-2 ${sizeClasses[size]} text-gray-600 dark:text-gray-400 ${className}`}
        >
          <div className="flex space-x-1">
            <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
            <div
              className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"
              style={{ animationDelay: "0.1s" }}
            ></div>
            <div
              className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"
              style={{ animationDelay: "0.2s" }}
            ></div>
          </div>
          <span>{message}</span>
        </div>
      );
    }

    return (
      <div
        ref={ref}
        className={`flex items-center justify-center space-x-2 ${sizeClasses[size]} text-gray-600 dark:text-gray-400 ${className}`}
      >
        {showIcon && (
          <div
            className={`${spinnerSizes[size]} border-2 border-orange-600 border-t-transparent rounded-full animate-spin`}
          ></div>
        )}
        <span>{message}</span>
      </div>
    );
  }
);

LoadingState.displayName = "LoadingState";

// Specific loading components for different use cases
export const SearchLoadingState = () => (
  <LoadingState message="Searching content..." size="sm" className="py-4" />
);

export const ContentLoadingState = () => (
  <LoadingState message="Loading content..." size="md" className="py-8" />
);

export const PlayerLoadingState = () => (
  <LoadingState message="Loading player..." size="sm" className="py-2" />
);

export const TopBarLoadingState = () => (
  <div className="fixed top-0 left-0 right-0 z-50 bg-orange-600 h-1">
    <div className="h-full bg-orange-400 animate-pulse"></div>
  </div>
);

// Content skeleton loading components
export const ContentCardSkeleton = () => (
  <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 animate-pulse">
    <div className="flex items-start space-x-4">
      <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
      <div className="flex-1 space-y-2">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
        <div className="flex items-center space-x-2">
          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
        </div>
      </div>
    </div>
  </div>
);

export const ContentListSkeleton = ({ count = 6 }: { count?: number }) => {
  const skeletonIds = Array.from({ length: count }, () => crypto.randomUUID());

  return (
    <div className="space-y-4">
      {skeletonIds.map((id) => (
        <ContentCardSkeleton key={id} />
      ))}
    </div>
  );
};

export default LoadingState;
