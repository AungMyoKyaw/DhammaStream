"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { FeatureIcons } from "@/components/ui/icons";

interface AdvancedPlayerControlsProps {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  playbackRate: number;
  volume: number;
  onPlayPause: () => void;
  onSeek: (time: number) => void;
  onPlaybackRateChange: (rate: number) => void;
  onVolumeChange: (volume: number) => void;
  onRewind: () => void;
  onFastForward: () => void;
  className?: string;
}

export default function AdvancedPlayerControls({
  isPlaying,
  currentTime,
  duration,
  playbackRate,
  volume,
  onPlayPause,
  onSeek,
  onPlaybackRateChange,
  onVolumeChange,
  onRewind,
  onFastForward,
  className = ""
}: AdvancedPlayerControlsProps) {
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);
  const [showPlaybackRateMenu, setShowPlaybackRateMenu] = useState(false);
  const [loopStart, setLoopStart] = useState<number | null>(null);
  const [loopEnd, setLoopEnd] = useState<number | null>(null);
  const [isLooping, setIsLooping] = useState(false);

  const progressRef = useRef<HTMLButtonElement>(null);
  const volumeRef = useRef<HTMLButtonElement>(null);

  // Playback rates available
  const playbackRates = [0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];

  // Format time for display
  const formatTime = useCallback((seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  }, []);

  // Handle progress bar click
  const handleProgressClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!progressRef.current) return;

    const rect = progressRef.current.getBoundingClientRect();
    const clickPosition = (e.clientX - rect.left) / rect.width;
    const newTime = clickPosition * duration;
    onSeek(newTime);
  };

  // Handle volume slider click
  const handleVolumeClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!volumeRef.current) return;

    const rect = volumeRef.current.getBoundingClientRect();
    const clickPosition = (e.clientX - rect.left) / rect.width;
    const newVolume = Math.max(0, Math.min(1, clickPosition));
    onVolumeChange(newVolume);
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only handle keys when not in an input field
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      switch (e.key) {
        case ' ':
          e.preventDefault();
          onPlayPause();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          onSeek(Math.max(0, currentTime - 10));
          break;
        case 'ArrowRight':
          e.preventDefault();
          onSeek(Math.min(duration, currentTime + 10));
          break;
        case 'ArrowUp':
          e.preventDefault();
          onVolumeChange(Math.min(1, volume + 0.1));
          break;
        case 'ArrowDown':
          e.preventDefault();
          onVolumeChange(Math.max(0, volume - 0.1));
          break;
        case 'm':
          e.preventDefault();
          onVolumeChange(volume > 0 ? 0 : 1);
          break;
        default:
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [currentTime, duration, volume, onPlayPause, onSeek, onVolumeChange]);

  // A-B Loop functionality
  const setLoopPoint = (type: 'start' | 'end') => {
    if (type === 'start') {
      setLoopStart(currentTime);
      if (loopEnd && currentTime >= loopEnd) {
        setLoopEnd(null);
      }
    } else {
      if (loopStart && currentTime > loopStart) {
        setLoopEnd(currentTime);
      }
    }
  };

  const clearLoop = () => {
    setLoopStart(null);
    setLoopEnd(null);
    setIsLooping(false);
  };

  // Handle looping during playback
  useEffect(() => {
    if (isLooping && loopStart !== null && loopEnd !== null && currentTime >= loopEnd) {
      onSeek(loopStart);
    }
  }, [currentTime, isLooping, loopStart, loopEnd, onSeek]);

  return (
    <div className={`bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-4 ${className}`}>
      {/* Progress Bar */}
      <div className="mb-4">
        <button
          ref={progressRef}
          type="button"
          className="relative w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full cursor-pointer group focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
          onClick={handleProgressClick}
          aria-label={`Seek to position ${Math.round((currentTime / duration) * 100)}%`}
        >
          <div
            className="absolute top-0 left-0 h-full bg-orange-600 dark:bg-orange-500 rounded-full transition-all pointer-events-none"
            style={{ width: `${(currentTime / duration) * 100}%` }}
          />

          {/* Loop markers */}
          {loopStart !== null && (
            <div
              className="absolute top-0 w-1 h-full bg-green-500 rounded pointer-events-none"
              style={{ left: `${(loopStart / duration) * 100}%` }}
            />
          )}
          {loopEnd !== null && (
            <div
              className="absolute top-0 w-1 h-full bg-red-500 rounded pointer-events-none"
              style={{ left: `${(loopEnd / duration) * 100}%` }}
            />
          )}

          {/* Progress handle */}
          <div
            className="absolute top-1/2 transform -translate-y-1/2 w-4 h-4 bg-orange-600 dark:bg-orange-500 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
            style={{ left: `${(currentTime / duration) * 100}%`, marginLeft: '-8px' }}
          />
        </button>

        {/* Time display */}
        <div className="flex justify-between items-center mt-2 text-sm text-gray-600 dark:text-gray-400">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      {/* Control buttons */}
      <div className="flex items-center justify-between">
        {/* Left controls */}
        <div className="flex items-center space-x-2">
          {/* Rewind */}
          <button
            type="button"
            onClick={onRewind}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500"
            aria-label="Rewind 10 seconds"
          >
            <FeatureIcons.SkipBack className="w-5 h-5" />
          </button>

          {/* Play/Pause */}
          <button
            type="button"
            onClick={onPlayPause}
            className="p-3 bg-orange-600 hover:bg-orange-700 dark:bg-orange-500 dark:hover:bg-orange-600 text-white rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
            aria-label={isPlaying ? "Pause" : "Play"}
          >
            {isPlaying ? (
              <FeatureIcons.Pause className="w-6 h-6" />
            ) : (
              <FeatureIcons.Play className="w-6 h-6" />
            )}
          </button>

          {/* Fast Forward */}
          <button
            type="button"
            onClick={onFastForward}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500"
            aria-label="Fast forward 10 seconds"
          >
            <FeatureIcons.SkipForward className="w-5 h-5" />
          </button>
        </div>

        {/* Center controls - A-B Loop */}
        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={() => setLoopPoint('start')}
            className={`px-3 py-1 text-sm rounded transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 ${
              loopStart !== null
                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                : 'bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300'
            }`}
            title="Set loop start point (A)"
          >
            A
          </button>

          <span className="text-sm text-gray-500 dark:text-gray-400">Loop</span>

          <button
            type="button"
            onClick={() => setLoopPoint('end')}
            className={`px-3 py-1 text-sm rounded transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 ${
              loopEnd !== null
                ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                : 'bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300'
            }`}
            title="Set loop end point (B)"
          >
            B
          </button>

          {loopStart !== null && loopEnd !== null && (
            <>
              <button
                type="button"
                onClick={() => setIsLooping(!isLooping)}
                className={`px-3 py-1 text-sm rounded transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                  isLooping
                    ? 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
                    : 'bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300'
                }`}
                title="Toggle loop playback"
              >
                Loop
              </button>

              <button
                type="button"
                onClick={clearLoop}
                className="px-2 py-1 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-500 rounded"
                title="Clear loop points"
              >
                Clear
              </button>
            </>
          )}
        </div>

        {/* Right controls */}
        <div className="flex items-center space-x-2">
          {/* Volume control */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowVolumeSlider(!showVolumeSlider)}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500"
              aria-label={`Volume ${Math.round(volume * 100)}%`}
            >
              <FeatureIcons.Volume className="w-5 h-5" />
            </button>

            {showVolumeSlider && (
              <div className="absolute bottom-full right-0 mb-2 p-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg">
                <button
                  ref={volumeRef}
                  type="button"
                  className="w-20 h-2 bg-gray-200 dark:bg-gray-700 rounded-full cursor-pointer focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
                  onClick={handleVolumeClick}
                  aria-label={`Volume ${Math.round(volume * 100)}%`}
                >
                  <div
                    className="h-full bg-orange-600 dark:bg-orange-500 rounded-full pointer-events-none"
                    style={{ width: `${volume * 100}%` }}
                  />
                </button>
              </div>
            )}
          </div>

          {/* Playback rate */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowPlaybackRateMenu(!showPlaybackRateMenu)}
              className="px-3 py-1 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500"
              aria-label={`Playback speed ${playbackRate}x`}
            >
              {playbackRate}x
            </button>

            {showPlaybackRateMenu && (
              <div className="absolute bottom-full right-0 mb-2 py-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg">
                {playbackRates.map((rate) => (
                  <button
                    key={rate}
                    type="button"
                    onClick={() => {
                      onPlaybackRateChange(rate);
                      setShowPlaybackRateMenu(false);
                    }}
                    className={`block w-full px-4 py-2 text-sm text-left hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
                      rate === playbackRate ? 'text-orange-600 dark:text-orange-400' : 'text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    {rate}x
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Keyboard shortcuts help */}
      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
        <details className="text-sm text-gray-600 dark:text-gray-400">
          <summary className="cursor-pointer hover:text-gray-800 dark:hover:text-gray-200">
            Keyboard shortcuts
          </summary>
          <div className="mt-2 space-y-1 text-xs">
            <div className="flex justify-between">
              <span>Play/Pause:</span>
              <span className="font-mono bg-gray-100 dark:bg-gray-700 px-1 rounded">Space</span>
            </div>
            <div className="flex justify-between">
              <span>Seek backward/forward:</span>
              <span className="font-mono bg-gray-100 dark:bg-gray-700 px-1 rounded">← / →</span>
            </div>
            <div className="flex justify-between">
              <span>Volume up/down:</span>
              <span className="font-mono bg-gray-100 dark:bg-gray-700 px-1 rounded">↑ / ↓</span>
            </div>
            <div className="flex justify-between">
              <span>Mute/unmute:</span>
              <span className="font-mono bg-gray-100 dark:bg-gray-700 px-1 rounded">M</span>
            </div>
          </div>
        </details>
      </div>
    </div>
  );
}
