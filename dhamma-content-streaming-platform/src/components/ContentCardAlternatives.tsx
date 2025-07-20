import Link from "next/link";
import Image from "next/image";
import type { DhammaContentWithRelations } from "@/types/database";
import {
  getDefaultCoverImage,
  getContentTypeConfig
} from "@/lib/content-images";
import { ContentTypeIcons, FeatureIcons } from "@/components/ui/icons";

interface ContentCardProps {
  content: DhammaContentWithRelations;
  variant?: "default" | "text-focused" | "compact" | "adaptive" | "list-style";
}

export function ContentCardAlternatives({
  content,
  variant = "default"
}: ContentCardProps) {
  const contentConfig = getContentTypeConfig(
    content.content_type as "video" | "audio" | "ebook" | "other"
  );
  const IconComponent = ContentTypeIcons[contentConfig.iconType];

  // Text-focused card design - no image area, emphasizes content information
  if (variant === "text-focused") {
    return (
      <Link href={`/content-item/${content.id}`} className="group">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow p-6 border border-orange-100 dark:border-gray-700 h-full">
          {/* Content type indicator */}
          <div className="flex items-center gap-2 mb-3">
            <IconComponent className="w-6 h-6 text-orange-600 dark:text-orange-400" />
            <span className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
              {content.content_type}
            </span>
          </div>

          {/* Title */}
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors line-clamp-2">
            {content.title}
          </h3>

          {/* Speaker */}
          {content.speaker?.name && (
            <p className="text-base text-gray-700 dark:text-gray-300 mb-3 font-medium flex items-center gap-1">
              <FeatureIcons.Meditation className="w-4 h-4" />
              by {content.speaker.name}
            </p>
          )}

          {/* Metadata */}
          <div className="flex flex-wrap gap-4 text-sm text-gray-500 dark:text-gray-400 mb-4">
            {content.duration_estimate && (
              <span className="flex items-center gap-1">
                <FeatureIcons.Clock className="w-4 h-4" />
                {Math.floor(content.duration_estimate / 60)}h{" "}
                {content.duration_estimate % 60}m
              </span>
            )}
            {content.language && (
              <span className="flex items-center gap-1">
                <FeatureIcons.Globe className="w-4 h-4" />
                {content.language}
              </span>
            )}
            {content.date_recorded && (
              <span className="flex items-center gap-1">
                <FeatureIcons.Calendar className="w-4 h-4" />
                {new Date(content.date_recorded).getFullYear()}
              </span>
            )}
          </div>

          {/* Action */}
          <div className="text-orange-600 dark:text-orange-400 text-sm font-medium group-hover:underline flex items-center gap-1">
            {content.content_type === "video" && "Watch Video"}
            {content.content_type === "audio" && "Listen Now"}
            {content.content_type === "ebook" && "Read Book"}
            {content.content_type === "other" && "View Content"}
            <FeatureIcons.ArrowRight className="w-4 h-4" />
          </div>
        </div>
      </Link>
    );
  }

  // Compact horizontal layout
  if (variant === "compact") {
    return (
      <Link href={`/content-item/${content.id}`} className="group">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow p-4 border border-orange-100 dark:border-gray-700 h-full">
          <div className="flex gap-4">
            {/* Content type icon */}
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center">
                <IconComponent className="w-6 h-6 text-orange-600 dark:text-orange-400" />
              </div>
            </div>

            {/* Content details */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                  {content.content_type}
                </span>
                {content.duration_estimate && (
                  <span className="text-xs text-gray-400 dark:text-gray-500 flex items-center gap-1">
                    <FeatureIcons.Clock className="w-3 h-3" />
                    {Math.floor(content.duration_estimate / 60)}h{" "}
                    {content.duration_estimate % 60}m
                  </span>
                )}
              </div>

              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1 group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors line-clamp-1">
                {content.title}
              </h3>

              {content.speaker?.name && (
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-2 flex items-center gap-1">
                  <FeatureIcons.Meditation className="w-3 h-3" />
                  by {content.speaker.name}
                </p>
              )}

              <div className="text-orange-600 dark:text-orange-400 text-sm font-medium group-hover:underline flex items-center gap-1">
                {content.content_type === "video" && "Watch"}
                {content.content_type === "audio" && "Listen"}
                {content.content_type === "ebook" && "Read"}
                {content.content_type === "other" && "View"}
                <FeatureIcons.ArrowRight className="w-4 h-4" />
              </div>
            </div>
          </div>
        </div>
      </Link>
    );
  }

  // Adaptive layout - shows image if available, otherwise uses text-focused layout
  if (variant === "adaptive") {
    const hasRealThumbnail = false; // This would be determined by checking if actual thumbnail exists

    if (!hasRealThumbnail) {
      // Use text-focused layout when no real thumbnail
      return (
        <ContentCardAlternatives content={content} variant="text-focused" />
      );
    } else {
      // Use current image-based layout when thumbnail exists
      return <ContentCardAlternatives content={content} variant="default" />;
    }
  }

  // List-style card for dense information display
  if (variant === "list-style") {
    return (
      <Link href={`/content-item/${content.id}`} className="group">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-shadow p-4 border border-orange-100 dark:border-gray-700">
          <div className="flex items-start gap-3">
            {/* Content type indicator */}
            <div className="flex-shrink-0 w-8 h-8 bg-orange-100 dark:bg-orange-900/30 rounded-md flex items-center justify-center mt-1">
              <IconComponent className="w-5 h-5 text-orange-600 dark:text-orange-400" />
            </div>

            {/* Content information */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-base font-semibold text-gray-900 dark:text-white group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors line-clamp-1">
                  {content.title}
                </h3>
              </div>

              <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-300 mb-1">
                {content.speaker?.name && (
                  <span className="flex items-center gap-1">
                    <FeatureIcons.Meditation className="w-3 h-3" />
                    by {content.speaker.name}
                  </span>
                )}
                {content.duration_estimate && (
                  <span className="flex items-center gap-1">
                    <FeatureIcons.Clock className="w-3 h-3" />
                    {Math.floor(content.duration_estimate / 60)}h{" "}
                    {content.duration_estimate % 60}m
                  </span>
                )}
                <span className="text-xs uppercase tracking-wide text-gray-400 dark:text-gray-500">
                  {content.content_type}
                </span>
              </div>
            </div>

            {/* Action indicator */}
            <div className="flex-shrink-0 text-orange-600 dark:text-orange-400 opacity-0 group-hover:opacity-100 transition-opacity">
              <FeatureIcons.ChevronRight className="w-5 h-5" />
            </div>
          </div>
        </div>
      </Link>
    );
  }

  // Default current implementation for comparison
  return (
    <Link href={`/content-item/${content.id}`} className="group">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow p-4 border border-orange-100 dark:border-gray-700 h-full">
        {/* Current image placeholder approach */}
        <div className="aspect-video bg-gray-200 dark:bg-gray-700 rounded mb-4 overflow-hidden">
          <Image
            src={getDefaultCoverImage(
              content.content_type as "video" | "audio" | "ebook" | "other"
            )}
            alt={`Cover for ${content.title}`}
            width={400}
            height={400}
            className="w-full h-full object-cover"
            unoptimized
          />
        </div>

        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors line-clamp-2">
            {content.title}
          </h3>

          {content.speaker?.name && (
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-2 flex items-center gap-1">
              <FeatureIcons.Meditation className="w-3 h-3" />
              by {content.speaker.name}
            </p>
          )}

          {content.duration_estimate && (
            <div className="text-xs text-gray-500 dark:text-gray-400 mb-2 flex items-center gap-1">
              <FeatureIcons.Clock className="w-3 h-3" />
              Duration: {Math.floor(content.duration_estimate / 60)}h{" "}
              {content.duration_estimate % 60}m
            </div>
          )}

          <div className="text-orange-600 dark:text-orange-400 text-sm font-medium group-hover:underline flex items-center gap-1">
            {content.content_type === "video" && "Watch Video"}
            {content.content_type === "audio" && "Listen Now"}
            {content.content_type === "ebook" && "Read Book"}
            {content.content_type === "other" && "View Content"}
            <FeatureIcons.ArrowRight className="w-4 h-4" />
          </div>
        </div>
      </div>
    </Link>
  );
}

export default ContentCardAlternatives;
