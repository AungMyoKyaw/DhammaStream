"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Play, Clock, X } from "lucide-react";
import Link from "next/link";
import type { DhammaContent } from "@/lib/types";
import { useLiveRegion } from "@/components/ui/live-region";

interface PlaybackHistory {
  contentId: number;
  position: number;
  timestamp: number;
  title: string;
  speaker?: string;
  duration?: number;
  contentType: string;
}

export function ContinueListening() {
  const [recentContent, setRecentContent] = useState<PlaybackHistory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { announce } = useLiveRegion();

  const loadRecentContent = () => {
    try {
      setIsLoading(true);

      // Get all playback position keys from localStorage
      const keys = Object.keys(localStorage).filter((key) =>
        key.startsWith("dhamma-playback-")
      );

      const history: PlaybackHistory[] = keys
        .map((key) => {
          const contentId = parseInt(key.replace("dhamma-playback-", ""));
          const position = parseFloat(localStorage.getItem(key) || "0");

          // Get additional content metadata if stored
          const metadataKey = `dhamma-content-meta-${contentId}`;
          const metadata = localStorage.getItem(metadataKey);

          let parsedMetadata = {};
          if (metadata) {
            try {
              parsedMetadata = JSON.parse(metadata);
            } catch {
              // Ignore parsing errors
            }
          }

          return {
            contentId,
            position,
            timestamp: Date.now(), // In real implementation, store actual timestamp
            title: `Content ${contentId}`, // In real implementation, fetch from API
            ...parsedMetadata
          } as PlaybackHistory;
        })
        .filter((item) => item.position > 30) // Only show if listened for more than 30 seconds
        .sort((a, b) => b.timestamp - a.timestamp) // Sort by most recent
        .slice(0, 3); // Show only last 3 items

      setRecentContent(history);
    } catch (error) {
      console.error("Failed to load recent content:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadRecentContent();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const removeItem = (contentId: number) => {
    try {
      localStorage.removeItem(`dhamma-playback-${contentId}`);
      setRecentContent((prev) =>
        prev.filter((item) => item.contentId !== contentId)
      );
      announce("Item removed from continue listening", "polite");
    } catch (error) {
      console.error("Failed to remove item:", error);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const calculateProgress = (position: number, duration?: number) => {
    if (!duration) return 0;
    return Math.min((position / duration) * 100, 100);
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Continue Listening
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-muted rounded w-3/4" />
                    <div className="h-3 bg-muted rounded w-1/2" />
                  </div>
                  <div className="w-16 h-8 bg-muted rounded" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (recentContent.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Continue Listening
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {recentContent.map(
          ({ contentId, position, title, speaker, duration }) => (
            <div
              key={contentId}
              className="group relative flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted/70 transition-colors"
            >
              <div className="flex-1 min-w-0">
                <h4 className="font-medium truncate" title={title}>
                  {title}
                </h4>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span>{formatTime(position)}</span>
                  {duration && (
                    <>
                      <span>•</span>
                      <span>
                        {Math.floor((1 - position / duration) * 100)}% remaining
                      </span>
                    </>
                  )}
                  {speaker && (
                    <>
                      <span>•</span>
                      <span className="truncate">{speaker}</span>
                    </>
                  )}
                </div>

                {/* Progress bar */}
                {duration && (
                  <div className="mt-2 w-full bg-muted rounded-full h-1">
                    <div
                      className="bg-primary h-1 rounded-full transition-all"
                      style={{
                        width: `${calculateProgress(position, duration)}%`
                      }}
                    />
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2 ml-4">
                {/* Remove button - only visible on hover */}
                <Button
                  variant="ghost"
                  size="sm"
                  className="opacity-0 group-hover:opacity-100 transition-opacity p-1 h-8 w-8"
                  onClick={() => removeItem(contentId)}
                  aria-label={`Remove ${title} from continue listening`}
                >
                  <X className="h-4 w-4" />
                </Button>

                {/* Continue button */}
                <Button size="sm" asChild>
                  <Link
                    href={`/content/${contentId}`}
                    aria-label={`Continue listening to ${title}`}
                  >
                    <Play className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
          )
        )}

        {/* Clear all button */}
        <div className="pt-2 border-t">
          <Button
            variant="outline"
            size="sm"
            className="w-full"
            onClick={() => {
              recentContent.forEach((item) => removeItem(item.contentId));
              announce("All items cleared from continue listening", "polite");
            }}
          >
            Clear All
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// Utility function to save content metadata for better continue listening experience
export function saveContentMetadata(content: DhammaContent) {
  try {
    const metadata = {
      title: content.title,
      speaker: content.speaker?.name,
      duration: content.duration_estimate,
      contentType: content.content_type,
      timestamp: Date.now()
    };

    localStorage.setItem(
      `dhamma-content-meta-${content.id}`,
      JSON.stringify(metadata)
    );
  } catch (error) {
    console.error("Failed to save content metadata:", error);
  }
}
