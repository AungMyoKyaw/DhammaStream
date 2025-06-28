// Custom React hooks for the application
import { useState, useEffect, useCallback, useRef } from "react";
import { usePlayerStore } from "@/store";
import type { DhammaContent, SearchQuery } from "@/types";
import { debounce } from "@/utils";
import { searchContent } from "@/services/content";

// Player hook for controlling playback
export function usePlayer() {
  const playerStore = usePlayerStore();

  const play = useCallback(
    (content?: DhammaContent) => {
      if (content) {
        playerStore.dispatch({ type: "PLAY", content });
      } else {
        playerStore.dispatch({ type: "PLAY" });
      }
    },
    [playerStore]
  );

  const pause = useCallback(() => {
    playerStore.dispatch({ type: "PAUSE" });
  }, [playerStore]);

  const stop = useCallback(() => {
    playerStore.dispatch({ type: "STOP" });
  }, [playerStore]);

  const seek = useCallback(
    (time: number) => {
      playerStore.dispatch({ type: "SEEK", time });
    },
    [playerStore]
  );

  const setVolume = useCallback(
    (volume: number) => {
      playerStore.dispatch({ type: "SET_VOLUME", volume });
    },
    [playerStore]
  );

  const setSpeed = useCallback(
    (speed: number) => {
      playerStore.dispatch({ type: "SET_SPEED", speed });
    },
    [playerStore]
  );

  const next = useCallback(() => {
    playerStore.dispatch({ type: "NEXT" });
  }, [playerStore]);

  const previous = useCallback(() => {
    playerStore.dispatch({ type: "PREVIOUS" });
  }, [playerStore]);

  const toggleRepeat = useCallback(() => {
    playerStore.dispatch({ type: "TOGGLE_REPEAT" });
  }, [playerStore]);

  const toggleShuffle = useCallback(() => {
    playerStore.dispatch({ type: "TOGGLE_SHUFFLE" });
  }, [playerStore]);

  const setPlaylist = useCallback(
    (playlist: DhammaContent[], index = 0) => {
      playerStore.dispatch({ type: "SET_PLAYLIST", playlist, index });
    },
    [playerStore]
  );

  const addToQueue = useCallback(
    (content: DhammaContent) => {
      playerStore.dispatch({ type: "ADD_TO_QUEUE", content });
    },
    [playerStore]
  );

  const clearQueue = useCallback(() => {
    playerStore.dispatch({ type: "CLEAR_QUEUE" });
  }, [playerStore]);

  return {
    ...playerStore,
    actions: {
      play,
      pause,
      stop,
      seek,
      setVolume,
      setSpeed,
      next,
      previous,
      toggleRepeat,
      toggleShuffle,
      setPlaylist,
      addToQueue,
      clearQueue
    }
  };
}

// Search hook with debouncing
export function useSearch() {
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<DhammaContent[]>([]);
  const [error, setError] = useState<string | null>(null);

  const debouncedSearchRef = useRef(
    debounce(async (query: string) => {
      if (!query.trim()) {
        setResults([]);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const searchParams: Partial<SearchQuery> = { query };
        const searchResult = await searchContent(searchParams as SearchQuery);
        setResults(searchResult.content);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Search failed");
      } finally {
        setIsLoading(false);
      }
    }, 300)
  );

  const search = useCallback((query: string) => {
    debouncedSearchRef.current(query);
  }, []);

  const clearResults = useCallback(() => {
    setResults([]);
    setError(null);
    setIsLoading(false);
  }, []);

  return {
    search,
    clearResults,
    results,
    isLoading,
    error
  };
}

// Media query hook
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);
    if (media.matches !== matches) {
      setMatches(media.matches);
    }

    const listener = () => setMatches(media.matches);
    media.addEventListener("change", listener);
    return () => media.removeEventListener("change", listener);
  }, [matches, query]);

  return matches;
}

// Intersection Observer hook
export function useIntersectionObserver(
  ref: React.RefObject<Element>,
  options: IntersectionObserverInit = {}
): IntersectionObserverEntry | null {
  const [entry, setEntry] = useState<IntersectionObserverEntry | null>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(([entry]) => {
      setEntry(entry);
    }, options);

    observer.observe(element);
    return () => observer.disconnect();
  }, [ref, options]);

  return entry;
}

// Local storage hook
export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((val: T) => T)) => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  const setValue = useCallback(
    (value: T | ((val: T) => T)) => {
      try {
        const valueToStore =
          value instanceof Function ? value(storedValue) : value;
        setStoredValue(valueToStore);
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      } catch (error) {
        console.warn(`Error setting localStorage key "${key}":`, error);
      }
    },
    [key, storedValue]
  );

  return [storedValue, setValue];
}

// Online status hook
export function useOnlineStatus(): boolean {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  return isOnline;
}

// Keyboard shortcut hook
export function useKeyboardShortcut(key: string, callback: () => void): void {
  const callbackRef = useRef(callback);

  useEffect(() => {
    callbackRef.current = callback;
  });

  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.key === key) {
        event.preventDefault();
        callbackRef.current();
      }
    };

    document.addEventListener("keydown", handleKeyPress);
    return () => document.removeEventListener("keydown", handleKeyPress);
  }, [key]);
}

// Window size hook
export function useWindowSize(): { width: number; height: number } {
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight
  });

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return windowSize;
}

// Previous value hook
export function usePrevious<T>(value: T): T | undefined {
  const ref = useRef<T | undefined>(undefined);

  useEffect(() => {
    ref.current = value;
  });

  return ref.current;
}
