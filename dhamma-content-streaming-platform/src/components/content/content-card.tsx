import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Headphones,
  Video,
  FileText,
  Play,
  Clock,
  Calendar
} from "lucide-react";
import type { DhammaContent } from "@/lib/types";

interface ContentCardProps {
  readonly content: DhammaContent;
}

export function ContentCard({ content }: ContentCardProps) {
  const getContentTypeIcon = (type: string) => {
    switch (type) {
      case "audio":
        return <Headphones className="h-4 w-4" />;
      case "video":
        return <Video className="h-4 w-4" />;
      case "ebook":
        return <FileText className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const getContentTypeColor = (type: string) => {
    switch (type) {
      case "audio":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
      case "video":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
      case "ebook":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
    }
  };

  const formatDuration = (seconds?: number) => {
    if (!seconds) return null;
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return null;
    const mb = bytes / (1024 * 1024);
    if (mb > 1024) {
      return `${(mb / 1024).toFixed(1)} GB`;
    }
    return `${mb.toFixed(1)} MB`;
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return null;
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex gap-4">
          {/* Content Type Icon */}
          <div className="flex-shrink-0">
            <div
              className={`w-12 h-12 rounded-lg flex items-center justify-center ${getContentTypeColor(content.content_type)}`}
            >
              {getContentTypeIcon(content.content_type)}
            </div>
          </div>

          {/* Content Details */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <CardHeader className="p-0">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="secondary" className="capitalize">
                      {content.content_type}
                    </Badge>
                    <Badge variant="outline">{content.language}</Badge>
                    {content.category && (
                      <Badge variant="outline">{content.category.name}</Badge>
                    )}
                  </div>

                  <CardTitle className="text-lg leading-tight">
                    <Link
                      href={`/content/${content.id}`}
                      className="hover:text-primary transition-colors"
                    >
                      {content.title}
                    </Link>
                  </CardTitle>

                  {content.description && (
                    <CardDescription className="line-clamp-2 mt-2">
                      {content.description}
                    </CardDescription>
                  )}
                </CardHeader>

                {/* Speaker Info */}
                {content.speaker && (
                  <div className="flex items-center gap-2 mt-3">
                    <Avatar className="h-6 w-6">
                      <AvatarFallback className="text-xs">
                        {content.speaker.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <Link
                      href={`/speakers/${content.speaker.id}`}
                      className="text-sm text-muted-foreground hover:text-primary transition-colors"
                    >
                      {content.speaker.name}
                    </Link>
                  </div>
                )}

                {/* Metadata */}
                <div className="flex flex-wrap items-center gap-4 mt-3 text-xs text-muted-foreground">
                  {content.duration_estimate && (
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {formatDuration(content.duration_estimate)}
                    </div>
                  )}

                  {content.file_size_estimate && (
                    <div className="flex items-center gap-1">
                      <FileText className="h-3 w-3" />
                      {formatFileSize(content.file_size_estimate)}
                    </div>
                  )}

                  {content.date_recorded && (
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {formatDate(content.date_recorded)}
                    </div>
                  )}
                </div>
              </div>

              {/* Action Button */}
              <div className="flex-shrink-0">
                <Button asChild size="sm">
                  <Link href={`/content/${content.id}`}>
                    <Play className="h-3 w-3 mr-1" />
                    {content.content_type === "ebook" ? "Read" : "Play"}
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
