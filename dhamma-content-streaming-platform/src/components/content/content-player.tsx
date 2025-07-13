"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ExternalLink, Play, Pause, Volume2, VolumeX } from "lucide-react";
import { useState, useRef, useEffect, useCallback } from "react";
import type { DhammaContent } from "@/lib/types";

interface ContentPlayerProps {
  readonly content: DhammaContent;
}

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

interface ContentPlayerProps {
  readonly content: DhammaContent;
}

export function ContentPlayer({ content }: ContentPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [hasResumed, setHasResumed] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const { savePosition, loadPosition, clearPosition } = usePlaybackPosition(
    content.id
  );

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

  const togglePlay = () => {
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
  };

  const toggleMute = () => {
    const audio = audioRef.current;
    const video = videoRef.current;
    const element = audio || video;

    if (!element) return;

    element.muted = !element.muted;
    setIsMuted(element.muted);
  };

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

            <div className="flex items-center space-x-4">
              <Button
                onClick={togglePlay}
                size="lg"
                className="w-12 h-12 rounded-full"
              >
                {isPlaying ? (
                  <Pause className="h-5 w-5" />
                ) : (
                  <Play className="h-5 w-5 ml-1" />
                )}
              </Button>

              <div className="flex-1">
                <input
                  type="range"
                  min="0"
                  max={duration || 0}
                  value={currentTime}
                  onChange={handleSeek}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>{formatTime(currentTime)}</span>
                  <span>{formatTime(duration)}</span>
                </div>
              </div>

              <Button
                onClick={toggleMute}
                variant="outline"
                size="sm"
                className="w-10 h-10"
              >
                {isMuted ? (
                  <VolumeX className="h-4 w-4" />
                ) : (
                  <Volume2 className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (content.content_type === "video") {
    return (
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
    );
  }

  if (content.content_type === "ebook") {
    return (
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
    );
  }

  // Default fallback for other content types
  return (
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
  );
}
