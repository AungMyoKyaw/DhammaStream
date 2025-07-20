"use client";

import { useEffect, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";

export default function NavigationLoadingBar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Reset loading state when route changes
    setIsLoading(false);
    setProgress(0);
  }, [pathname, searchParams]);

  useEffect(() => {
    let progressTimer: NodeJS.Timeout;
    let completeTimer: NodeJS.Timeout;

    if (isLoading) {
      // Simulate progress
      progressTimer = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 90) return prev;
          // eslint-disable-next-line sonarjs/pseudo-random -- Math.random() is safe here for UI-only progress simulation
          return prev + Math.random() * 10;
        });
      }, 200);

      // Auto-complete after 3 seconds if still loading
      completeTimer = setTimeout(() => {
        setProgress(100);
        setTimeout(() => setIsLoading(false), 200);
      }, 3000);
    }

    return () => {
      clearInterval(progressTimer);
      clearTimeout(completeTimer);
    };
  }, [isLoading]);

  // Listen for navigation start events
  useEffect(() => {
    const handleStart = () => {
      setIsLoading(true);
      setProgress(10);
    };

    const handleComplete = () => {
      setProgress(100);
      setTimeout(() => setIsLoading(false), 200);
    };

    // Custom events for manual triggering
    window.addEventListener("navigation-start", handleStart);
    window.addEventListener("navigation-complete", handleComplete);

    return () => {
      window.removeEventListener("navigation-start", handleStart);
      window.removeEventListener("navigation-complete", handleComplete);
    };
  }, []);

  if (!isLoading) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50">
      <div
        className="h-1 bg-gradient-to-r from-orange-500 to-orange-600 transition-all duration-300 ease-out"
        style={{
          width: `${progress}%`,
          boxShadow: "0 0 10px rgba(234, 88, 12, 0.5)"
        }}
      />
    </div>
  );
}

// Helper functions to trigger loading manually
export const startNavigation = () => {
  window.dispatchEvent(new CustomEvent("navigation-start"));
};

export const completeNavigation = () => {
  window.dispatchEvent(new CustomEvent("navigation-complete"));
};
