import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  User,
  Play,
  BookOpen,
  Clock,
  Download,
  Heart,
  Share
} from "lucide-react";
import { Button } from "@/components/common/Button";
import { Loading } from "@/components/common/Loading";
import { getSpeakerById, getContent } from "@/services/content";
import type { DhammaContent } from "@/types/content";
import { formatDuration } from "@/utils";
import { cn } from "@/utils";
import { usePlayerStore } from "@/store";

function ContentCard({ content }: { content: DhammaContent }) {
  const { dispatch, currentContent, isPlaying } = usePlayerStore();
  const isCurrentContent = currentContent?.id === content.id;

  const handlePlay = () => {
    dispatch({
      type: "PLAY",
      content,
      options: { autoplay: true }
    });
  };

  return (
    <div className="bg-card border border-border rounded-lg p-4 hover:shadow-lg transition-shadow">
      <div className="flex items-center justify-between mb-3">
        <span
          className={cn(
            "inline-flex items-center px-2 py-1 rounded-full text-xs font-medium",
            content.contentType === "sermon" &&
              "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
            content.contentType === "video" &&
              "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
            content.contentType === "ebook" &&
              "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
          )}
        >
          {content.contentType.toUpperCase()}
        </span>
      </div>
      <h3 className="font-semibold text-foreground mb-2 line-clamp-2">
        {content.title}
      </h3>
      <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
        {content.description}
      </p>
      <div className="flex items-center justify-between text-xs text-muted-foreground mb-4">
        <div className="flex items-center space-x-4">
          {content.contentType !== "ebook" && (
            <span className="flex items-center">
              <Clock className="h-3 w-3 mr-1" />
              {formatDuration(content.durationEstimate || 0)}
            </span>
          )}
          <span>{content.downloadCount} downloads</span>
          <span>★ {content.avgRating}</span>
        </div>
      </div>
      <div className="flex items-center space-x-2">
        {content.contentType !== "ebook" ? (
          <Button
            variant={isCurrentContent && isPlaying ? "secondary" : "player"}
            size="sm"
            onClick={handlePlay}
            className="flex-1"
          >
            <Play className="h-4 w-4 mr-2" />
            {isCurrentContent && isPlaying ? "Now Playing" : "Play"}
          </Button>
        ) : (
          <Button variant="player" size="sm" className="flex-1">
            <BookOpen className="h-4 w-4 mr-2" />
            Read PDF
          </Button>
        )}
        <Button variant="ghost" size="icon-sm">
          <Heart className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon-sm">
          <Download className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon-sm">
          <Share className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

export default function SpeakerPage() {
  const { speakerId } = useParams<{ speakerId: string }>();

  const { data: speaker, isLoading: speakerLoading } = useQuery({
    queryKey: ["speaker", speakerId],
    queryFn: () => getSpeakerById(speakerId!),
    enabled: !!speakerId
  });

  const { data: content, isLoading: contentLoading } = useQuery({
    queryKey: ["speaker-content", speakerId],
    queryFn: () =>
      getContent({
        speakers: [speakerId!]
      }),
    enabled: !!speakerId
  });

  if (speakerLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <Loading size="lg" message="Loading speaker profile..." />
      </div>
    );
  }

  if (!speaker) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-6 text-center">
        <h1 className="text-3xl font-bold text-foreground mb-4">
          Speaker Not Found
        </h1>
        <p className="text-muted-foreground">
          The speaker you are looking for does not exist.
        </p>
        <Link to="/browse">
          <Button className="mt-4">Browse All Content</Button>
        </Link>
      </div>
    );
  }

  const videos =
    content?.items.filter((item) => item.contentType === "video") || [];
  const audios =
    content?.items.filter((item) => item.contentType === "sermon") || [];
  const ebooks =
    content?.items.filter((item) => item.contentType === "ebook") || [];

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="flex items-center mb-6">
        <User className="h-16 w-16 text-muted-foreground mr-4" />
        <div>
          <h1 className="text-4xl font-bold text-foreground">{speaker.name}</h1>
          <p className="text-lg text-muted-foreground">
            {speaker.bio || "No biography available."}
          </p>
        </div>
      </div>

      {contentLoading ? (
        <Loading size="lg" message="Loading speaker's content..." />
      ) : (
        <div className="space-y-8">
          {videos.length > 0 && (
            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">
                Videos
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {videos.map((item: DhammaContent) => (
                  <ContentCard key={item.id} content={item} />
                ))}
              </div>
            </section>
          )}

          {audios.length > 0 && (
            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">
                Audios
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {audios.map((item: DhammaContent) => (
                  <ContentCard key={item.id} content={item} />
                ))}
              </div>
            </section>
          )}

          {ebooks.length > 0 && (
            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">
                E-books
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {ebooks.map((item: DhammaContent) => (
                  <ContentCard key={item.id} content={item} />
                ))}
              </div>
            </section>
          )}

          {videos.length === 0 &&
            audios.length === 0 &&
            ebooks.length === 0 && (
              <div className="text-center py-12">
                <p className="text-muted-foreground">
                  No content found for this speaker.
                </p>
              </div>
            )}
        </div>
      )}
    </div>
  );
}
