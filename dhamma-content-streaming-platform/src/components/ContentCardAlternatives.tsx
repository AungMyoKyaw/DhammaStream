import Link from "next/link";
import Image from "next/image";
import type { DhammaContentWithRelations } from "@/types/database";
import {
  getDefaultCoverImage,
  getContentTypeConfig
} from "@/lib/content-images";

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

  // Text-focused card design - no image area, emphasizes content information
  if (variant === "text-focused") {
    return (
      <Link href={`/content-item/${content.id}`} className="group">
        <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6 border border-orange-100 h-full">
          {/* Content type indicator */}
          <div className="flex items-center gap-2 mb-3">
            <span className="text-2xl">{contentConfig.icon}</span>
            <span className="text-sm font-medium text-gray-500 uppercase tracking-wide">
              {content.content_type}
            </span>
          </div>

          {/* Title */}
          <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-orange-600 transition-colors line-clamp-2">
            {content.title}
          </h3>

          {/* Speaker */}
          {content.speaker?.name && (
            <p className="text-base text-gray-700 mb-3 font-medium">
              by {content.speaker.name}
            </p>
          )}

          {/* Description */}
          {content.description && (
            <p className="text-gray-600 mb-4 line-clamp-3">
              {content.description}
            </p>
          )}

          {/* Metadata */}
          <div className="flex flex-wrap gap-4 text-sm text-gray-500 mb-4">
            {content.duration_estimate && (
              <span>
                ⏱️ {Math.floor(content.duration_estimate / 60)}h{" "}
                {content.duration_estimate % 60}m
              </span>
            )}
            {content.language && <span>🌐 {content.language}</span>}
            {content.date_recorded && (
              <span>📅 {new Date(content.date_recorded).getFullYear()}</span>
            )}
          </div>

          {/* Action */}
          <div className="text-orange-600 text-sm font-medium group-hover:underline">
            {content.content_type === "video" && "Watch Video"}
            {content.content_type === "audio" && "Listen Now"}
            {content.content_type === "ebook" && "Read Book"}
            {content.content_type === "other" && "View Content"}
            {" →"}
          </div>
        </div>
      </Link>
    );
  }

  // Compact horizontal layout
  if (variant === "compact") {
    return (
      <Link href={`/content-item/${content.id}`} className="group">
        <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-4 border border-orange-100 h-full">
          <div className="flex gap-4">
            {/* Content type icon */}
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">{contentConfig.icon}</span>
              </div>
            </div>

            {/* Content details */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                  {content.content_type}
                </span>
                {content.duration_estimate && (
                  <span className="text-xs text-gray-400">
                    {Math.floor(content.duration_estimate / 60)}h{" "}
                    {content.duration_estimate % 60}m
                  </span>
                )}
              </div>

              <h3 className="text-lg font-semibold text-gray-900 mb-1 group-hover:text-orange-600 transition-colors line-clamp-1">
                {content.title}
              </h3>

              {content.speaker?.name && (
                <p className="text-sm text-gray-600 mb-2">
                  by {content.speaker.name}
                </p>
              )}

              <div className="text-orange-600 text-sm font-medium group-hover:underline">
                {content.content_type === "video" && "Watch"}
                {content.content_type === "audio" && "Listen"}
                {content.content_type === "ebook" && "Read"}
                {content.content_type === "other" && "View"}
                {" →"}
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
        <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-4 border border-orange-100">
          <div className="flex items-start gap-3">
            {/* Content type indicator */}
            <div className="flex-shrink-0 w-8 h-8 bg-orange-100 rounded-md flex items-center justify-center mt-1">
              <span className="text-lg">{contentConfig.icon}</span>
            </div>

            {/* Content information */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-base font-semibold text-gray-900 group-hover:text-orange-600 transition-colors line-clamp-1">
                  {content.title}
                </h3>
              </div>

              <div className="flex items-center gap-4 text-sm text-gray-600 mb-1">
                {content.speaker?.name && (
                  <span>by {content.speaker.name}</span>
                )}
                {content.duration_estimate && (
                  <span>
                    {Math.floor(content.duration_estimate / 60)}h{" "}
                    {content.duration_estimate % 60}m
                  </span>
                )}
                <span className="text-xs uppercase tracking-wide text-gray-400">
                  {content.content_type}
                </span>
              </div>

              {content.description && (
                <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                  {content.description}
                </p>
              )}
            </div>

            {/* Action indicator */}
            <div className="flex-shrink-0 text-orange-600 opacity-0 group-hover:opacity-100 transition-opacity">
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </div>
          </div>
        </div>
      </Link>
    );
  }

  // Default current implementation for comparison
  return (
    <Link href={`/content-item/${content.id}`} className="group">
      <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-4 border border-orange-100 h-full">
        {/* Current image placeholder approach */}
        <div className="aspect-video bg-gray-200 rounded mb-4 overflow-hidden">
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
          <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-orange-600 transition-colors line-clamp-2">
            {content.title}
          </h3>

          {content.speaker?.name && (
            <p className="text-sm text-gray-600 mb-2">
              by {content.speaker.name}
            </p>
          )}

          {content.duration_estimate && (
            <div className="text-xs text-gray-500 mb-2">
              Duration: {Math.floor(content.duration_estimate / 60)}h{" "}
              {content.duration_estimate % 60}m
            </div>
          )}

          <div className="text-orange-600 text-sm font-medium group-hover:underline">
            {content.content_type === "video" && "Watch Video"}
            {content.content_type === "audio" && "Listen Now"}
            {content.content_type === "ebook" && "Read Book"}
            {content.content_type === "other" && "View Content"}
            {" →"}
          </div>
        </div>
      </div>
    </Link>
  );
}

export default ContentCardAlternatives;
