import Link from "next/link";
import type { DhammaContentWithRelations } from "@/types/database";
import { getContentTypeConfig } from "@/lib/content-images";

interface CompactContentCardProps {
  content: DhammaContentWithRelations;
}

export function CompactContentCard({ content }: CompactContentCardProps) {
  const contentConfig = getContentTypeConfig(
    content.content_type as "video" | "audio" | "ebook" | "other"
  );

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

            <h3 className="text-lg font-semibold text-gray-900 mb-1 group-hover:text-orange-600 transition-colors line-clamp-2">
              {content.title}
            </h3>

            {content.speaker?.name && (
              <p className="text-sm text-gray-600 mb-2">
                by {content.speaker.name}
              </p>
            )}

            {/* Description - show on larger screens */}
            {content.description && (
              <p className="text-sm text-gray-600 line-clamp-2 mb-2 hidden sm:block">
                {content.description}
              </p>
            )}

            {/* Additional metadata */}
            <div className="flex flex-wrap gap-3 text-xs text-gray-500 mb-2">
              {content.language && <span>🌐 {content.language}</span>}
              {content.date_recorded && (
                <span>📅 {new Date(content.date_recorded).getFullYear()}</span>
              )}
            </div>

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

export default CompactContentCard;
