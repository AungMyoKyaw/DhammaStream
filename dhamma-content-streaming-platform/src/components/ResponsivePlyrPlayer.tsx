"use client";

import { forwardRef, useEffect, useRef, useCallback } from "react";
import dynamic from "next/dynamic";
import type PlyrCore from "plyr";
import {
  savePosition,
  getPosition,
  clearPosition
} from "@/lib/resume-playback";
import "plyr-react/plyr.css";
import "@/styles/plyr-custom.css";

// Dynamically import Plyr to avoid SSR issues
const Plyr = dynamic(() => import("plyr-react"), {
  ssr: false,
  loading: () => (
    <div className="w-full flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-lg min-h-[80px]">
      <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
        <div className="w-4 h-4 border-2 border-orange-600 border-t-transparent rounded-full animate-spin"></div>
        <span>Loading player...</span>
      </div>
    </div>
  )
});

export interface ResponsivePlyrPlayerProps {
  src: string;
  type: "video" | "audio";
  contentId?: number; // Add contentId for resume functionality
  title?: string; // Add title for default cover
  className?: string;
  maxHeight?: string;
}

const ResponsivePlyrPlayer = forwardRef<unknown, ResponsivePlyrPlayerProps>(
  (
    { src, type, contentId, title, className = "", maxHeight = "600px" },
    ref
  ) => {
    // Use a callback ref to ensure we get the correct instance
    type PlyrReactRef = { plyr: PlyrCore } | null;
    const localRef = useRef<PlyrReactRef>(null);
    const setPlayerRef = useCallback(
      (node: unknown) => {
        if (typeof ref === "function") {
          ref(node);
        } else if (ref && typeof ref === "object" && "current" in ref) {
          if (node === null || (typeof node === "object" && "plyr" in node)) {
            (ref as { current: PlyrReactRef }).current = node as PlyrReactRef;
          }
        }
        localRef.current = node as PlyrReactRef;
      },
      [ref]
    );
    const playerRef = localRef;

    // Create a default poster SVG data URL for video, using Unicode-safe base64 encoding
    const createDefaultPoster = (title: string = "Video Content") => {
      // Sanitize title to remove any characters that might cause issues with btoa
      // Keep only safe characters for base64 encoding
      const sanitizedTitle = title
        .split("")
        .filter((char) => {
          const code = char.charCodeAt(0);
          return code >= 32 && code <= 126; // Keep only printable ASCII characters
        })
        .join("")
        .replace(/[<>&"']/g, "") // Remove XML/HTML special characters
        .substring(0, 50); // Limit length to prevent issues

      // Use a safe default if title becomes empty after sanitization
      const safeTitle = sanitizedTitle || "Video Content";

      // Lucide Emoji (Smile) SVG path - using stroke and fill with safe hex colors
      const emojiPath =
        '<circle cx="12" cy="12" r="10" stroke="#EA580C" stroke-width="2" fill="#FEF3C7"/><path d="M8 15s1.5 2 4 2 4-2 4-2" stroke="#EA580C" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/><circle cx="9" cy="10" r="1" fill="#EA580C"/><circle cx="15" cy="10" r="1" fill="#EA580C"/>';

      // Create SVG with proper escaping and using only ASCII-safe characters
      const svg = `<svg width="800" height="450" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:#FFF7ED;stop-opacity:1" /><stop offset="100%" style="stop-color:#FEF3C7;stop-opacity:1" /></linearGradient></defs><rect width="100%" height="100%" fill="url(#bg)"/><g transform="translate(388,120) scale(5)">${emojiPath}</g><text x="400" y="270" text-anchor="middle" fill="#9A3412" font-family="system-ui" font-size="32" font-weight="500">${safeTitle}</text><text x="400" y="320" text-anchor="middle" fill="#A16207" font-family="system-ui" font-size="18">Click to play video content</text></svg>`;

      try {
        // Use TextEncoder to convert the SVG string to bytes, then convert to base64
        const bytes = new TextEncoder().encode(svg);
        const binString = Array.from(bytes, (byte) =>
          String.fromCodePoint(byte)
        ).join("");
        const base64 = btoa(binString);
        return `data:image/svg+xml;base64,${base64}`;
      } catch (error) {
        console.warn(
          "[ResponsivePlyrPlayer] Failed to create base64 poster, using fallback:",
          error
        );
        // Fallback to a simple URL-encoded version with minimal content
        const fallbackSvg =
          '<svg width="800" height="450" xmlns="http://www.w3.org/2000/svg"><rect width="100%" height="100%" fill="#FEF3C7"/><text x="400" y="225" text-anchor="middle" fill="#9A3412" font-family="system-ui" font-size="32">Video Content</text></svg>';
        return `data:image/svg+xml,${encodeURIComponent(fallbackSvg)}`;
      }
    };

    // Map props to plyr-react's source prop
    const source = {
      type,
      sources: [
        {
          src,
          type: type === "video" ? "video/mp4" : "audio/mp3"
        }
      ],
      // Add poster for video
      ...(type === "video" && {
        poster: createDefaultPoster(title)
      })
    };

    // Resume logic using centralized resume-playback utilities
    useEffect(() => {
      if (typeof window === "undefined" || !contentId) return; // SSR safety and contentId check
      let retryTimeout: NodeJS.Timeout | null = null;
      let didResume = false;

      function getPlyr() {
        return playerRef?.current?.plyr;
      }

      type PlyrInstance = {
        currentTime: number;
        duration: number;
        ended: boolean;
        on: (event: string, cb: () => void) => void;
        off: (event: string, cb: () => void) => void;
      };
      const isPlyrInstance = (plyr: unknown): plyr is PlyrInstance =>
        !!plyr &&
        typeof (plyr as PlyrInstance).on === "function" &&
        typeof (plyr as PlyrInstance).off === "function";

      const tryResume = (eventName: string) => {
        const plyr = getPlyr();
        if (!isPlyrInstance(plyr)) {
          console.log(
            `[ResponsivePlyrPlayer] [${eventName}] plyr instance not ready or invalid, will retry...`
          );
          retryTimeout = setTimeout(() => tryResume(eventName), 200);
          return;
        }
        if (didResume) return;

        // Use centralized resume functionality
        const savedTime = getPosition(contentId);
        if (savedTime && savedTime > 0 && plyr.duration > savedTime) {
          plyr.currentTime = savedTime;
          didResume = true;
          console.log(
            `[ResponsivePlyrPlayer] Resumed to ${savedTime}s on event '${eventName}'`
          );
        } else {
          console.log(
            `[ResponsivePlyrPlayer] No valid resume time found for content ${contentId}`
          );
        }
      };

      const onLoadedData = () => tryResume("loadeddata");
      const onReady = () => tryResume("ready");

      const plyr = getPlyr();
      if (isPlyrInstance(plyr)) {
        plyr.on("loadeddata", onLoadedData);
        plyr.on("ready", onReady);
        plyr.on("timeupdate", onTimeUpdate);
        plyr.on("ended", onEnded);
      } else {
        // If plyr is not ready, set up a retry
        retryTimeout = setTimeout(() => tryResume("effect-init"), 200);
      }

      function onTimeUpdate() {
        const plyr = getPlyr();
        if (
          isPlyrInstance(plyr) &&
          !plyr.ended &&
          plyr.currentTime > 0 &&
          contentId
        ) {
          // Use centralized save functionality
          savePosition(contentId, plyr.currentTime);
        }
      }

      function onEnded() {
        if (contentId) {
          // Use centralized clear functionality
          clearPosition(contentId);
        }
      }

      // Cleanup listeners on unmount or source change
      return () => {
        const plyr = getPlyr();
        if (isPlyrInstance(plyr)) {
          plyr.off("loadeddata", onLoadedData);
          plyr.off("ready", onReady);
          plyr.off("timeupdate", onTimeUpdate);
          plyr.off("ended", onEnded);
        }
        if (retryTimeout) clearTimeout(retryTimeout);
      };
    }, [contentId, playerRef]); // Updated dependencies

    // Container styles for responsive video that adapts to content
    const containerStyles =
      type === "video"
        ? {
            width: "100%",
            maxHeight,
            position: "relative" as const,
            borderRadius: "0.5rem",
            overflow: "hidden"
          }
        : {
            width: "100%",
            height: "80px"
          };

    return (
      <div
        className={`${className} ${type === "video" ? "bg-black rounded-lg" : ""}`}
        style={containerStyles}
      >
        <div
          className="w-full"
          style={{
            height: type === "video" ? "auto" : "80px"
          }}
        >
          <Plyr ref={setPlayerRef} source={source} />
        </div>
      </div>
    );
  }
);

ResponsivePlyrPlayer.displayName = "ResponsivePlyrPlayer";

export default ResponsivePlyrPlayer;
