"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ContentCardSkeleton } from "@/components/content/content-loading";
import {
  Play,
  Clock,
  User,
  ThumbsUp,
  TrendingUp,
  Sparkles,
  RefreshCw
} from "lucide-react";
import Link from "next/link";
import type { DhammaContent } from "@/lib/types";

interface ContentRecommendationsProps {
  speakerId?: number;
  categoryId?: number;
  currentContent?: DhammaContent;
}

interface RecommendationSection {
  title: string;
  description: string;
  icon: React.ReactNode;
  items: DhammaContent[];
  type: "trending" | "similar" | "speaker" | "category" | "featured";
}

export function ContentRecommendations({
  speakerId,
  categoryId,
  currentContent
}: ContentRecommendationsProps) {
  const [sections, setSections] = useState<RecommendationSection[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeSection, setActiveSection] = useState(0);

  const generateMockContent = useCallback(
    (count: number, type: string): DhammaContent[] => {
      return Array.from({ length: count }, (_, i) => ({
        id: Math.floor(Math.random() * 10000),
        title: `${type.charAt(0).toUpperCase() + type.slice(1)} Content ${i + 1}`,
        description:
          "A wonderful teaching that will inspire your practice and deepen your understanding.",
        content_type: ["audio", "video", "ebook"][
          Math.floor(Math.random() * 3)
        ] as "audio" | "video" | "ebook",
        language: "English",
        file_url: "https://example.com/content",
        duration_estimate: Math.floor(Math.random() * 3600) + 600,
        created_at: new Date().toISOString(),
        speaker: {
          id: Math.floor(Math.random() * 100),
          name: `Teacher ${i + 1}`,
          created_at: new Date().toISOString()
        },
        category: {
          id: Math.floor(Math.random() * 10),
          name: ["Meditation", "Philosophy", "Practice", "History"][
            Math.floor(Math.random() * 4)
          ]
        }
      }));
    },
    []
  );

  const loadRecommendations = useCallback(async () => {
    setIsLoading(true);

    try {
      // Mock recommendations - in real app, fetch from API based on user behavior
      const mockSections: RecommendationSection[] = [];

      // Featured content (always show)
      mockSections.push({
        title: "Editor's Picks",
        description: "Carefully selected content for spiritual growth",
        icon: <Sparkles className="h-5 w-5" />,
        type: "featured",
        items: generateMockContent(3, "featured")
      });

      // Trending content
      mockSections.push({
        title: "Trending Now",
        description: "Popular content among the community",
        icon: <TrendingUp className="h-5 w-5" />,
        type: "trending",
        items: generateMockContent(4, "trending")
      });

      // Similar content (if we have current content)
      if (currentContent) {
        mockSections.push({
          title: "More Like This",
          description: `Similar to "${currentContent.title}"`,
          icon: <ThumbsUp className="h-5 w-5" />,
          type: "similar",
          items: generateMockContent(3, "similar")
        });
      }

      // Speaker's other content
      if (speakerId && currentContent?.speaker) {
        mockSections.push({
          title: `More from ${currentContent.speaker.name}`,
          description: "Other teachings from this speaker",
          icon: <User className="h-5 w-5" />,
          type: "speaker",
          items: generateMockContent(4, "speaker")
        });
      }

      // Category content
      if (categoryId && currentContent?.category) {
        mockSections.push({
          title: `More in ${currentContent.category.name}`,
          description: "Explore this category further",
          icon: <Play className="h-5 w-5" />,
          type: "category",
          items: generateMockContent(3, "category")
        });
      }

      setSections(mockSections);
    } catch (error) {
      console.error("Failed to load recommendations:", error);
    } finally {
      setIsLoading(false);
    }
  }, [speakerId, categoryId, currentContent, generateMockContent]);

  useEffect(() => {
    loadRecommendations();
  }, [loadRecommendations]);

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const refreshRecommendations = () => {
    loadRecommendations();
  };

  if (isLoading) {
    return (
      <div className="space-y-8">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardHeader>
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 bg-muted rounded animate-pulse" />
                <div className="w-32 h-6 bg-muted rounded animate-pulse" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {[1, 2, 3].map((j) => (
                  <ContentCardSkeleton key={j} />
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (sections.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground">
            No recommendations available at this time.
          </p>
          <Button
            variant="outline"
            onClick={refreshRecommendations}
            className="mt-4"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-8">
      {/* Section Navigation */}
      {sections.length > 1 && (
        <div className="flex flex-wrap gap-2">
          {sections.map((section, index) => (
            <Button
              key={section.title}
              variant={activeSection === index ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveSection(index)}
              className="gap-2"
            >
              {section.icon}
              {section.title}
            </Button>
          ))}
        </div>
      )}

      {/* Active Section */}
      {sections[activeSection] && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {sections[activeSection].icon}
                <div>
                  <CardTitle>{sections[activeSection].title}</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    {sections[activeSection].description}
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={refreshRecommendations}
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              {sections[activeSection].items.map((item) => (
                <div
                  key={item.id}
                  className="flex gap-4 p-4 rounded-lg border hover:bg-muted/50 transition-colors"
                >
                  <div className="flex-shrink-0">
                    <div className="w-16 h-16 bg-muted rounded-xl flex items-center justify-center">
                      <Play className="h-6 w-6 text-muted-foreground" />
                    </div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="secondary" className="text-xs">
                            {item.content_type}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {item.language}
                          </Badge>
                        </div>

                        <h4 className="font-semibold text-sm line-clamp-2 mb-1">
                          {item.title}
                        </h4>

                        <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                          {item.description}
                        </p>

                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          {item.speaker && (
                            <span className="flex items-center gap-1">
                              <User className="h-3 w-3" />
                              {item.speaker.name}
                            </span>
                          )}
                          {item.duration_estimate && (
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {formatDuration(item.duration_estimate)}
                            </span>
                          )}
                        </div>
                      </div>

                      <Button size="sm" asChild>
                        <Link href={`/content/${item.id}`}>
                          <Play className="h-4 w-4" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {sections[activeSection].items.length > 3 && (
              <div className="pt-4 text-center">
                <Button variant="outline" asChild>
                  <Link
                    href={`/content?category=${categoryId || ""}&speaker=${speakerId || ""}`}
                  >
                    View All
                  </Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
