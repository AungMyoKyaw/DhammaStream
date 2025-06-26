import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Play, Heart, Download, Share, Clock, User } from "lucide-react";
import { Button } from "@/components/common/Button";
import { Loading } from "@/components/common/Loading";
import { usePlayerStore } from "@/store";
import type { DhammaContent } from "@/types/content";
import { formatDuration } from "@/utils";
import { cn } from "@/utils";
import { getRandomContent } from "@/services/content";
// Removed fallback mock data import

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
      {/* Content Type Badge */}
      <div className="flex items-center justify-between mb-3">
        <span
          className={cn(
            "inline-flex items-center px-2 py-1 rounded-full text-xs font-medium",
            content.contentType === "audio" &&
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

      {/* Content Info */}
      <h3 className="font-semibold text-foreground mb-2 line-clamp-2">
        {content.title}
      </h3>

      <p className="text-sm text-muted-foreground mb-3 flex items-center">
        <User className="h-4 w-4 mr-1" />
        {content.speaker || "Unknown Speaker"}
      </p>

      <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
        {content.description}
      </p>

      {/* Metadata */}
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

      {/* Actions */}
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

export default function HomePage() {
  // Use React Query for data fetching with fallback
  const { data: featuredContent = [], isLoading: featuredLoading } = useQuery({
    queryKey: ["random-content"],
    queryFn: () => getRandomContent(undefined, 6),
    staleTime: 5 * 60 * 1000 // 5 minutes
  });

  const [randomMonk] = useState(() => {
    const monks = [
      "Bhante Henepola Gunaratana",
      "Ajahn Chah",
      "Jack Kornfield",
      "Thich Nhat Hanh",
      "Ajahn Sumedho"
    ];
    return monks[Math.floor(Math.random() * monks.length)];
  });

  const isLoading = featuredLoading;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <Loading size="lg" message="Loading dharma content..." />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-8">
      {/* Welcome Section */}
      <section className="text-center py-8">
        <h1 className="text-4xl font-bold text-foreground mb-4">
          Welcome to DhammaStream
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Discover and stream thousands of dharma teachings, meditations, and
          wisdom content from renowned teachers around the world.
        </p>
      </section>

      {/* Random Monk Spotlight */}
      <section className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg p-6 text-white">
        <h2 className="text-2xl font-bold mb-2">Teacher Spotlight</h2>
        <p className="text-blue-100 mb-4">
          Featured teacher: <span className="font-semibold">{randomMonk}</span>
        </p>
        <Button variant="secondary" size="sm">
          Explore Teachings
        </Button>
      </section>

      {/* Featured Content */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-foreground">
            Recommended for You
          </h2>
          <Button variant="outline" size="sm">
            View All
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredContent.map((content) => (
            <ContentCard key={content.id} content={content} />
          ))}
        </div>
      </section>

      {/* Quick Access */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-card border border-border rounded-lg p-6 text-center">
          <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mx-auto mb-4">
            <Play className="h-6 w-6 text-blue-600 dark:text-blue-400" />
          </div>
          <h3 className="font-semibold text-foreground mb-2">
            Audio Teachings
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            Listen to dharma talks and guided meditations
          </p>
          <Link to="/browse?type=audio">
            <Button variant="outline" size="sm" className="w-full">
              Browse Audio
            </Button>
          </Link>
        </div>

        <div className="bg-card border border-border rounded-lg p-6 text-center">
          <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center mx-auto mb-4">
            <Play className="h-6 w-6 text-purple-600 dark:text-purple-400" />
          </div>
          <h3 className="font-semibold text-foreground mb-2">
            Video Teachings
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            Watch dharma talks and meditation instructions
          </p>
          <Link to="/browse?type=video">
            <Button variant="outline" size="sm" className="w-full">
              Browse Videos
            </Button>
          </Link>
        </div>

        <div className="bg-card border border-border rounded-lg p-6 text-center">
          <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center mx-auto mb-4">
            <Play className="h-6 w-6 text-green-600 dark:text-green-400" />
          </div>
          <h3 className="font-semibold text-foreground mb-2">E-books</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Read dharma texts and teachings
          </p>
          <Link to="/browse?type=ebook">
            <Button variant="outline" size="sm" className="w-full">
              Browse Books
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
