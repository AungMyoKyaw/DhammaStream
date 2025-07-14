"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useMemo,
  useCallback
} from "react";
import { useLiveRegion } from "@/components/ui/live-region";

// Context for service worker utilities
interface ServiceWorkerUtils {
  isOnline: boolean;
  registration: ServiceWorkerRegistration | null;
  cacheAudio: (url: string) => void;
  clearCache: () => void;
  getCacheSize: () => Promise<number>;
}

const ServiceWorkerContext = createContext<ServiceWorkerUtils>({
  isOnline: true,
  registration: null,
  cacheAudio: () => {},
  clearCache: () => {},
  getCacheSize: async () => 0
});

export const useServiceWorker = () => useContext(ServiceWorkerContext);

export function ServiceWorkerProvider({
  children
}: {
  children: React.ReactNode;
}) {
  const [isOnline, setIsOnline] = useState(true);
  const [swRegistration, setSwRegistration] =
    useState<ServiceWorkerRegistration | null>(null);
  const { announce } = useLiveRegion();

  // Handle service worker updates
  const handleServiceWorkerUpdate = useCallback(
    (registration: ServiceWorkerRegistration) => {
      const newWorker = registration.installing;
      if (!newWorker) return;

      const handleStateChange = () => {
        if (
          newWorker.state === "installed" &&
          navigator.serviceWorker.controller
        ) {
          announce("App update available. Refresh to get the latest version.");
        }
      };

      newWorker.addEventListener("statechange", handleStateChange);
    },
    [announce]
  );

  // Handle online/offline status
  const handleOnline = useCallback(() => {
    setIsOnline(true);
    announce("You are back online", "polite");
  }, [announce]);

  const handleOffline = useCallback(() => {
    setIsOnline(false);
    announce("You are offline. Some features may be limited.", "polite");
  }, [announce]);

  useEffect(() => {
    // Register service worker
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js", { scope: "/" })
        .then((registration) => {
          console.log("Service Worker registered successfully:", registration);
          setSwRegistration(registration);

          // Listen for updates
          registration.addEventListener("updatefound", () => {
            handleServiceWorkerUpdate(registration);
          });
        })
        .catch((error) => {
          console.error("Service Worker registration failed:", error);
        });
    }

    // Listen for online/offline status
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // Set initial online status
    setIsOnline(navigator.onLine);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [handleServiceWorkerUpdate, handleOnline, handleOffline]);

  // Service worker utilities
  const cacheAudio = useCallback(
    (url: string) => {
      if (swRegistration?.active) {
        swRegistration.active.postMessage({
          type: "CACHE_AUDIO",
          data: { url }
        });
      }
    },
    [swRegistration]
  );

  const clearCache = useCallback(() => {
    if (swRegistration?.active) {
      swRegistration.active.postMessage({
        type: "CLEAR_CACHE"
      });
    }
  }, [swRegistration]);

  const getCacheSize = useCallback((): Promise<number> => {
    return new Promise((resolve) => {
      if (swRegistration?.active) {
        const channel = new MessageChannel();
        channel.port1.onmessage = (event) => {
          if (event.data.type === "CACHE_SIZE") {
            resolve(event.data.size);
          }
        };

        swRegistration.active.postMessage(
          {
            type: "GET_CACHE_SIZE"
          },
          [channel.port2]
        );
      } else {
        resolve(0);
      }
    });
  }, [swRegistration]);

  const swUtils = useMemo(
    () => ({
      isOnline,
      registration: swRegistration,
      cacheAudio,
      clearCache,
      getCacheSize
    }),
    [isOnline, swRegistration, cacheAudio, clearCache, getCacheSize]
  );

  return (
    <ServiceWorkerContext.Provider value={swUtils}>
      {children}
    </ServiceWorkerContext.Provider>
  );
}
