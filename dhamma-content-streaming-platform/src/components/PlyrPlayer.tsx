"use client";

import { forwardRef, useEffect, useRef, useCallback } from "react";
import Plyr from "plyr-react";
import type PlyrCore from "plyr";
import "plyr-react/plyr.css";

export interface PlyrPlayerProps {
  src: string;
  type: "video" | "audio";
  width?: string;
  height?: string;
  className?: string;
}

const PlyrPlayer = forwardRef<unknown, PlyrPlayerProps>(
  ({ src, type, width = "100%", height, className }, ref) => {
    // Use a callback ref to ensure we get the correct instance
    // Plyr-react's ref is expected to be an object with a .plyr property
    type PlyrReactRef = { plyr: PlyrCore } | null;
    const localRef = useRef<PlyrReactRef>(null);
    const setPlayerRef = useCallback(
      (node: unknown) => {
        if (typeof ref === "function") {
          ref(node);
        } else if (ref && typeof ref === "object" && "current" in ref) {
          // Only assign if node is a PlyrReactRef
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
            `[PlyrPlayer] [${eventName}] plyr instance not ready or invalid, will retry...`
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
              `[PlyrPlayer] Resumed to ${time}s on event '${eventName}'`
            );
          } else {
            console.log(
              `[PlyrPlayer] No valid resume time found in storage for key ${storageKey}`
            );
          }
        } else {
          console.log(
            `[PlyrPlayer] No resume time in storage for key ${storageKey}`
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

    return (
      <div
        className={className}
        style={{
          width,
          height: height || (type === "video" ? "400px" : "80px")
        }}
      >
        <Plyr ref={setPlayerRef} source={source} />
      </div>
    );
  }
);

PlyrPlayer.displayName = "PlyrPlayer";

export default PlyrPlayer;
