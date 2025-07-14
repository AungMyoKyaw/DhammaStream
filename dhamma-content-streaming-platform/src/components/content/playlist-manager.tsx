"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { OptimizedImage } from "@/components/ui/optimized-image";
import { useLiveRegion } from "@/components/ui/live-region";
import {
  Play,
  Pause,
  X,
  Plus,
  Shuffle,
  Repeat,
  ChevronUp,
  ChevronDown,
  Clock,
  User
} from "lucide-react";
import { useState, useCallback, useEffect } from "react";
import type { DhammaContent } from "@/lib/types";

interface PlaylistItem extends DhammaContent {
  addedAt: string;
  playlistIndex: number;
}

interface PlaylistManagerProps {
  readonly currentContent?: DhammaContent;
  readonly isPlaying?: boolean;
  readonly onContentChange?: (content: DhammaContent) => void;
  readonly visible?: boolean;
  readonly onToggleVisibility?: () => void;
}

export function PlaylistManager({
  currentContent,
  isPlaying = false,
  onContentChange,
  visible = false,
  onToggleVisibility
}: PlaylistManagerProps) {
  const [playlist, setPlaylist] = useState<PlaylistItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [isShuffled, setIsShuffled] = useState(false);
  const [repeatMode, setRepeatMode] = useState<"none" | "one" | "all">("none");
  const [originalOrder, setOriginalOrder] = useState<PlaylistItem[]>([]);
  const { announce } = useLiveRegion();

  // Load playlist from localStorage on mount
  useEffect(() => {
    const savedPlaylist = localStorage.getItem("dhamma-playlist");
    if (savedPlaylist) {
      try {
        const parsed = JSON.parse(savedPlaylist);
        setPlaylist(parsed);

        // Find current content in playlist
        if (currentContent) {
          const index = parsed.findIndex(
            (item: PlaylistItem) => item.id === currentContent.id
          );
          setCurrentIndex(index);
        }
      } catch (error) {
        console.error("Failed to load playlist:", error);
      }
    }
  }, [currentContent]);

  // Save playlist to localStorage whenever it changes
  const savePlaylist = useCallback((newPlaylist: PlaylistItem[]) => {
    try {
      localStorage.setItem("dhamma-playlist", JSON.stringify(newPlaylist));
    } catch (error) {
      console.error("Failed to save playlist:", error);
    }
  }, []);

  const removeFromPlaylist = useCallback(
    (index: number) => {
      const item = playlist[index];
      const newPlaylist = playlist.filter((_, i) => i !== index);

      // Update playlist indices
      const updatedPlaylist = newPlaylist.map((item, i) => ({
        ...item,
        playlistIndex: i
      }));

      setPlaylist(updatedPlaylist);
      savePlaylist(updatedPlaylist);

      // Adjust current index if needed
      if (index < currentIndex) {
        setCurrentIndex(currentIndex - 1);
      } else if (index === currentIndex) {
        setCurrentIndex(-1);
      }

      announce(`Removed "${item.title}" from playlist`);
    },
    [playlist, currentIndex, savePlaylist, announce]
  );

  const moveItem = useCallback(
    (fromIndex: number, toIndex: number) => {
      if (fromIndex === toIndex) return;

      const newPlaylist = [...playlist];
      const [moved] = newPlaylist.splice(fromIndex, 1);
      newPlaylist.splice(toIndex, 0, moved);

      // Update playlist indices
      const updatedPlaylist = newPlaylist.map((item, i) => ({
        ...item,
        playlistIndex: i
      }));

      setPlaylist(updatedPlaylist);
      savePlaylist(updatedPlaylist);

      // Update current index
      if (fromIndex === currentIndex) {
        setCurrentIndex(toIndex);
      } else if (fromIndex < currentIndex && toIndex >= currentIndex) {
        setCurrentIndex(currentIndex - 1);
      } else if (fromIndex > currentIndex && toIndex <= currentIndex) {
        setCurrentIndex(currentIndex + 1);
      }

      announce(`Moved item to position ${toIndex + 1}`);
    },
    [playlist, currentIndex, savePlaylist, announce]
  );

  const playItem = useCallback(
    (index: number) => {
      const item = playlist[index];
      if (item && onContentChange) {
        setCurrentIndex(index);
        onContentChange(item);
        announce(`Now playing: "${item.title}"`);
      }
    },
    [playlist, onContentChange, announce]
  );

  const playNext = useCallback(() => {
    if (playlist.length === 0) return;

    let nextIndex: number;

    if (repeatMode === "one") {
      nextIndex = currentIndex;
    } else if (isShuffled) {
      // Random next item (excluding current)
      const availableIndices = playlist
        .map((_, i) => i)
        .filter((i) => i !== currentIndex);
      nextIndex =
        availableIndices[Math.floor(Math.random() * availableIndices.length)];
    } else {
      nextIndex = currentIndex + 1;
      if (nextIndex >= playlist.length) {
        nextIndex = repeatMode === "all" ? 0 : currentIndex;
      }
    }

    if (nextIndex !== currentIndex || repeatMode === "one") {
      playItem(nextIndex);
    }
  }, [playlist, currentIndex, repeatMode, isShuffled, playItem]);

  const playPrevious = useCallback(() => {
    if (playlist.length === 0) return;

    let prevIndex: number;

    if (isShuffled) {
      // Random previous item (excluding current)
      const availableIndices = playlist
        .map((_, i) => i)
        .filter((i) => i !== currentIndex);
      prevIndex =
        availableIndices[Math.floor(Math.random() * availableIndices.length)];
    } else {
      prevIndex = currentIndex - 1;
      if (prevIndex < 0) {
        prevIndex = repeatMode === "all" ? playlist.length - 1 : 0;
      }
    }

    playItem(prevIndex);
  }, [playlist, currentIndex, repeatMode, isShuffled, playItem]);

  const toggleShuffle = useCallback(() => {
    if (!isShuffled) {
      // Save original order before shuffling
      setOriginalOrder([...playlist]);

      // Shuffle playlist while keeping current item in place
      const shuffled = [...playlist];
      const currentItem = currentIndex >= 0 ? shuffled[currentIndex] : null;

      // Remove current item temporarily
      if (currentItem) {
        shuffled.splice(currentIndex, 1);
      }

      // Shuffle remaining items
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }

      // Re-insert current item at the beginning
      if (currentItem) {
        shuffled.unshift(currentItem);
        setCurrentIndex(0);
      }

      setPlaylist(shuffled);
      announce("Playlist shuffled");
    } else {
      // Restore original order
      setPlaylist(originalOrder);

      // Find current item's new position
      if (currentContent && originalOrder.length > 0) {
        const newIndex = originalOrder.findIndex(
          (item) => item.id === currentContent.id
        );
        setCurrentIndex(newIndex);
      }

      announce("Playlist order restored");
    }

    setIsShuffled(!isShuffled);
  }, [
    isShuffled,
    playlist,
    currentIndex,
    originalOrder,
    currentContent,
    announce
  ]);

  const toggleRepeat = useCallback(() => {
    const modes: Array<"none" | "one" | "all"> = ["none", "one", "all"];
    const currentModeIndex = modes.indexOf(repeatMode);
    const nextMode = modes[(currentModeIndex + 1) % modes.length];

    setRepeatMode(nextMode);

    const modeLabels = {
      none: "Repeat off",
      one: "Repeat current",
      all: "Repeat all"
    };

    announce(modeLabels[nextMode]);
  }, [repeatMode, announce]);

  const clearPlaylist = useCallback(() => {
    setPlaylist([]);
    setCurrentIndex(-1);
    savePlaylist([]);
    announce("Playlist cleared");
  }, [savePlaylist, announce]);

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const getTotalDuration = () => {
    return playlist.reduce(
      (total, item) => total + (item.duration_estimate || 0),
      0
    );
  };

  if (!visible) {
    return null;
  }

  return (
    <Card className="fixed bottom-20 right-4 w-96 h-96 z-50 shadow-xl">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Playlist</CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-xs">
              {playlist.length} items
            </Badge>
            <Button
              onClick={onToggleVisibility}
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              aria-label="Close playlist"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {playlist.length > 0 && (
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>{formatDuration(getTotalDuration())} total</span>
            <div className="flex gap-1">
              <Button
                onClick={toggleShuffle}
                variant={isShuffled ? "default" : "ghost"}
                size="sm"
                className="h-7 w-7 p-0"
                aria-label={
                  isShuffled ? "Unshuffle playlist" : "Shuffle playlist"
                }
              >
                <Shuffle className="h-3 w-3" />
              </Button>
              <Button
                onClick={toggleRepeat}
                variant={repeatMode !== "none" ? "default" : "ghost"}
                size="sm"
                className="h-7 w-7 p-0"
                aria-label={`Repeat: ${repeatMode}`}
              >
                <Repeat className="h-3 w-3" />
                {repeatMode === "one" && (
                  <span className="absolute -top-1 -right-1 text-xs">1</span>
                )}
              </Button>
            </div>
          </div>
        )}
      </CardHeader>

      <CardContent className="p-0">
        {playlist.length === 0 ? (
          <div className="p-6 text-center text-muted-foreground">
            <Plus className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>Your playlist is empty</p>
            <p className="text-sm">Add content to start building your queue</p>
          </div>
        ) : (
          <div className="h-64 overflow-y-auto">
            {playlist.map((item, index) => (
              <div
                key={`${item.id}-${index}`}
                className={`flex items-center gap-3 p-3 hover:bg-muted/50 border-b ${
                  index === currentIndex
                    ? "bg-primary/10 border-primary/20"
                    : ""
                }`}
              >
                <div className="relative flex-shrink-0">
                  <OptimizedImage
                    src={`/api/placeholder/48/48?text=${item.content_type}`}
                    alt=""
                    className="w-12 h-12 rounded"
                  />
                  {index === currentIndex && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded">
                      {isPlaying ? (
                        <Pause className="h-4 w-4 text-white" />
                      ) : (
                        <Play className="h-4 w-4 text-white" />
                      )}
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-sm truncate">{item.title}</h4>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <User className="h-3 w-3" />
                    <span className="truncate">
                      {item.speaker?.name || "Unknown Speaker"}
                    </span>
                    {item.duration_estimate && (
                      <>
                        <Clock className="h-3 w-3" />
                        <span>{formatDuration(item.duration_estimate)}</span>
                      </>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  {index > 0 && (
                    <Button
                      onClick={() => moveItem(index, index - 1)}
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0"
                      aria-label="Move up"
                    >
                      <ChevronUp className="h-3 w-3" />
                    </Button>
                  )}

                  {index < playlist.length - 1 && (
                    <Button
                      onClick={() => moveItem(index, index + 1)}
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0"
                      aria-label="Move down"
                    >
                      <ChevronDown className="h-3 w-3" />
                    </Button>
                  )}

                  <Button
                    onClick={() => playItem(index)}
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0"
                    aria-label={
                      index === currentIndex && isPlaying ? "Pause" : "Play"
                    }
                  >
                    {index === currentIndex && isPlaying ? (
                      <Pause className="h-3 w-3" />
                    ) : (
                      <Play className="h-3 w-3" />
                    )}
                  </Button>

                  <Button
                    onClick={() => removeFromPlaylist(index)}
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                    aria-label="Remove from playlist"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {playlist.length > 0 && (
          <div className="p-3 border-t bg-muted/20">
            <div className="flex items-center justify-between">
              <div className="flex gap-1">
                <Button
                  onClick={playPrevious}
                  variant="outline"
                  size="sm"
                  disabled={playlist.length === 0}
                  aria-label="Previous track"
                >
                  <ChevronUp className="h-4 w-4" />
                </Button>
                <Button
                  onClick={playNext}
                  variant="outline"
                  size="sm"
                  disabled={playlist.length === 0}
                  aria-label="Next track"
                >
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </div>

              <Button
                onClick={clearPlaylist}
                variant="outline"
                size="sm"
                className="text-destructive hover:text-destructive"
              >
                Clear All
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Hook for playlist functionality
export function usePlaylist() {
  const [playlist, setPlaylist] = useState<PlaylistItem[]>([]);

  const addToPlaylist = useCallback(
    (content: DhammaContent) => {
      const newItem: PlaylistItem = {
        ...content,
        addedAt: new Date().toISOString(),
        playlistIndex: playlist.length
      };

      // Check if already exists
      const exists = playlist.find((item) => item.id === content.id);
      if (!exists) {
        const newPlaylist = [...playlist, newItem];
        setPlaylist(newPlaylist);

        // Save to localStorage
        try {
          localStorage.setItem("dhamma-playlist", JSON.stringify(newPlaylist));
        } catch (error) {
          console.error("Failed to save playlist:", error);
        }

        return true;
      }
      return false;
    },
    [playlist]
  );

  return {
    playlist,
    addToPlaylist
  };
}
