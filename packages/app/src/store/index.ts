// Global state management using Zustand
import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";
import type { DhammaContent, PlayerState } from "@/types";

interface PlayerOptions {
  autoplay?: boolean;
  volume?: number;
  playbackSpeed?: number;
  startTime?: number;
}

type PlayerAction =
  | { type: "PLAY"; content?: DhammaContent; options?: PlayerOptions }
  | { type: "PAUSE" }
  | { type: "STOP" }
  | { type: "SEEK"; time: number }
  | { type: "SET_VOLUME"; volume: number }
  | { type: "SET_SPEED"; speed: number }
  | { type: "NEXT" }
  | { type: "PREVIOUS" }
  | { type: "TOGGLE_REPEAT" }
  | { type: "TOGGLE_SHUFFLE" }
  | { type: "SET_PLAYLIST"; playlist: DhammaContent[]; index?: number }
  | { type: "ADD_TO_QUEUE"; content: DhammaContent }
  | { type: "REMOVE_FROM_QUEUE"; contentId: string }
  | { type: "CLEAR_QUEUE" }
  | { type: "SET_ERROR"; error: string | null }
  | { type: "CLEAR_ERROR" }
  | { type: "SET_DURATION"; duration: number }
  | { type: "SET_CURRENT_TIME"; time: number };

// Player store
interface PlayerStore extends PlayerState {
  dispatch: (action: PlayerAction) => void;
  updateProgress: (
    contentId: string,
    progress: number,
    currentTime: number
  ) => void;
}

export const usePlayerStore = create<PlayerStore>()(
  subscribeWithSelector((set, get) => ({
    // Initial state
    currentContent: null,
    isPlaying: false,
    isLoading: false,
    currentTime: 0,
    duration: 0,
    volume: 1,
    playbackSpeed: 1,
    isRepeating: false,
    isShuffling: false,
    playlist: [],
    currentIndex: -1,
    error: null,

    // Actions
    dispatch: (action: PlayerAction) => {
      const state = get();

      switch (action.type) {
        case "PLAY":
          set({
            currentContent: action.content || state.currentContent,
            isPlaying: true,
            isLoading: true,
            error: null,
            ...(action.options && {
              volume: action.options.volume ?? state.volume,
              playbackSpeed:
                action.options.playbackSpeed ?? state.playbackSpeed,
              currentTime: action.options.startTime ?? 0
            })
          });
          break;

        case "PAUSE":
          set({ isPlaying: false });
          break;

        case "STOP":
          set({
            isPlaying: false,
            currentTime: 0,
            currentContent: null,
            error: null
          });
          break;

        case "SEEK":
          set({ currentTime: action.time });
          break;

        case "SET_VOLUME":
          set({ volume: Math.max(0, Math.min(1, action.volume)) });
          break;

        case "SET_SPEED":
          set({ playbackSpeed: action.speed });
          break;

        case "NEXT":
          if (
            state.playlist.length > 0 &&
            state.currentIndex < state.playlist.length - 1
          ) {
            const nextIndex = state.currentIndex + 1;
            set({
              currentIndex: nextIndex,
              currentContent: state.playlist[nextIndex],
              currentTime: 0
            });
          }
          break;

        case "PREVIOUS":
          if (state.playlist.length > 0 && state.currentIndex > 0) {
            const prevIndex = state.currentIndex - 1;
            set({
              currentIndex: prevIndex,
              currentContent: state.playlist[prevIndex],
              currentTime: 0
            });
          }
          break;

        case "TOGGLE_REPEAT":
          set({ isRepeating: !state.isRepeating });
          break;

        case "TOGGLE_SHUFFLE":
          set({ isShuffling: !state.isShuffling });
          break;

        case "SET_PLAYLIST":
          set({
            playlist: action.playlist,
            currentIndex: action.index ?? 0,
            currentContent: action.playlist[action.index ?? 0] || null
          });
          break;

        case "ADD_TO_QUEUE":
          set({
            playlist: [...state.playlist, action.content]
          });
          break;

        case "REMOVE_FROM_QUEUE": {
          const newPlaylist = state.playlist.filter(
            (item) => item.id !== action.contentId
          );
          const newIndex =
            state.currentIndex >= newPlaylist.length ? 0 : state.currentIndex;
          set({
            playlist: newPlaylist,
            currentIndex: newIndex,
            currentContent: newPlaylist[newIndex] || null
          });
          break;
        }

        case "CLEAR_QUEUE":
          set({
            playlist: [],
            currentIndex: -1,
            currentContent: null,
            isPlaying: false
          });
          break;

        case "SET_ERROR":
          set({ error: action.error, isLoading: false, isPlaying: false });
          break;

        case "CLEAR_ERROR":
          set({ error: null });
          break;

        case "SET_DURATION":
          set({ duration: action.duration });
          break;

        case "SET_CURRENT_TIME":
          set({ currentTime: action.time });
          break;

        default:
          break;
      }
    },

    updateProgress: (
      contentId: string,
      progress: number,
      currentTime: number
    ) => {
      set({ currentTime });
      // TODO: Persist progress to Firestore for the user
      console.log(
        `Progress update: ${contentId} - ${progress}% at ${currentTime}s`
      );
    }
  }))
);

// App state store
interface AppStore {
  // UI state
  sidebarOpen: boolean;
  theme: "light" | "dark" | "system";
  isOffline: boolean;

  // Content state
  featuredContent: DhammaContent[];

  // Actions
  setSidebarOpen: (open: boolean) => void;
  setTheme: (theme: "light" | "dark" | "system") => void;
  setOfflineStatus: (isOffline: boolean) => void;
  setFeaturedContent: (content: DhammaContent[]) => void;
}

export const useAppStore = create<AppStore>()(
  subscribeWithSelector((set) => ({
    // Initial state
    sidebarOpen: false,
    theme: "system",
    isOffline: false,
    featuredContent: [],

    // Actions
    setSidebarOpen: (open: boolean) => set({ sidebarOpen: open }),
    setTheme: (theme: "light" | "dark" | "system") => set({ theme }),
    setOfflineStatus: (isOffline: boolean) => set({ isOffline }),
    setFeaturedContent: (featuredContent: DhammaContent[]) =>
      set({ featuredContent })
  }))
);

// Search store
interface SearchStore {
  query: string;
  filters: {
    contentType: string[];
    speakers: string[];
    categories: string[];
    languages: string[];
    difficulty: string[];
  };
  results: DhammaContent[];
  isLoading: boolean;
  hasMore: boolean;
  page: number;

  setQuery: (query: string) => void;
  setFilters: (filters: Partial<SearchStore["filters"]>) => void;
  setResults: (results: DhammaContent[]) => void;
  setLoading: (loading: boolean) => void;
  setHasMore: (hasMore: boolean) => void;
  setPage: (page: number) => void;
  clearSearch: () => void;
}

export const useSearchStore = create<SearchStore>((set) => ({
  // Initial state
  query: "",
  filters: {
    contentType: [],
    speakers: [],
    categories: [],
    languages: [],
    difficulty: []
  },
  results: [],
  isLoading: false,
  hasMore: false,
  page: 1,

  // Actions
  setQuery: (query: string) => set({ query }),
  setFilters: (newFilters: Partial<SearchStore["filters"]>) =>
    set((state) => ({
      filters: { ...state.filters, ...newFilters }
    })),
  setResults: (results: DhammaContent[]) => set({ results }),
  setLoading: (isLoading: boolean) => set({ isLoading }),
  setHasMore: (hasMore: boolean) => set({ hasMore }),
  setPage: (page: number) => set({ page }),
  clearSearch: () =>
    set({
      query: "",
      results: [],
      page: 1,
      hasMore: false,
      filters: {
        contentType: [],
        speakers: [],
        categories: [],
        languages: [],
        difficulty: []
      }
    })
}));

// Selectors for computed values
export const selectCurrentContentId = (state: PlayerStore) =>
  state.currentContent?.id;
export const selectIsContentPlaying =
  (contentId: string) => (state: PlayerStore) =>
    state.currentContent?.id === contentId && state.isPlaying;
export const selectPlaylistPosition = (state: PlayerStore) => ({
  current: state.currentIndex + 1,
  total: state.playlist.length
});

// Subscriptions for side effects
usePlayerStore.subscribe(
  (state) => state.currentContent,
  (currentContent) => {
    // Update document title when content changes
    if (currentContent) {
      document.title = `${currentContent.title} - DhammaStream`;
    } else {
      document.title = "DhammaStream";
    }
  }
);

useAppStore.subscribe(
  (state) => state.theme,
  (theme) => {
    // Update document class for theme
    const root = document.documentElement;
    root.classList.remove("light", "dark");

    if (theme === "system") {
      const prefersDark = window.matchMedia(
        "(prefers-color-scheme: dark)"
      ).matches;
      root.classList.add(prefersDark ? "dark" : "light");
    } else {
      root.classList.add(theme);
    }
  }
);
