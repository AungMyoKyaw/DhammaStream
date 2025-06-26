import type { DhammaContent } from "./content";

// Media player and playback types
export interface PlayerState {
  currentContent: DhammaContent | null;
  isPlaying: boolean;
  isLoading: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  playbackSpeed: number;
  isRepeating: boolean;
  isShuffling: boolean;
  playlist: DhammaContent[];
  currentIndex: number;
  error: string | null;
}

export interface PlaybackOptions {
  autoplay?: boolean;
  startTime?: number;
  volume?: number;
  playbackSpeed?: number;
}

export interface AudioVisualization {
  waveform: number[];
  currentFrequency: number[];
  isAnalyzing: boolean;
}

// Player controls
export type PlayerAction =
  | { type: "PLAY"; content?: DhammaContent; options?: PlaybackOptions }
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
  | { type: "SET_ERROR"; error: string }
  | { type: "CLEAR_ERROR" };

// Supported playback speeds
export const PLAYBACK_SPEEDS = [0.5, 0.75, 1, 1.25, 1.5, 2] as const;
export type PlaybackSpeed = (typeof PLAYBACK_SPEEDS)[number];

// Player event types for analytics
export interface PlayerEvent {
  type:
    | "play"
    | "pause"
    | "seek"
    | "complete"
    | "error"
    | "speed_change"
    | "volume_change";
  contentId: string;
  timestamp: number;
  data?: Record<string, unknown>;
}
