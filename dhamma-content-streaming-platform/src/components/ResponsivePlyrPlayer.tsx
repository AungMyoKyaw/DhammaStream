"use client";

import { forwardRef, useEffect, useRef, useCallback } from "react";
import Plyr from "plyr-react";
import type PlyrCore from "plyr";
import "plyr-react/plyr.css";

export interface ResponsivePlyrPlayerProps {
  src: string;
  type: "video" | "audio";
  className?: string;
  maxHeight?: string;
}

const ResponsivePlyrPlayer = forwardRef<unknown, ResponsivePlyrPlayerProps>(
  ({ src, type, className = "", maxHeight = "600px" }, ref) => {
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
    const storageKey = `plyr-resume-${type}-${src}`;

    // Map props to plyr-react's source prop
    const source = {
      type,
      sources: [
        {
          src,
          type: type === "video" ? "video/mp4" : "audio/mp3"
        }
      ]
    };

    // Resume logic (robust, event-driven, with logging and retry)
    useEffect(() => {
      if (typeof window === "undefined") return; // SSR safety
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
        const saved = window.localStorage.getItem(storageKey);
        if (saved) {
          const time = parseFloat(saved);
          if (!Number.isNaN(time) && time > 0 && plyr.duration > time) {
            plyr.currentTime = time;
            didResume = true;
            console.log(
              `[ResponsivePlyrPlayer] Resumed to ${time}s on event '${eventName}'`
            );
          } else {
            console.log(
              `[ResponsivePlyrPlayer] No valid resume time found in storage for key ${storageKey}`
            );
          }
        } else {
          console.log(
            `[ResponsivePlyrPlayer] No resume time in storage for key ${storageKey}`
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
        if (isPlyrInstance(plyr) && !plyr.ended && plyr.currentTime > 0) {
          window.localStorage.setItem(storageKey, plyr.currentTime.toString());
        }
      }
      function onEnded() {
        window.localStorage.removeItem(storageKey);
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
    }, [storageKey, playerRef]);

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
