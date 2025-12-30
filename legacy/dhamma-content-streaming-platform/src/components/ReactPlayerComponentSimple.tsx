"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import dynamic from "next/dynamic";
import {
  savePosition,
  getPosition,
  clearPosition
} from "@/lib/resume-playback";

// Dynamically import ReactPlayer to avoid SSR issues
const ReactPlayer = dynamic(() => import("react-player"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center p-8">
      <div className="w-8 h-8 border-4 border-orange-200 border-t-orange-600 rounded-full animate-spin"></div>
    </div>
  )
});

export interface ReactPlayerComponentProps {
  src: string;
  type: "video" | "audio";
  contentId?: number;
  title?: string;
  className?: string;
  maxHeight?: string;
}

export default function ReactPlayerComponent({
  src,
  type,
  contentId,
  title,
  className = "",
  maxHeight = "600px"
}: ReactPlayerComponentProps) {
  const playerRef = useRef<any>(null);
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  // Container styles
  const containerStyles =
    type === "video"
      ? {
          width: "100%",
          maxHeight,
          position: "relative" as const,
          borderRadius: "20px",
          overflow: "hidden",
          backgroundColor: "#000000"
        }
      : {
          width: "100%",
          position: "relative" as const,
          borderRadius: "24px",
          overflow: "hidden",
          backgroundColor: "#FFFFFF",
          background:
            "linear-gradient(145deg, #FFFFFF 0%, #FEFBF7 50%, #FEF3C7 100%)",
          padding: "24px"
        };

  const handleReady = useCallback(() => {
    console.log("[ReactPlayerComponent] Player ready");
    setIsLoading(false);

    // Resume playbook if available
    if (contentId && playerRef.current) {
      const savedTime = getPosition(contentId);
      if (savedTime && savedTime > 0) {
        playerRef.current.seekTo(savedTime, "seconds");
        console.log(`[ReactPlayerComponent] Resumed to ${savedTime}s`);
      }
    }
  }, [contentId]);

  const handleStart = useCallback(() => {
    console.log("[ReactPlayerComponent] Player started");
    setIsLoading(false);
  }, []);

  const handlePlay = useCallback(() => {
    console.log("[ReactPlayerComponent] Player playing");
    setIsLoading(false);
  }, []);

  const handleDuration = useCallback(() => {
    console.log("[ReactPlayerComponent] Duration received");
    setIsLoading(false);
  }, []);

  // Timeout fallback to clear loading state if events don't fire
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      console.log(
        "[ReactPlayerComponent] Timeout fallback - clearing loading state"
      );
      setIsLoading(false);
    }, 10000); // 10 second timeout

    if (!isLoading) {
      clearTimeout(timeoutId);
    }

    return () => clearTimeout(timeoutId);
  }, [isLoading]);

  const handleProgress = useCallback(
    (state: any) => {
      // Save progress for resume functionality
      if (contentId && state.playedSeconds > 0) {
        savePosition(contentId, state.playedSeconds);
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    },
    [contentId]
  );

  const handleEnded = useCallback(() => {
    if (contentId) {
      clearPosition(contentId);
    }
  }, [contentId]);

  const handleError = useCallback((error: any) => {
    console.error("[ReactPlayerComponent] Player error:", error);
    setHasError(true);
    setErrorMessage("Failed to load media. Please try again later.");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  }, []);

  // Error state
  if (hasError) {
    return (
      <div
        className={`${className} bg-red-50 rounded-xl border border-red-200 p-8 text-center`}
      >
        <div className="text-red-600 mb-4">
          <svg
            className="w-12 h-12 mx-auto"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z"
            />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Media Error
        </h3>
        <p className="text-sm text-gray-600 mb-4">{errorMessage}</p>
        <button
          onClick={() => window.location.reload()}
          className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div
      className={`${className} transition-all duration-300`}
      style={containerStyles}
    >
      {/* Audio Header */}
      {type === "audio" && (
        <div className="flex items-center space-x-4 mb-6">
          <div className="w-16 h-16 bg-gradient-to-br from-orange-400 to-orange-600 rounded-xl flex items-center justify-center">
            <svg
              className="w-8 h-8 text-white"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
            </svg>
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold text-gray-900">
              {title || "Buddhist Audio Teaching"}
            </h2>
            <p className="text-sm text-orange-700">Dharma Teaching</p>
          </div>
        </div>
      )}

      {/* ReactPlayer */}
      <div className={type === "audio" ? "bg-white/70 rounded-lg p-4" : ""}>
        <ReactPlayer
          ref={playerRef}
          src={src}
          controls={true}
          width="100%"
          height={type === "video" ? "auto" : "60px"}
          onReady={handleReady}
          onStart={handleStart}
          onPlay={handlePlay}
          onDurationChange={handleDuration}
          onProgress={handleProgress}
          onEnded={handleEnded}
          onError={handleError}
        />
      </div>

      {/* Loading overlay */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-inherit">
          <div className="text-center text-white">
            <div className="w-8 h-8 border-4 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-2"></div>
            <p>Loading {type}...</p>
          </div>
        </div>
      )}
    </div>
  );
}
