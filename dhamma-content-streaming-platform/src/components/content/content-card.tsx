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
    <Card className="group rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 hover:scale-[1.02] bg-card/90 border border-border/50 hover:border-border backdrop-blur-sm overflow-hidden">
      <CardContent className="p-6 relative">
        {/* Subtle gradient overlay for depth */}
        <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-background/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        <div className="flex gap-4 relative z-10">
          {/* Enhanced Content Type Icon */}
          <div className="flex-shrink-0">
            <div
              className={`w-16 h-16 rounded-2xl flex items-center justify-center ${getContentTypeColor(content.content_type)} shadow-lg transition-all duration-300 group-hover:scale-105 group-hover:rotate-2 relative overflow-hidden`}
            >
              {/* Icon background glow */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-50" />
              <div className="relative z-10">
                {getContentTypeIcon(content.content_type)}
              </div>
            </div>
          </div>

          {/* Enhanced Content Details */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <CardHeader className="p-0">
                  <div className="flex items-center gap-2 mb-3">
                    <Badge
                      variant="secondary"
                      className="capitalize bg-primary/10 text-primary border-primary/20 hover:bg-primary/20 transition-colors"
                    >
                      {content.content_type}
                    </Badge>
                    <Badge
                      variant="outline"
                      className="bg-background/50 hover:bg-muted transition-colors"
                    >
                      {content.language}
                    </Badge>
                    {content.category && (
                      <Badge
                        variant="outline"
                        className="bg-background/50 hover:bg-muted transition-colors"
                      >
                        {content.category.name}
                      </Badge>
                    )}
                  </div>

                  <CardTitle className="text-lg leading-tight group-hover:text-primary transition-colors duration-200">
                    <Link
                      href={`/content/${content.id}`}
                      className="font-semibold hover:underline decoration-2 underline-offset-2"
                    >
                      {content.title}
                    </Link>
                  </CardTitle>

                  {content.description && (
                    <CardDescription className="line-clamp-2 mt-2 text-muted-foreground/80 group-hover:text-muted-foreground transition-colors">
                      {content.description}
                    </CardDescription>
                  )}
                </CardHeader>

                {/* Enhanced Speaker Info */}
                {content.speaker && (
                  <div className="flex items-center gap-2 mt-4">
                    <Avatar className="h-7 w-7 border-2 border-background shadow-sm transition-transform group-hover:scale-105">
                      <AvatarFallback className="text-xs font-medium bg-gradient-to-br from-primary/20 to-primary/10 text-primary">
                        {content.speaker.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <Link
                      href={`/speakers/${content.speaker.id}`}
                      className="text-sm text-muted-foreground hover:text-primary transition-colors font-medium"
                    >
                      {content.speaker.name}
                    </Link>
                  </div>
                )}

                {/* Enhanced Metadata */}
                <div className="flex flex-wrap items-center gap-4 mt-4 text-xs text-muted-foreground/70">
                  {content.duration_estimate && (
                    <div className="flex items-center gap-1.5 bg-background/50 px-2 py-1 rounded-lg transition-colors hover:bg-muted/50">
                      <Clock className="h-3 w-3" />
                      <span className="font-medium">
                        {formatDuration(content.duration_estimate)}
                      </span>
                    </div>
                  )}

                  {content.file_size_estimate && (
                    <div className="flex items-center gap-1.5 bg-background/50 px-2 py-1 rounded-lg transition-colors hover:bg-muted/50">
                      <FileText className="h-3 w-3" />
                      <span className="font-medium">
                        {formatFileSize(content.file_size_estimate)}
                      </span>
                    </div>
                  )}

                  {content.date_recorded && (
                    <div className="flex items-center gap-1.5 bg-background/50 px-2 py-1 rounded-lg transition-colors hover:bg-muted/50">
                      <Calendar className="h-3 w-3" />
                      <span className="font-medium">
                        {formatDate(content.date_recorded)}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Enhanced Action Button */}
              <div className="flex-shrink-0 flex flex-col gap-2">
                <Button
                  asChild
                  size="sm"
                  className="rounded-xl shadow-md transition-all duration-200 hover:shadow-lg hover:scale-105 focus:scale-95 bg-primary hover:bg-primary/90 active:scale-95 min-w-[4rem]"
                >
                  <Link href={`/content/${content.id}`}>
                    <Play className="h-3.5 w-3.5 mr-1.5" />
                    <span className="font-medium">
                      {content.content_type === "ebook" ? "Read" : "Play"}
                    </span>
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
