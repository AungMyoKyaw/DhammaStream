"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { FeatureIcons, ContentTypeIcons } from "@/components/ui/icons";
import type { DhammaContentWithRelations } from "@/types/database";
import DefaultMediaCover from "@/components/DefaultMediaCover";

interface ContentRecommendationsProps {
  currentContent?: DhammaContentWithRelations;
  contentType?: "video" | "audio" | "ebook" | "other";
  speakerId?: number;
  categoryId?: number;
  className?: string;
}

export default function ContentRecommendations({
  currentContent,
  contentType,
  speakerId,
  categoryId,
  className = ""
}: ContentRecommendationsProps) {
  const [recommendations, setRecommendations] = useState<DhammaContentWithRelations[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        setLoading(true);
        setError(null);

        // For now, we'll create a simple recommendation logic
        // In a real implementation, this would use machine learning or collaborative filtering
        const params = new URLSearchParams();

        if (speakerId) params.append('speaker_id', speakerId.toString());
        if (categoryId) params.append('category_id', categoryId.toString());
        if (contentType) params.append('content_type', contentType);
        if (currentContent?.id) params.append('exclude_id', currentContent.id.toString());

        params.append('limit', '6');

        // Mock data for now - in real implementation, this would be an API call
        // For demonstration, we'll show some placeholder recommendations
        const mockRecommendations: DhammaContentWithRelations[] = [
          {
            id: 1,
            title: "Introduction to Mindfulness Meditation",
            content_type: "video" as const,
            file_url: "/mock-video-1.mp4",
            description: "A gentle introduction to mindfulness practice for beginners.",
            duration_estimate: 1800,
            language: "english",
            created_at: new Date().toISOString(),
            speaker_id: 1,
            category_id: 1,
            file_size_estimate: null,
            date_recorded: null,
            source_page: null,
            scraped_date: null,
            speaker: {
              id: 1,
              name: "Thich Nhat Hanh",
              bio: "Renowned Vietnamese Zen master and peace activist",
              photo_url: null,
              created_at: new Date().toISOString()
            },
            category: {
              id: 1,
              name: "Meditation"
            }
          },
          {
            id: 2,
            title: "Walking Meditation Practice",
            content_type: "audio" as const,
            file_url: "/mock-audio-1.mp3",
            description: "Learn the art of walking meditation for mindful movement.",
            duration_estimate: 1200,
            language: "english",
            created_at: new Date().toISOString(),
            speaker_id: 2,
            category_id: 1,
            file_size_estimate: null,
            date_recorded: null,
            source_page: null,
            scraped_date: null,
            speaker: {
              id: 2,
              name: "Ajahn Chah",
              bio: "Influential Thai Buddhist monk in the Theravada tradition",
              photo_url: null,
              created_at: new Date().toISOString()
            },
            category: {
              id: 1,
              name: "Meditation"
            }
          },
          {
            id: 3,
            title: "The Four Noble Truths",
            content_type: "ebook" as const,
            file_url: "/mock-ebook-1.pdf",
            description: "A comprehensive guide to the fundamental teachings of Buddhism.",
            duration_estimate: null,
            language: "english",
            created_at: new Date().toISOString(),
            speaker_id: 3,
            category_id: 2,
            file_size_estimate: null,
            date_recorded: null,
            source_page: null,
            scraped_date: null,
            speaker: {
              id: 3,
              name: "Joseph Goldstein",
              bio: "American Buddhist teacher and author",
              photo_url: null,
              created_at: new Date().toISOString()
            },
            category: {
              id: 2,
              name: "Dharma Teachings"
            }
          }
        ];

        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000));

        setRecommendations(mockRecommendations);
      } catch (err) {
        setError('Failed to load recommendations');
        console.error('Error fetching recommendations:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, [currentContent?.id, contentType, speakerId, categoryId]);

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const getContentIcon = (type: string) => {
    switch (type) {
      case 'video':
        return <ContentTypeIcons.Video className="w-4 h-4" />;
      case 'audio':
        return <ContentTypeIcons.Audio className="w-4 h-4" />;
      case 'ebook':
        return <ContentTypeIcons.Ebook className="w-4 h-4" />;
      default:
        return <ContentTypeIcons.Other className="w-4 h-4" />;
    }
  };

  if (loading) {
    // Generate stable keys for skeleton items
    const skeletonItems = Array.from({ length: 6 }, (_, index) => ({
      id: `skeleton-${index + 1}`
    }));

    return (
      <div className={`${className}`}>
        <div className="flex items-center space-x-2 mb-4">
          <FeatureIcons.Rocket className="w-5 h-5 text-orange-600 dark:text-orange-400" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Recommended for You
          </h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {skeletonItems.map((item) => (
            <div key={item.id} className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700 animate-pulse">
              <div className="aspect-video bg-gray-200 dark:bg-gray-700 rounded mb-3"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error || recommendations.length === 0) {
    return null;
  }

  return (
    <div className={`${className}`}>
      <div className="flex items-center space-x-2 mb-6">
        <FeatureIcons.Rocket className="w-5 h-5 text-orange-600 dark:text-orange-400" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Recommended for You
        </h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {recommendations.map((content) => (
          <Link
            key={content.id}
            href={`/content-item/${content.id}`}
            className="group bg-white dark:bg-gray-800 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all duration-200 hover:border-orange-200 dark:hover:border-orange-800"
          >
            <div className="aspect-video relative overflow-hidden bg-gray-100 dark:bg-gray-700">
              <DefaultMediaCover
                type={content.content_type === "ebook" || content.content_type === "other" ? "video" : content.content_type}
                title={content.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
              />
              <div className="absolute top-2 left-2">
                <span className="inline-flex items-center space-x-1 bg-black/75 text-white text-xs px-2 py-1 rounded">
                  {getContentIcon(content.content_type)}
                  <span className="capitalize">{content.content_type}</span>
                </span>
              </div>
              {content.duration_estimate && (
                <div className="absolute bottom-2 right-2">
                  <span className="bg-black/75 text-white text-xs px-2 py-1 rounded">
                    {formatDuration(content.duration_estimate)}
                  </span>
                </div>
              )}
            </div>

            <div className="p-4">
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2 group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">
                {content.title}
              </h4>

              {content.speaker && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  {content.speaker.name}
                </p>
              )}

              {content.description && (
                <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2">
                  {content.description}
                </p>
              )}

              <div className="flex items-center justify-between mt-3 text-xs text-gray-500 dark:text-gray-400">
                {content.category && (
                  <span className="inline-flex items-center px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded">
                    {content.category.name}
                  </span>
                )}
                {content.language && (
                  <span className="capitalize">{content.language}</span>
                )}
              </div>
            </div>
          </Link>
        ))}
      </div>

      <div className="text-center mt-6">
        <Link
          href="/browse/video"
          className="inline-flex items-center space-x-2 text-orange-600 hover:text-orange-700 dark:text-orange-400 dark:hover:text-orange-300 font-medium"
        >
          <span>Explore more content</span>
          <FeatureIcons.ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
