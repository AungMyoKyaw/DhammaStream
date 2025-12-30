"use client";

import { useCallback, useState, useRef } from "react";
import dynamic from "next/dynamic";
import {
  savePosition,
  getPosition,
  clearPosition
} from "@/lib/resume-playback";
import { PlayerLoadingState } from "@/components/LoadingState";

// Dynamically import ReactPlayer to avoid SSR issues
const ReactPlayer = dynamic(() => import("react-player"), {
  ssr: false,
  loading: () => <PlayerLoadingState />
});

export interface ReactPlayerComponentProps {
  src: string;
  type: "video" | "audio";
  contentId?: number;
  title?: string;
  className?: string;
  maxHeight?: string;
}

const ReactPlayerComponent = ({
  src,
  type,
  contentId,
  title,
  className = "",
  maxHeight = "600px"
}: ReactPlayerComponentProps) => {
  const playerRef = useRef<unknown>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [playing, setPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);

  // Create enhanced poster for video content
  const createVideoPoster = useCallback((title: string = "Video Content") => {
    const sanitizedTitle = title
      .split("")
      .filter((char) => {
        const code = char.charCodeAt(0);
        return code >= 32 && code <= 126;
      })
      .join("")
      .replace(/[<>&"']/g, "")
      .substring(0, 50);

    const safeTitle = sanitizedTitle || "Video Content";

    const playIcon =
      '<polygon points="26,18 10,8 10,28" fill="#FFFFFF" stroke="none"/>';

    // Use crypto.getRandomValues for particle generation
    const randomArray = new Uint32Array(100); // 20 particles * 5 values each
    crypto.getRandomValues(randomArray);

    const particles = Array.from({ length: 20 }, (_, i) => {
      const baseIndex = i * 5;
      const x = 50 + (randomArray[baseIndex] / 0xffffffff) * 700;
      const y = 50 + (randomArray[baseIndex + 1] / 0xffffffff) * 350;
      const size = 1 + (randomArray[baseIndex + 2] / 0xffffffff) * 3;
      const opacity = 0.1 + (randomArray[baseIndex + 3] / 0xffffffff) * 0.4;
      const delay = (randomArray[baseIndex + 4] / 0xffffffff) * 4;
      return `<circle cx="${x}" cy="${y}" r="${size}" fill="#FFFFFF" opacity="${opacity}">
          <animate attributeName="opacity" values="${opacity};${opacity * 2};${opacity}" dur="3s" repeatCount="indefinite" begin="${delay}s"/>
        </circle>`;
    }).join("");

    const svg = `<svg width="800" height="450" viewBox="0 0 800 450" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <radialGradient id="cinematicBg" cx="50%" cy="50%" r="70%">
            <stop offset="0%" style="stop-color:#1E1B4B;stop-opacity:1" />
            <stop offset="40%" style="stop-color:#312E81;stop-opacity:1" />
            <stop offset="70%" style="stop-color:#1F2937;stop-opacity:1" />
            <stop offset="100%" style="stop-color:#0F172A;stop-opacity:1" />
          </radialGradient>
          <linearGradient id="overlayGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#EA580C;stop-opacity:0.1" />
            <stop offset="50%" style="stop-color:#DC2626;stop-opacity:0.05" />
            <stop offset="100%" style="stop-color:#7C3AED;stop-opacity:0.1" />
          </linearGradient>
          <filter id="playButtonGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
          <filter id="textGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        <rect width="100%" height="100%" fill="url(#cinematicBg)"/>
        <rect width="100%" height="100%" fill="url(#overlayGradient)"/>
        ${particles}
        <circle cx="400" cy="225" r="80" fill="#EA580C" opacity="0.2">
          <animate attributeName="r" values="80;90;80" dur="2s" repeatCount="indefinite"/>
        </circle>
        <circle cx="400" cy="225" r="70" fill="#EA580C" filter="url(#playButtonGlow)" opacity="0.95">
          <animate attributeName="opacity" values="0.95;1;0.95" dur="2s" repeatCount="indefinite"/>
        </circle>
        <g transform="translate(382,207)">${playIcon}</g>
        <text x="400" y="340" text-anchor="middle" fill="#FFFFFF" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="28" font-weight="700" filter="url(#textGlow)">${safeTitle}</text>
        <text x="400" y="370" text-anchor="middle" fill="#CBD5E1" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="16" font-weight="500">Buddhist Video Teaching</text>
        <text x="400" y="390" text-anchor="middle" fill="#94A3B8" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="14">Click to begin your journey</text>
      </svg>`;

    try {
      const bytes = new TextEncoder().encode(svg);
      const binString = Array.from(bytes, (byte) =>
        String.fromCodePoint(byte)
      ).join("");
      const base64 = btoa(binString);
      return `data:image/svg+xml;base64,${base64}`;
    } catch (error) {
      console.warn("Failed to create base64 poster, using fallback:", error);
      const fallbackSvg =
        '<svg width="800" height="450" xmlns="http://www.w3.org/2000/svg"><rect width="100%" height="100%" fill="#374151"/><text x="400" y="225" text-anchor="middle" fill="#FFFFFF" font-family="system-ui" font-size="32">Video Content</text></svg>';
      return `data:image/svg+xml,${encodeURIComponent(fallbackSvg)}`;
    }
  }, []);

  // Event handlers
  const handleReady = useCallback(() => {
    console.log("[ReactPlayerComponent] Player ready");
    setIsLoading(false);
    setHasError(false);

    // Resume playback if available
    if (contentId) {
      const savedTime = getPosition(contentId);
      if (savedTime && savedTime > 0 && duration > savedTime) {
        // We'll handle resume in a separate effect
      }
    }
  }, [contentId, duration]);

  const handleStart = useCallback(() => {
    setPlaying(true);
  }, []);

  const handlePlay = useCallback(() => {
    setPlaying(true);
  }, []);

  const handlePause = useCallback(() => {
    setPlaying(false);
  }, []);

  const handleProgress = useCallback(
    (state: { playedSeconds: number }) => {
      setCurrentTime(state.playedSeconds);

      // Save progress for resume functionality
      if (contentId && state.playedSeconds > 0) {
        savePosition(contentId, state.playedSeconds);
      }
    },
    [contentId]
  );

  const handleDuration = useCallback(() => {
    // Get duration from player ref when needed
    if (playerRef.current) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const newDuration = (playerRef.current as any)?.getDuration?.();
      if (newDuration) {
        setDuration(newDuration);
      }
    }
  }, []);

  const handleEnded = useCallback(() => {
    setPlaying(false);
    if (contentId) {
      clearPosition(contentId);
    }
  }, [contentId]);

  const handleError = useCallback((error: unknown) => {
    console.error("[ReactPlayerComponent] Player error:", error);
    setIsLoading(false);
    setHasError(true);
    setErrorMessage("Failed to load media. Please try again later.");
  }, []);

  // Format time helper
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // Container styles - Responsive
  const containerStyles =
    type === "video"
      ? {
          width: "100%",
          maxHeight,
          position: "relative" as const,
          borderRadius: "12px",
          overflow: "hidden",
          boxShadow:
            "0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.05)",
          backgroundColor: "#000000",
          background: "linear-gradient(145deg, #1a1a1a 0%, #000000 100%)",
          border: "1px solid rgba(255, 255, 255, 0.1)"
        }
      : {
          width: "100%",
          position: "relative" as const,
          borderRadius: "16px",
          overflow: "hidden",
          backgroundColor: "#FFFFFF",
          background:
            "linear-gradient(145deg, #FFFFFF 0%, #FEFBF7 50%, #FEF3C7 100%)",
          border: "2px solid transparent",
          backgroundClip: "padding-box",
          boxShadow:
            "0 20px 40px -12px rgba(234, 88, 12, 0.25), 0 8px 16px -4px rgba(234, 88, 12, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.6)",
          transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)"
        };

  // Error state
  if (hasError) {
    return (
      <div
        className={`${className} bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-800`}
        style={containerStyles}
      >
        <div className="flex flex-col items-center justify-center p-8 text-center min-h-[120px]">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mb-4 shadow-lg">
            <svg
              className="w-8 h-8 text-red-600 dark:text-red-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-label="Error icon"
            >
              <title>Error icon</title>
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Media Error
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-6 max-w-sm">
            {errorMessage}
          </p>
          <button
            type="button"
            onClick={() => {
              setHasError(false);
              setIsLoading(true);
              setErrorMessage("");
              window.location.reload();
            }}
            className="bg-orange-600 hover:bg-orange-700 active:bg-orange-800 text-white px-6 py-3 rounded-lg text-sm font-medium transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`${className} ${type === "video" ? "bg-black" : "bg-gradient-to-br from-orange-50 to-amber-100 hover:from-orange-100 hover:to-amber-200"} transition-all duration-500 ease-out group hover:scale-[1.02] hover:shadow-2xl mx-auto`}
      style={containerStyles}
    >
      {/* Loading overlay */}
      {isLoading && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-gradient-to-br from-black/80 to-purple-900/60 backdrop-blur-md rounded-inherit">
          <div className="flex flex-col items-center space-y-6">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-orange-200 border-t-orange-600 rounded-full animate-spin"></div>
              <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-orange-400 rounded-full animate-ping"></div>
              <div
                className="absolute inset-2 w-12 h-12 border-2 border-transparent border-t-white rounded-full animate-spin"
                style={{
                  animationDirection: "reverse",
                  animationDuration: "1.5s"
                }}
              ></div>
            </div>
            <div className="text-center">
              <p className="text-white font-semibold text-lg mb-1">
                Loading {type}...
              </p>
              <p className="text-gray-300 text-sm">
                Preparing your spiritual journey
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Audio UI Enhancement */}
      {type === "audio" && (
        <div className="p-4 sm:p-6 md:p-8">
          {/* Premium Audio Header with Album Art Style */}
          <div className="flex items-center space-x-4 sm:space-x-6 mb-4 sm:mb-6">
            <div className="relative flex-shrink-0">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-orange-400 via-orange-500 to-orange-600 rounded-2xl flex items-center justify-center shadow-2xl transform hover:scale-105 transition-transform duration-300">
                <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-2xl"></div>
                <svg
                  className="w-8 h-8 sm:w-10 sm:h-10 text-white drop-shadow-lg"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  aria-label="Audio icon"
                >
                  <title>Audio icon</title>
                  <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
                </svg>
              </div>
              <div className="absolute -inset-1 bg-gradient-to-r from-orange-400 to-pink-400 rounded-2xl opacity-30 animate-pulse"></div>
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-lg sm:text-xl md:text-2xl font-bold mb-1 truncate bg-gradient-to-r from-orange-900 to-amber-900 bg-clip-text text-transparent">
                {title || "Buddhist Audio Teaching"}
              </h2>
              <p className="text-xs sm:text-sm text-orange-700 font-medium mb-1">
                Dharma Teaching
              </p>
              <p className="text-xs text-orange-600 hidden sm:block">
                Path to enlightenment through sound
              </p>
            </div>
          </div>

          {/* Progress and Time Display - Enhanced for Mobile */}
          <div className="mb-4 sm:mb-6">
            <div className="flex justify-between text-sm sm:text-base text-orange-700 mb-2 font-medium">
              <span className="font-mono">{formatTime(currentTime)}</span>
              <span className="font-mono">{formatTime(duration)}</span>
            </div>
            <div className="w-full bg-orange-200 rounded-full h-3 sm:h-2 shadow-inner">
              <div
                className="bg-gradient-to-r from-orange-500 to-orange-600 h-3 sm:h-2 rounded-full transition-all duration-300 shadow-sm"
                style={{
                  width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%`
                }}
              ></div>
            </div>
          </div>

          {/* Decorative Elements - Hidden on mobile for cleaner look */}
          <div className="absolute top-4 right-4 opacity-30 hidden sm:block">
            <div className="w-6 h-6 border-2 border-orange-400 rounded-full animate-pulse"></div>
            <div className="w-4 h-4 bg-orange-300 rounded-full absolute -top-1 -right-1 animate-bounce"></div>
          </div>
        </div>
      )}

      {/* ReactPlayer Component */}
      <div
        className={
          type === "audio"
            ? "rounded-xl overflow-hidden shadow-inner bg-white/50 backdrop-blur-sm border border-orange-200/50"
            : "w-full h-full"
        }
      >
        {/* eslint-disable @typescript-eslint/no-explicit-any */}
        <ReactPlayer
          ref={playerRef as any}
          src={src}
          playing={playing}
          controls={true}
          width="100%"
          height={type === "video" ? "100%" : "80px"}
          onReady={handleReady}
          onStart={handleStart}
          onPlay={handlePlay}
          onPause={handlePause}
          onProgress={handleProgress as any}
          onDurationChange={handleDuration as any}
          onEnded={handleEnded}
          onError={handleError as any}
          light={type === "video" ? createVideoPoster(title) : false}
          pip={type === "video"}
          playsInline={true}
          style={{
            borderRadius: type === "video" ? "12px" : "8px",
            overflow: "hidden"
          }}
        />
        {/* eslint-enable @typescript-eslint/no-explicit-any */}
      </div>
    </div>
  );
};

ReactPlayerComponent.displayName = "ReactPlayerComponent";

export default ReactPlayerComponent;
