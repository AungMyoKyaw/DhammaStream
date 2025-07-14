"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ExternalLink,
  Play,
  Pause,
  Volume2,
  VolumeX,
  SkipBack,
  SkipForward,
  Settings,
  Plus,
  List,
  Bookmark,
  BookmarkCheck
} from "lucide-react";
import { useState, useRef, useEffect, useCallback } from "react";
import type { DhammaContent } from "@/lib/types";
import { useLiveRegion } from "@/components/ui/live-region";
import {
  usePerformance,
  useInteractionTracking
} from "@/hooks/use-performance";
import { saveContentMetadata } from "./continue-listening";
import { PlaylistManager, usePlaylist } from "./playlist-manager";
import { useBookmarks } from "./bookmark-manager";

type ContentPlayerProps = {
  readonly content: DhammaContent;
};

// Custom hook for managing playback position
function usePlaybackPosition(contentId: number) {
  const getStorageKey = useCallback(
    () => `dhamma-playback-${contentId}`,
    [contentId]
  );

  const savePosition = useCallback(
    (position: number) => {
      try {
        localStorage.setItem(getStorageKey(), position.toString());
      } catch (error) {
        console.error("Failed to save playback position:", error);
      }
    },
    [getStorageKey]
  );

  const loadPosition = useCallback((): number => {
    try {
      const saved = localStorage.getItem(getStorageKey());
      return saved ? parseFloat(saved) : 0;
    } catch (error) {
      console.error("Failed to load playback position:", error);
      return 0;
    }
  }, [getStorageKey]);

  const clearPosition = useCallback(() => {
    try {
      localStorage.removeItem(getStorageKey());
    } catch (error) {
      console.error("Failed to clear playback position:", error);
    }
  }, [getStorageKey]);

  return { savePosition, loadPosition, clearPosition };
}

export function ContentPlayer({ content }: ContentPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [hasResumed, setHasResumed] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [showSettings, setShowSettings] = useState(false);
  const [volume, setVolume] = useState(1);
  const [showPlaylist, setShowPlaylist] = useState(false);

  const audioRef = useRef<HTMLAudioElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const { announce } = useLiveRegion();
  const { trackInteraction } = useInteractionTracking();
  const { addToPlaylist } = usePlaylist();
  const { addBookmark, removeBookmark, isBookmarked, updateProgress } =
    useBookmarks();
  usePerformance(`ContentPlayer-${content.content_type}`);

  const { savePosition, loadPosition, clearPosition } = usePlaybackPosition(
    content.id
  );

  // Save content metadata for continue listening feature
  useEffect(() => {
    saveContentMetadata(content);
  }, [content]);

  // Playback speed control
  const changePlaybackRate = useCallback(
    (rate: number) => {
      const element = audioRef.current || videoRef.current;
      if (element) {
        element.playbackRate = rate;
        setPlaybackRate(rate);
        announce(`Playback speed changed to ${rate}x`, "polite");
        trackInteraction("playback-speed-change", "player", performance.now());
      }
    },
    [announce, trackInteraction]
  );

  // Skip functionality
  const skip = useCallback(
    (seconds: number) => {
      const element = audioRef.current || videoRef.current;
      if (element) {
        const newTime = Math.max(
          0,
          Math.min(element.duration || 0, element.currentTime + seconds)
        );
        element.currentTime = newTime;
        setCurrentTime(newTime);
        announce(
          `Skipped ${seconds > 0 ? "forward" : "backward"} ${Math.abs(seconds)} seconds`,
          "polite"
        );
        trackInteraction("skip", "player", performance.now());
      }
    },
    [announce, trackInteraction]
  );

  // Volume control
  const changeVolume = useCallback((newVolume: number) => {
    const element = audioRef.current || videoRef.current;
    if (element) {
      element.volume = newVolume;
      setVolume(newVolume);
      if (newVolume === 0) {
        setIsMuted(true);
        element.muted = true;
      } else {
        setIsMuted(false);
        element.muted = false;
      }
    }
  }, []);

  // Helper function to attempt auto-play
  const attemptAutoPlay = useCallback(async (element: HTMLMediaElement) => {
    try {
      await element.play();
      setIsPlaying(true);
    } catch (error) {
      console.log("Auto-play prevented by browser:", error);
    }
  }, []);

  // Auto-play and resume functionality
  useEffect(() => {
    const audio = audioRef.current;
    const video = videoRef.current;
    const element = audio || video;

    if (!element || hasResumed) return;

    const handleLoadedMetadata = () => {
      const savedPosition = loadPosition();

      if (savedPosition > 0 && savedPosition < element.duration) {
        // Resume from saved position
        element.currentTime = savedPosition;
        setCurrentTime(savedPosition);

        // Auto-play after resuming position
        setTimeout(() => attemptAutoPlay(element), 100);
      } else {
        // Auto-play from beginning for new content
        setTimeout(() => attemptAutoPlay(element), 100);
      }

      setHasResumed(true);
    };

    element.addEventListener("loadedmetadata", handleLoadedMetadata);

    return () => {
      element.removeEventListener("loadedmetadata", handleLoadedMetadata);
    };
  }, [loadPosition, hasResumed, attemptAutoPlay]);

  // Save position periodically and handle playback events
  useEffect(() => {
    const audio = audioRef.current;
    const video = videoRef.current;
    const element = audio || video;

    if (!element) return;

    const updateTime = () => {
      setCurrentTime(element.currentTime);
      // Save position every 5 seconds
      if (element.currentTime > 0) {
        savePosition(element.currentTime);
      }
    };

    const updateDuration = () => setDuration(element.duration);

    const handleEnded = () => {
      setIsPlaying(false);
      clearPosition(); // Clear saved position when content ends
    };

    const handlePause = () => {
      setIsPlaying(false);
      if (element.currentTime > 0) {
        savePosition(element.currentTime);
      }
    };

    const handlePlay = () => {
      setIsPlaying(true);
    };

    element.addEventListener("timeupdate", updateTime);
    element.addEventListener("loadedmetadata", updateDuration);
    element.addEventListener("ended", handleEnded);
    element.addEventListener("pause", handlePause);
    element.addEventListener("play", handlePlay);

    return () => {
      element.removeEventListener("timeupdate", updateTime);
      element.removeEventListener("loadedmetadata", updateDuration);
      element.removeEventListener("ended", handleEnded);
      element.removeEventListener("pause", handlePause);
      element.removeEventListener("play", handlePlay);
    };
  }, [savePosition, clearPosition]);

  const togglePlay = useCallback(() => {
    const audio = audioRef.current;
    const video = videoRef.current;
    const element = audio || video;

    if (!element) return;

    if (isPlaying) {
      element.pause();
    } else {
      element.play();
    }
    setIsPlaying(!isPlaying);
  }, [isPlaying]);

  const toggleMute = useCallback(() => {
    const audio = audioRef.current;
    const video = videoRef.current;
    const element = audio || video;

    if (!element) return;

    element.muted = !element.muted;
    setIsMuted(element.muted);
  }, []);

  // Playlist functionality
  const handleAddToPlaylist = useCallback(() => {
    const success = addToPlaylist(content);
    if (success) {
      announce(`Added "${content.title}" to playlist`);
    } else {
      announce(`"${content.title}" is already in playlist`);
    }
  }, [addToPlaylist, content, announce]);

  // Bookmark functionality
  const contentIsBookmarked = isBookmarked(content.id.toString());

  const handleToggleBookmark = useCallback(() => {
    if (contentIsBookmarked) {
      removeBookmark(content.id.toString());
    } else {
      const element = audioRef.current || videoRef.current;
      const position = element ? element.currentTime : 0;
      const bookmarkContent = {
        id: content.id.toString(),
        title: content.title,
        type: content.content_type,
        speaker:
          typeof content.speaker === "object"
            ? content.speaker?.name
            : (content.speaker ?? "Unknown"),
        duration: content.duration_estimate,
        tags: content.tags?.map((tag) => tag.name)
      };
      addBookmark(bookmarkContent, position);
    }
    trackInteraction("bookmark-toggle", "player", performance.now());
  }, [
    contentIsBookmarked,
    removeBookmark,
    addBookmark,
    content,
    trackInteraction
  ]);

  // Update bookmark progress when playing
  useEffect(() => {
    if (isPlaying && contentIsBookmarked) {
      const interval = setInterval(() => {
        updateProgress(content.id.toString(), currentTime);
      }, 5000); // Update every 5 seconds

      return () => clearInterval(interval);
    }
  }, [isPlaying, contentIsBookmarked, updateProgress, content.id, currentTime]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Don't handle shortcuts if user is typing in an input
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      const startTime = performance.now();

      switch (e.key) {
        case " ":
          e.preventDefault();
          togglePlay();
          trackInteraction("keyboard-play-pause", "player", startTime);
          break;
        case "ArrowLeft":
          e.preventDefault();
          skip(-15);
          break;
        case "ArrowRight":
          e.preventDefault();
          skip(15);
          break;
        case "m":
        case "M":
          e.preventDefault();
          toggleMute();
          trackInteraction("keyboard-mute", "player", startTime);
          break;
        case "j":
        case "J":
          e.preventDefault();
          skip(-10);
          break;
        case "k":
        case "K":
          e.preventDefault();
          togglePlay();
          break;
        case "l":
        case "L":
          e.preventDefault();
          skip(10);
          break;
        case ",":
          e.preventDefault();
          changePlaybackRate(Math.max(0.25, playbackRate - 0.25));
          break;
        case ".":
          e.preventDefault();
          changePlaybackRate(Math.min(2, playbackRate + 0.25));
          break;
        case "p":
        case "P":
          if (e.shiftKey) {
            e.preventDefault();
            setShowPlaylist(!showPlaylist);
            trackInteraction("keyboard-playlist-toggle", "player", startTime);
          }
          break;
        case "+":
        case "=":
          e.preventDefault();
          handleAddToPlaylist();
          trackInteraction("keyboard-add-playlist", "player", startTime);
          break;
        case "b":
        case "B":
          e.preventDefault();
          handleToggleBookmark();
          trackInteraction("keyboard-bookmark", "player", startTime);
          break;
      }
    };

    document.addEventListener("keydown", handleKeyPress);
    return () => document.removeEventListener("keydown", handleKeyPress);
  }, [
    skip,
    togglePlay,
    toggleMute,
    changePlaybackRate,
    playbackRate,
    trackInteraction,
    showPlaylist,
    handleAddToPlaylist,
    handleToggleBookmark
  ]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current;
    const video = videoRef.current;
    const element = audio || video;

    if (!element) return;

    const time = parseFloat(e.target.value);
    element.currentTime = time;
    setCurrentTime(time);
  };

  if (content.content_type === "audio") {
    return (
      <>
        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              <audio
                ref={audioRef}
                src={content.file_url}
                preload="metadata"
                className="hidden"
              >
                <track kind="captions" srcLang="en" label="English captions" />
              </audio>

              {/* Resume indicator */}
              {currentTime > 0 && duration > 0 && (
                <div className="text-sm text-muted-foreground text-center mb-2">
                  {hasResumed ? "Resumed from" : "Playing at"}{" "}
                  {formatTime(currentTime)} / {formatTime(duration)}
                </div>
              )}

              <div className="space-y-4">
                {/* Mobile-first layout - stack controls on smaller screens */}

                {/* Primary controls row - always visible */}
                <div className="flex items-center justify-center space-x-4">
                  {/* Skip backward button */}
                  <Button
                    onClick={() => skip(-15)}
                    variant="outline"
                    size="sm"
                    className="w-10 h-10 shrink-0"
                    aria-label="Skip backward 15 seconds"
                  >
                    <SkipBack className="h-4 w-4" />
                  </Button>

                  {/* Main play/pause button */}
                  <Button
                    onClick={togglePlay}
                    size="lg"
                    className="w-12 h-12 rounded-full shrink-0"
                    aria-label={isPlaying ? "Pause" : "Play"}
                  >
                    {isPlaying ? (
                      <Pause className="h-5 w-5" />
                    ) : (
                      <Play className="h-5 w-5 ml-1" />
                    )}
                  </Button>

                  {/* Skip forward button */}
                  <Button
                    onClick={() => skip(15)}
                    variant="outline"
                    size="sm"
                    className="w-10 h-10 shrink-0"
                    aria-label="Skip forward 15 seconds"
                  >
                    <SkipForward className="h-4 w-4" />
                  </Button>
                </div>

                {/* Progress bar - full width on mobile */}
                <div className="w-full px-2">
                  <input
                    type="range"
                    min="0"
                    max={duration || 0}
                    value={currentTime}
                    onChange={handleSeek}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    aria-label="Seek position"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>{formatTime(currentTime)}</span>
                    <span>{formatTime(duration)}</span>
                  </div>
                </div>

                {/* Secondary controls - responsive layout */}
                <div className="flex items-center justify-center gap-2 flex-wrap">
                  {/* Volume control */}
                  <Button
                    onClick={toggleMute}
                    variant="outline"
                    size="sm"
                    className="w-10 h-10 shrink-0"
                    aria-label={isMuted ? "Unmute" : "Mute"}
                  >
                    {isMuted ? (
                      <VolumeX className="h-4 w-4" />
                    ) : (
                      <Volume2 className="h-4 w-4" />
                    )}
                  </Button>

                  {/* Settings button */}
                  <Button
                    onClick={() => setShowSettings(!showSettings)}
                    variant="outline"
                    size="sm"
                    className="w-10 h-10 shrink-0"
                    aria-label="Player settings"
                  >
                    <Settings className="h-4 w-4" />
                  </Button>

                  {/* Add to playlist button */}
                  <Button
                    onClick={handleAddToPlaylist}
                    variant="outline"
                    size="sm"
                    className="w-10 h-10 shrink-0"
                    aria-label="Add to playlist"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>

                  {/* Bookmark button */}
                  <Button
                    onClick={handleToggleBookmark}
                    variant={contentIsBookmarked ? "default" : "outline"}
                    size="sm"
                    className="w-10 h-10 shrink-0"
                    aria-label={
                      contentIsBookmarked ? "Remove bookmark" : "Add bookmark"
                    }
                  >
                    {contentIsBookmarked ? (
                      <BookmarkCheck className="h-4 w-4" />
                    ) : (
                      <Bookmark className="h-4 w-4" />
                    )}
                  </Button>

                  {/* Show playlist button */}
                  <Button
                    onClick={() => setShowPlaylist(!showPlaylist)}
                    variant={showPlaylist ? "default" : "outline"}
                    size="sm"
                    className="w-10 h-10 shrink-0"
                    aria-label={
                      showPlaylist ? "Hide playlist" : "Show playlist"
                    }
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Advanced controls */}
              {showSettings && (
                <div className="mt-4 p-4 bg-muted/50 rounded-lg space-y-4">
                  <h4 className="text-sm font-semibold">Player Settings</h4>

                  {/* Playback speed - mobile-responsive grid */}
                  <div className="space-y-3">
                    <span className="text-sm font-medium">Playback Speed:</span>
                    <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                      {[0.5, 0.75, 1, 1.25, 1.5, 2].map((rate) => (
                        <Button
                          key={rate}
                          variant={
                            playbackRate === rate ? "default" : "outline"
                          }
                          size="sm"
                          onClick={() => changePlaybackRate(rate)}
                          className="h-8 px-3 text-xs"
                        >
                          {rate}x
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* Volume slider */}
                  <div className="flex items-center gap-3">
                    <span className="text-sm">Volume:</span>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.1"
                      value={volume}
                      onChange={(e) => changeVolume(parseFloat(e.target.value))}
                      className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                      aria-label="Volume control"
                    />
                    <span className="text-xs text-muted-foreground w-10">
                      {Math.round(volume * 100)}%
                    </span>
                  </div>

                  {/* Keyboard shortcuts info */}
                  <div className="text-xs text-muted-foreground">
                    <p className="font-medium mb-1">Keyboard Shortcuts:</p>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                      <span>Space: Play/Pause</span>
                      <span>M: Mute/Unmute</span>
                      <span>←/→: Skip 15s</span>
                      <span>J/L: Skip 10s</span>
                      <span>K: Play/Pause</span>
                      <span>,/.: Speed ±0.25x</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <PlaylistManager
          currentContent={content}
          isPlaying={isPlaying}
          visible={showPlaylist}
          onToggleVisibility={() => setShowPlaylist(!showPlaylist)}
        />
      </>
    );
  }

  if (content.content_type === "video") {
    return (
      <>
        <Card>
          <CardContent className="p-0">
            <video
              ref={videoRef}
              src={content.file_url}
              controls
              className="w-full h-auto rounded-t-lg"
              preload="metadata"
            >
              <track kind="captions" srcLang="en" label="English captions" />
              Your browser does not support the video tag.
            </video>

            {/* Resume indicator */}
            {currentTime > 0 && duration > 0 && (
              <div className="p-4 bg-muted/50 text-sm text-muted-foreground text-center">
                Resume from {formatTime(currentTime)} / {formatTime(duration)}
              </div>
            )}
          </CardContent>
        </Card>

        <PlaylistManager
          currentContent={content}
          isPlaying={isPlaying}
          visible={showPlaylist}
          onToggleVisibility={() => setShowPlaylist(!showPlaylist)}
        />
      </>
    );
  }

  if (content.content_type === "ebook") {
    return (
      <>
        <Card>
          <CardContent className="p-6 text-center">
            <div className="space-y-4">
              <div className="w-16 h-20 mx-auto bg-primary/10 rounded flex items-center justify-center">
                <svg
                  className="w-8 h-8 text-primary"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-label="Book icon"
                >
                  <title>Book icon</title>
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                  />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2">Digital Book</h3>
                <p className="text-muted-foreground mb-4">
                  This content is available as a downloadable book or document.
                </p>
                <Button asChild>
                  <a
                    href={content.file_url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Open Book
                  </a>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <PlaylistManager
          currentContent={content}
          isPlaying={isPlaying}
          visible={showPlaylist}
          onToggleVisibility={() => setShowPlaylist(!showPlaylist)}
        />
      </>
    );
  }

  // Default fallback for other content types
  return (
    <>
      <Card>
        <CardContent className="p-6 text-center">
          <div className="space-y-4">
            <div className="w-16 h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
              <ExternalLink className="w-8 h-8 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">External Content</h3>
              <p className="text-muted-foreground mb-4">
                This content is available at an external location.
              </p>
              <Button asChild>
                <a
                  href={content.file_url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <ExternalLink className="mr-2 h-4 w-4" />
                  View Content
                </a>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <PlaylistManager
        currentContent={content}
        isPlaying={isPlaying}
        visible={showPlaylist}
        onToggleVisibility={() => setShowPlaylist(!showPlaylist)}
      />
    </>
  );
}
