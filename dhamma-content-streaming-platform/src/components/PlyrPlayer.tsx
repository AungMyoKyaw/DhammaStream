"use client";

import {
  useEffect,
  useRef,
  useState,
  forwardRef,
  useImperativeHandle
} from "react";
import Plyr from "plyr";

export interface PlyrPlayerProps {
  src: string;
  type: "video" | "audio";
  width?: string;
  height?: string;
  onTimeUpdate?: (currentTime: number) => void;
  onSeeking?: (currentTime: number) => void;
  onReady?: (player: Plyr) => void;
  className?: string;
}

export interface PlyrPlayerRef {
  player: Plyr | null;
  currentTime: number;
  duration: number;
  seek: (time: number) => void;
  play: () => void;
  pause: () => void;
}

const PlyrPlayer = forwardRef<PlyrPlayerRef, PlyrPlayerProps>(
  (
    {
      src,
      type,
      width = "100%",
      height,
      onTimeUpdate,
      onSeeking,
      onReady,
      className
    },
    ref
  ) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const audioRef = useRef<HTMLAudioElement>(null);
    const playerRef = useRef<Plyr | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Expose player methods through ref
    useImperativeHandle(ref, () => ({
      player: playerRef.current,
      currentTime: playerRef.current?.currentTime || 0,
      duration: playerRef.current?.duration || 0,
      seek: (time: number) => {
        if (playerRef.current) {
          playerRef.current.currentTime = time;
        }
      },
      play: () => {
        if (playerRef.current) {
          playerRef.current.play();
        }
      },
      pause: () => {
        if (playerRef.current) {
          playerRef.current.pause();
        }
      }
    }));

    useEffect(() => {
      const mediaElement =
        type === "video" ? videoRef.current : audioRef.current;

      if (!mediaElement) return;

      // Initialize Plyr
      try {
        const player = new Plyr(mediaElement, {
          controls: [
            "play-large",
            "play",
            "progress",
            "current-time",
            "mute",
            "volume",
            "captions",
            "settings",
            "pip",
            "airplay",
            "fullscreen"
          ],
          settings: ["captions", "quality", "speed", "loop"],
          keyboard: { focused: true, global: false },
          tooltips: { controls: false, seek: true },
          hideControls: true,
          resetOnEnd: false,
          clickToPlay: true,
          disableContextMenu: true
        });

        playerRef.current = player;

        // Event listeners
        player.on("ready", () => {
          setIsLoading(false);
          onReady?.(player);
        });

        player.on("error", (event) => {
          console.error("Plyr error:", event);
          setError("Failed to load media");
          setIsLoading(false);
        });

        player.on("timeupdate", () => {
          const currentTime = player.currentTime;
          onTimeUpdate?.(currentTime);
        });

        player.on("seeking", () => {
          const currentTime = player.currentTime;
          onSeeking?.(currentTime);
        });

        player.on("loadstart", () => {
          setIsLoading(true);
          setError(null);
        });

        player.on("canplay", () => {
          setIsLoading(false);
        });

        // Cleanup function
        return () => {
          if (playerRef.current) {
            playerRef.current.destroy();
            playerRef.current = null;
          }
        };
      } catch (err) {
        console.error("Failed to initialize Plyr:", err);
        setError("Failed to initialize player");
        setIsLoading(false);
      }
    }, [type, onTimeUpdate, onSeeking, onReady]);

    // Update source when src changes
    useEffect(() => {
      if (playerRef.current && src) {
        playerRef.current.source = {
          type: type,
          sources: [
            {
              src: src,
              type: type === "video" ? "video/mp4" : "audio/mp3"
            }
          ]
        };
      }
    }, [src, type]);

    if (error) {
      return (
        <div
          className={`bg-gray-100 rounded-lg flex items-center justify-center ${className}`}
          style={{
            width,
            height: height || (type === "video" ? "400px" : "80px")
          }}
        >
          <div className="text-center text-gray-600">
            <span className="text-2xl mb-2 block">⚠️</span>
            <p>{error}</p>
          </div>
        </div>
      );
    }

    if (isLoading) {
      return (
        <div
          className={`bg-gray-200 rounded-lg flex items-center justify-center ${className}`}
          style={{
            width,
            height: height || (type === "video" ? "400px" : "80px")
          }}
        >
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto mb-2"></div>
            <p className="text-gray-600">Loading player...</p>
          </div>
        </div>
      );
    }

    return (
      <div
        className={className}
        style={{
          width,
          height: height || (type === "video" ? "400px" : "80px")
        }}
      >
        {type === "video" ? (
          <video
            ref={videoRef}
            className="plyr-react plyr"
            style={{ width: "100%", height: "100%" }}
            playsInline
            crossOrigin="anonymous"
          >
            <track kind="captions" />
          </video>
        ) : (
          <audio
            ref={audioRef}
            className="plyr-react plyr"
            style={{ width: "100%", height: "100%" }}
            crossOrigin="anonymous"
          >
            <track kind="captions" />
          </audio>
        )}
      </div>
    );
  }
);

PlyrPlayer.displayName = "PlyrPlayer";

export default PlyrPlayer;
