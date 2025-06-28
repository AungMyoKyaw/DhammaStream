import { useParams } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  ChevronLeft
} from "lucide-react";
import { Button } from "@/components/common/Button";
import { Loading } from "@/components/common/Loading";
import { usePlayerStore } from "@/store";
import type { DhammaContent } from "@/types/content";
import { formatDuration } from "@/utils";
import { getContentById } from "@/services/content";

import ReactAudioPlayer from "react-audio-player";
import ReactPlayer from "react-player";

import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;

export default function PlayerPage() {
  const { id } = useParams<{ id: string }>();
  const [content, setContent] = useState<DhammaContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [volume, setVolume] = useState(80);
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState<number>(1);

  const reactPlayerRef = useRef<ReactPlayer | null>(null);
  const reactAudioPlayerRef = useRef<ReactAudioPlayer | null>(null);

  const { currentContent, isPlaying, currentTime, duration, dispatch } =
    usePlayerStore();

  useEffect(() => {
    // Load content by id
    const loadContent = async (contentId: string) => {
      try {
        setLoading(true);
        setError(null);
        // Try to fetch from each collection until we find the content
        const contentTypes: DhammaContent["contentType"][] = [
          "ebook",
          "sermon",
          "video"
        ];
        let fetched: DhammaContent | null = null;

        for (const contentType of contentTypes) {
          try {
            fetched = await getContentById(contentId, contentType);
            if (fetched) break;
          } catch (fetchError) {
            // Continue to next content type
            console.warn(`Failed to fetch ${contentType}:`, fetchError);
            continue;
          }
        }

        if (fetched) {
          setContent(fetched);
          dispatch({
            type: "PLAY",
            content: fetched,
            options: { autoplay: false } // Don't autoplay on page load for better UX
          });
        } else {
          setError(`Content with id ${contentId} not found`);
          console.error(`Content with id ${id} not found`);
        }
      } catch (loadError) {
        console.error("Error loading content:", loadError);
        setError("Failed to load content. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      loadContent(id);
    }
  }, [id, dispatch]);

  const handleProgress = (state: { playedSeconds: number }) => {
    dispatch({
      type: "SET_CURRENT_TIME",
      time: state.playedSeconds
    });
  };

  const handleDuration = (duration: number) => {
    dispatch({
      type: "SET_DURATION",
      duration: duration
    });
  };

  const handleAudioPlayerListen = (time: number) => {
    dispatch({
      type: "SET_CURRENT_TIME",
      time: time
    });
  };

  const handleAudioPlayerLoadedMetadata = () => {
    if (reactAudioPlayerRef.current?.audioEl.current) {
      dispatch({
        type: "SET_DURATION",
        duration: reactAudioPlayerRef.current.audioEl.current.duration
      });
    }
  };

  const handleEnded = () => {
    dispatch({ type: "STOP" });
  };

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setPageNumber(1);
    setError(null);
  };

  const changePage = (offset: number) => {
    setPageNumber((prevPageNumber) => {
      const newPage = prevPageNumber + offset;
      return Math.max(1, Math.min(newPage, numPages || 1));
    });
  };

  const previousPage = () => changePage(-1);
  const nextPage = () => changePage(1);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <Loading size="lg" message="Loading content..." />
      </div>
    );
  }

  if (error || !content) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="flex items-center mb-6">
          <Button
            variant="ghost"
            size="icon"
            className="mr-4"
            onClick={() => window.history.back()}
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold text-foreground">Player</h1>
        </div>
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">
            {error || "Content not found"}
          </p>
          <Button onClick={() => window.history.back()} variant="outline">
            Go Back
          </Button>
        </div>
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
          {/* Media Player */}
          <div className="bg-card rounded-lg aspect-video flex items-center justify-center mb-6 overflow-hidden">
            {content.contentType === "sermon" && (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-500/10 to-purple-500/10">
                <div className="text-center">
                  <div className="w-20 h-20 mx-auto mb-4 bg-blue-500 rounded-full flex items-center justify-center">
                    <Volume2 className="h-10 w-10 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Audio Sermon</h3>
                  <ReactAudioPlayer
                    src={content.fileUrl}
                    autoPlay={false}
                    controls
                    className="w-full"
                    ref={reactAudioPlayerRef}
                    onListen={handleAudioPlayerListen}
                    onEnded={handleEnded}
                    onLoadedMetadata={handleAudioPlayerLoadedMetadata}
                    onError={(e) => {
                      console.error("Audio playback error:", e);
                      setError(
                        "Failed to load audio. Please check the file format."
                      );
                    }}
                    volume={volume / 100}
                  />
                </div>
              </div>
            )}
            {content.contentType === "video" && (
              <ReactPlayer
                url={content.fileUrl}
                playing={isPlaying}
                controls
                width="100%"
                height="100%"
                ref={reactPlayerRef}
                onProgress={handleProgress}
                onDuration={handleDuration}
                onEnded={handleEnded}
                onError={(e) => {
                  console.error("Video playback error:", e);
                  setError(
                    "Failed to load video. Please check the file format."
                  );
                }}
                onReady={() => {
                  console.log("Video player ready");
                  setError(null);
                }}
                volume={volume / 100}
                config={{
                  file: {
                    attributes: {
                      crossOrigin: "anonymous",
                      controlsList: "nodownload"
                    }
                  }
                }}
              />
            )}
            {content.contentType === "ebook" && (
              <div className="w-full h-full flex flex-col items-center justify-center p-4">
                <Document
                  file={content.fileUrl}
                  onLoadSuccess={onDocumentLoadSuccess}
                  onLoadError={(pdfError) => {
                    console.error("PDF loading error:", pdfError);
                    setError("Failed to load PDF. Please try again.");
                  }}
                  className="flex flex-col items-center"
                  loading={
                    <div className="text-center">
                      <Loading size="lg" message="Loading PDF..." />
                    </div>
                  }
                >
                  <Page
                    pageNumber={pageNumber}
                    width={Math.min(600, window.innerWidth - 100)}
                    renderTextLayer={true}
                    renderAnnotationLayer={true}
                  />
                </Document>
                {numPages && (
                  <div className="flex items-center space-x-4 mt-4">
                    <Button
                      type="button"
                      disabled={pageNumber <= 1}
                      onClick={previousPage}
                      variant="outline"
                      size="sm"
                    >
                      Previous
                    </Button>
                    <span className="text-sm text-muted-foreground">
                      Page {pageNumber} of {numPages}
                    </span>
                    <Button
                      type="button"
                      disabled={pageNumber >= numPages}
                      onClick={nextPage}
                      variant="outline"
                      size="sm"
                    >
                      Next
                    </Button>
                  </div>
                )}
              </div>
            )}
            {(!content.fileUrl ||
              (content.contentType !== "sermon" &&
                content.contentType !== "video" &&
                content.contentType !== "ebook")) && (
              <div className="text-center text-muted-foreground">
                <div className="w-16 h-16 mx-auto mb-4 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
                  <Play className="h-8 w-8" />
                </div>
                <p>No playable content available.</p>
                <p className="text-sm mt-2">
                  Please check the file URL or format.
                </p>
              </div>
            )}
            {error && (
              <div className="text-center text-red-500">
                <p className="mb-2">{error}</p>
                <Button
                  onClick={() => {
                    setError(null);
                    window.location.reload();
                  }}
                  variant="outline"
                  size="sm"
                >
                  Retry
                </Button>
              </div>
            )}
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
          {(content.contentType === "sermon" ||
            content.contentType === "video") && (
            <div className="mb-6">
              <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
                <span>{formatDuration(currentTime)}</span>
                <span>{formatDuration(duration)}</span>
              </div>
              <button
                type="button"
                className="w-full bg-muted rounded-full h-2 cursor-pointer block hover:h-3 transition-all"
                onClick={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const clickX = e.clientX - rect.left;
                  const newTime = (clickX / rect.width) * duration;
                  dispatch({
                    type: "SET_CURRENT_TIME",
                    time: newTime
                  });

                  // Seek in the actual player
                  if (
                    content?.contentType === "video" &&
                    reactPlayerRef.current
                  ) {
                    reactPlayerRef.current.seekTo(newTime);
                  }
                }}
              >
                <div
                  className="bg-primary h-2 rounded-full transition-all duration-300 hover:h-3"
                  style={{ width: `${progress}%` }}
                />
              </button>
            </div>
          )}

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
          {/* Tags */}
          <div className="bg-card border border-border rounded-lg p-4">
            <h3 className="font-semibold text-foreground mb-4">Tags</h3>
            <div className="flex flex-wrap gap-2">
              {content.tags.split(",").map((tag: string) => (
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
                  {(content.downloadCount || 0).toLocaleString()}
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
