import { Play, Pause, SkipBack, SkipForward } from "lucide-react";
import { Button } from "@/components/common/Button";
import { usePlayerStore } from "@/store";
import { formatDuration } from "@/utils";

export function MobilePlayer() {
  const { currentContent, isPlaying, currentTime, duration, dispatch } =
    usePlayerStore();

  if (!currentContent) return null;

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="md:hidden bg-background border-t border-border p-4">
      {/* Progress Bar */}
      <div className="w-full bg-muted rounded-full h-1 mb-4">
        <div
          className="bg-primary h-1 rounded-full transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Content Info & Controls */}
      <div className="flex items-center justify-between">
        {/* Content Info */}
        <div className="flex items-center space-x-3 flex-1 min-w-0">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
            <span className="text-white font-bold text-sm">
              {currentContent.speaker?.[0] || "D"}
            </span>
          </div>

          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground truncate">
              {currentContent.title}
            </p>
            <p className="text-xs text-muted-foreground truncate">
              {currentContent.speaker || "Unknown Speaker"}
            </p>
            <div className="flex items-center space-x-2 text-xs text-muted-foreground">
              <span>{formatDuration(currentTime)}</span>
              <span>/</span>
              <span>{formatDuration(duration)}</span>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => dispatch({ type: "PREVIOUS" })}
          >
            <SkipBack className="h-4 w-4" />
          </Button>

          <Button
            variant="player"
            size="icon"
            onClick={() => dispatch({ type: isPlaying ? "PAUSE" : "PLAY" })}
          >
            {isPlaying ? (
              <Pause className="h-5 w-5" />
            ) : (
              <Play className="h-5 w-5" />
            )}
          </Button>

          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => dispatch({ type: "NEXT" })}
          >
            <SkipForward className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
