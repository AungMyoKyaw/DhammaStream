import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ContentPlayer } from "@/components/content/content-player";
import { ContentRecommendations } from "@/components/content/content-recommendations";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, FileText, Download, User } from "lucide-react";
import Link from "next/link";
import type { DhammaContent } from "@/lib/types";

interface ContentPageProps {
  readonly params: Promise<{
    readonly id: string;
  }>;
}

export default async function ContentPage({ params }: ContentPageProps) {
  const { id } = await params;
  let content: DhammaContent | null = null;
  let error: Error | null = null;

  try {
    const supabase = await createClient();

    const { data, error: fetchError } = await supabase
      .from("dhamma_content")
      .select(
        `
        *,
        speaker:speakers(id, name, bio, photo_url),
        category:categories(id, name)
      `
      )
      .eq("id", id)
      .single();

    content = data as DhammaContent;
    error = fetchError;
  } catch (dbError) {
    console.warn(
      "Database connection failed, providing fallback content:",
      dbError
    );

    // Provide fallback content based on the ID
    if (id === "19630") {
      content = {
        id: 19630,
        title: "Sample Dhamma Talk: The Four Noble Truths",
        description:
          "An introduction to the fundamental teachings of Buddhism. This content demonstrates auto-play and resume functionality.",
        content_type: "audio",
        language: "English",
        file_url: "https://www.soundjay.com/misc/sounds/bell-ringing-05.wav", // Sample audio file
        duration_estimate: 3600,
        file_size_estimate: 52428800, // ~50MB
        date_recorded: "2024-01-15",
        created_at: new Date().toISOString(),
        speaker: {
          id: 1,
          name: "Sample Teacher",
          bio: "An experienced Buddhist teacher and practitioner.",
          created_at: new Date().toISOString()
        },
        category: { id: 1, name: "Core Teachings" },
        source_page: "https://example.com/source"
      } as DhammaContent;
    } else {
      content = {
        id: parseInt(id),
        title: `Sample Content ${id}`,
        description:
          "This is a sample content item for demonstration purposes.",
        content_type: "audio",
        language: "English",
        file_url: "https://www.soundjay.com/misc/sounds/bell-ringing-05.wav",
        duration_estimate: 1800,
        created_at: new Date().toISOString(),
        speaker: {
          id: 1,
          name: "Sample Teacher",
          created_at: new Date().toISOString()
        },
        category: { id: 1, name: "Sample Category" }
      } as DhammaContent;
    }
  }

  if (error && !content) {
    notFound();
  }

  if (!content) {
    notFound();
  }

  const typedContent = content;

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
    <div className="container mx-auto py-8">
      {/* Breadcrumb Navigation */}
      <div className="mb-6">
        <Breadcrumb
          items={[
            {
              label: "Browse Content",
              href: "/content"
            },
            {
              label: typedContent.category?.name || "Content",
              href: typedContent.category
                ? `/categories/${typedContent.category.name.toLowerCase()}`
                : "/content"
            },
            {
              label: typedContent.title,
              current: true
            }
          ]}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Player */}
          <ContentPlayer content={typedContent} />

          {/* Content Info */}
          <Card>
            <CardHeader>
              <div className="flex flex-wrap items-center gap-2 mb-4">
                <Badge variant="secondary" className="capitalize">
                  {typedContent.content_type}
                </Badge>
                <Badge variant="outline">{typedContent.language}</Badge>
                {typedContent.category && (
                  <Badge variant="outline">{typedContent.category.name}</Badge>
                )}
              </div>

              <CardTitle className="text-2xl">{typedContent.title}</CardTitle>

              {typedContent.description && (
                <CardDescription className="text-base">
                  {typedContent.description}
                </CardDescription>
              )}
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Speaker Info */}
              {typedContent.speaker && (
                <div className="flex items-center space-x-4 p-4 bg-muted/50 rounded-lg">
                  <Avatar className="h-12 w-12">
                    {typedContent.speaker.photo_url ? (
                      <AvatarImage
                        src={typedContent.speaker.photo_url}
                        alt={typedContent.speaker.name}
                      />
                    ) : (
                      <AvatarFallback>
                        {typedContent.speaker.name.charAt(0)}
                      </AvatarFallback>
                    )}
                  </Avatar>
                  <div className="flex-1">
                    <h3 className="font-semibold">
                      <Link
                        href={`/speakers/${typedContent.speaker.id}`}
                        className="hover:text-primary transition-colors"
                      >
                        {typedContent.speaker.name}
                      </Link>
                    </h3>
                    {typedContent.speaker.bio && (
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {typedContent.speaker.bio}
                      </p>
                    )}
                  </div>
                  <Button asChild variant="outline" size="sm">
                    <Link href={`/speakers/${typedContent.speaker.id}`}>
                      <User className="h-4 w-4 mr-2" />
                      View Profile
                    </Link>
                  </Button>
                </div>
              )}

              {/* Metadata */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                {typedContent.duration_estimate && (
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span>
                      {formatDuration(typedContent.duration_estimate)}
                    </span>
                  </div>
                )}

                {typedContent.file_size_estimate && (
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <span>
                      {formatFileSize(typedContent.file_size_estimate)}
                    </span>
                  </div>
                )}

                {typedContent.date_recorded && (
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>{formatDate(typedContent.date_recorded)}</span>
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <Button asChild variant="outline" size="sm">
                    <a
                      href={typedContent.file_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      download
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </a>
                  </Button>
                </div>
              </div>

              {/* Source */}
              {typedContent.source_page && (
                <div className="pt-4 border-t">
                  <p className="text-sm text-muted-foreground">
                    Original source:{" "}
                    <a
                      href={typedContent.source_page}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      {new URL(typedContent.source_page).hostname}
                    </a>
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1">
          <ContentRecommendations
            speakerId={typedContent.speaker?.id}
            categoryId={typedContent.category?.id}
            currentContent={typedContent}
          />
        </div>
      </div>
    </div>
  );
}
