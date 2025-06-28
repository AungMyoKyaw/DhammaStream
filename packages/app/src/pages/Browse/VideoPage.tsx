import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { User, Play, Clock } from "lucide-react";
import { Button } from "@/components/common/Button";
import { Loading } from "@/components/common/Loading";
import { getSpeakers, getContentBySpeaker } from "@/services/content";
import type { DhammaContent, Speaker } from "@/types/content";
import { formatDuration } from "@/utils";
import { usePlayerStore } from "@/store";

function SpeakerCard({
  speaker,
  onClick
}: {
  speaker: Speaker;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="bg-card border border-border rounded-lg p-4 hover:shadow-lg transition-shadow text-center cursor-pointer w-full"
    >
      <User className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
      <h3 className="font-semibold text-foreground">{speaker.name}</h3>
    </button>
  );
}

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
      <h3 className="font-semibold text-foreground mb-2 line-clamp-2">
        {content.title}
      </h3>
      <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
        {content.description}
      </p>
      <div className="flex items-center justify-between text-xs text-muted-foreground mb-4">
        <div className="flex items-center space-x-4">
          <span className="flex items-center">
            <Clock className="h-3 w-3 mr-1" />
            {formatDuration(content.durationEstimate || 0)}
          </span>
          <span>{content.downloadCount} downloads</span>
          <span>★ {content.avgRating}</span>
        </div>
      </div>
      <div className="flex items-center space-x-2">
        <Button
          variant={isCurrentContent && isPlaying ? "secondary" : "player"}
          size="sm"
          onClick={handlePlay}
          className="flex-1"
        >
          <Play className="h-4 w-4 mr-2" />
          {isCurrentContent && isPlaying ? "Now Playing" : "Play"}
        </Button>
      </div>
    </div>
  );
}

export default function VideoPage() {
  const [selectedSpeaker, setSelectedSpeaker] = useState<Speaker | null>(null);

  const {
    data: speakers,
    isLoading: speakersLoading,
    error: speakersError,
    isError: speakersIsError
  } = useQuery({
    queryKey: ["speakers", "video"],
    queryFn: () => getSpeakers("video"),
    retry: 3
  });

  const { data: content, isLoading: contentLoading } = useQuery({
    queryKey: ["content", "video", selectedSpeaker?.name],
    queryFn: () => getContentBySpeaker(selectedSpeaker?.name || "", "video"),
    enabled: !!selectedSpeaker,
    retry: 3
  });

  if (speakersLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <Loading size="lg" message="Loading speakers..." />
      </div>
    );
  }

  if (speakersIsError) {
    console.error("Error loading speakers:", speakersError);
    return (
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-foreground mb-4">
            Unable to Load Speakers
          </h2>
          <p className="text-muted-foreground mb-6">
            We're having trouble loading the speaker information.
          </p>
          <Button onClick={() => window.location.reload()} variant="outline">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  if (selectedSpeaker) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-6">
        <Button onClick={() => setSelectedSpeaker(null)} className="mb-4">
          &larr; Back to Speakers
        </Button>
        <h1 className="text-3xl font-bold text-foreground mb-4">
          Videos by {selectedSpeaker.name}
        </h1>
        {contentLoading ? (
          <Loading size="lg" message="Loading videos..." />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {content && content.length > 0 ? (
              content.map((item: DhammaContent) => (
                <ContentCard key={item.id} content={item} />
              ))
            ) : (
              <div className="col-span-full text-center py-8">
                <p className="text-muted-foreground">
                  No videos found for {selectedSpeaker.name}.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <h1 className="text-3xl font-bold text-foreground mb-4">
        Video Speakers
      </h1>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {speakers && speakers.length > 0 ? (
          speakers.map((speaker) => (
            <SpeakerCard
              key={speaker.id}
              speaker={speaker}
              onClick={() => setSelectedSpeaker(speaker)}
            />
          ))
        ) : (
          <div className="col-span-full text-center py-8">
            <p className="text-muted-foreground">
              No speakers found. Please check back later.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
