import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  Heart,
  Download,
  Share,
  MoreHorizontal,
  ChevronLeft
} from "lucide-react";
import { Button } from "@/components/common/Button";
import { Loading } from "@/components/common/Loading";
import { usePlayerStore } from "@/store";
import type { DhammaContent } from "@/types/content";
import { formatDuration } from "@/utils";
import { getContentById } from "@/services/content";

export default function PlayerPage() {
  const { id } = useParams<{ id: string }>();
  const [content, setContent] = useState<DhammaContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [volume, setVolume] = useState(80);

  const { currentContent, isPlaying, currentTime, duration, dispatch } =
    usePlayerStore();

  useEffect(() => {
    // Load content by id
    const loadContent = async (contentId: string) => {
      try {
        setLoading(true);
        // Fetch content from Firestore
        const fetched = await getContentById(contentId);
        if (fetched) {
          setContent(fetched);
        } else {
          console.error(`Content with id ${id} not found`);
        }

        // Auto-play when content is loaded
        if (fetched) {
          dispatch({
            type: "PLAY",
            content: fetched,
            options: { autoplay: true }
          });
        }
      } catch (error) {
        console.error("Error loading content:", error);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      loadContent(id);
    }
  }, [id, dispatch]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <Loading size="lg" message="Loading content..." />
      </div>
    );
  }

  if (!content) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Content not found</p>
      </div>
    );
  }

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;
  const isCurrentContent = currentContent?.id === content.id;

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex items-center mb-6">
        <Button
          variant="ghost"
          size="icon"
          className="mr-4"
          onClick={() => window.history.back()}
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-2xl font-bold text-foreground">Now Playing</h1>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Player Section */}
        <div className="lg:col-span-2">
          {/* Album Art / Visual */}
          <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg aspect-video flex items-center justify-center mb-6">
            <div className="text-center text-white">
              <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl font-bold">
                  {content.speaker?.[0] || "D"}
                </span>
              </div>
              <p className="text-sm opacity-80">
                {content.contentType.toUpperCase()}
              </p>
            </div>
          </div>

          {/* Content Info */}
          <div className="mb-6">
            <h2 className="text-3xl font-bold text-foreground mb-2">
              {content.title}
            </h2>
            <p className="text-lg text-muted-foreground mb-4">
              by {content.speaker || "Unknown Speaker"}
            </p>

            <div className="flex items-center space-x-4 text-sm text-muted-foreground mb-4">
              <span>{content.category}</span>
              <span>•</span>
              <span>{formatDuration(content.durationEstimate || 0)}</span>
              <span>•</span>
              <span>{content.difficulty}</span>
              <span>•</span>
              <span>
                ★ {content.avgRating} ({content.reviewCount} reviews)
              </span>
            </div>

            <p className="text-muted-foreground leading-relaxed">
              {content.description}
            </p>
          </div>

          {/* Progress Bar */}
          <div className="mb-6">
            <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
              <span>{formatDuration(currentTime)}</span>
              <span>{formatDuration(duration)}</span>
            </div>
            <div className="w-full bg-muted rounded-full h-2 cursor-pointer">
              <div
                className="bg-primary h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-center space-x-4 mb-8">
            <Button
              variant="ghost"
              size="icon-lg"
              onClick={() => dispatch({ type: "PREVIOUS" })}
            >
              <SkipBack className="h-6 w-6" />
            </Button>

            <Button
              variant="player"
              size="icon-lg"
              onClick={() => dispatch({ type: isPlaying ? "PAUSE" : "PLAY" })}
              className="w-16 h-16"
            >
              {isCurrentContent && isPlaying ? (
                <Pause className="h-8 w-8" />
              ) : (
                <Play className="h-8 w-8" />
              )}
            </Button>

            <Button
              variant="ghost"
              size="icon-lg"
              onClick={() => dispatch({ type: "NEXT" })}
            >
              <SkipForward className="h-6 w-6" />
            </Button>
          </div>

          {/* Volume Control */}
          <div className="flex items-center justify-center space-x-4">
            <Volume2 className="h-5 w-5 text-muted-foreground" />
            <input
              type="range"
              min="0"
              max="100"
              value={volume}
              onChange={(e) => setVolume(Number(e.target.value))}
              className="w-32 h-2 bg-muted rounded-lg appearance-none cursor-pointer"
            />
            <span className="text-sm text-muted-foreground w-8">{volume}%</span>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Actions */}
          <div className="bg-card border border-border rounded-lg p-4">
            <h3 className="font-semibold text-foreground mb-4">Actions</h3>
            <div className="space-y-3">
              <Button variant="outline" className="w-full justify-start">
                <Heart className="h-4 w-4 mr-2" />
                Add to Favorites
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Share className="h-4 w-4 mr-2" />
                Share
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <MoreHorizontal className="h-4 w-4 mr-2" />
                More Options
              </Button>
            </div>
          </div>

          {/* Tags */}
          <div className="bg-card border border-border rounded-lg p-4">
            <h3 className="font-semibold text-foreground mb-4">Tags</h3>
            <div className="flex flex-wrap gap-2">
              {content.tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-secondary text-secondary-foreground"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>

          {/* Stats */}
          <div className="bg-card border border-border rounded-lg p-4">
            <h3 className="font-semibold text-foreground mb-4">Statistics</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Downloads:</span>
                <span className="font-medium">
                  {content.downloadCount.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Rating:</span>
                <span className="font-medium">★ {content.avgRating}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Reviews:</span>
                <span className="font-medium">{content.reviewCount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Quality Score:</span>
                <span className="font-medium">{content.qualityScore}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
