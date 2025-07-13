import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import Link from "next/link";
import { Play, Clock } from "lucide-react";
import type { DhammaContent } from "@/lib/types";

interface RelatedContentProps {
  readonly contentId: number;
  readonly speakerId?: number;
  readonly categoryId?: number;
}

export async function RelatedContent({
  contentId,
  speakerId,
  categoryId
}: RelatedContentProps) {
  const supabase = await createClient();

  // Get related content by speaker first, then by category
  let query = supabase
    .from("dhamma_content")
    .select(
      `
      *,
      speaker:speakers(id, name),
      category:categories(id, name)
    `
    )
    .neq("id", contentId)
    .limit(5);

  if (speakerId) {
    query = query.eq("speaker_id", speakerId);
  } else if (categoryId) {
    query = query.eq("category_id", categoryId);
  }

  const { data: related } = await query;

  if (!related || related.length === 0) {
    // Fallback to latest content if no related content found
    const { data: latest } = await supabase
      .from("dhamma_content")
      .select(
        `
        *,
        speaker:speakers(id, name),
        category:categories(id, name)
      `
      )
      .neq("id", contentId)
      .order("created_at", { ascending: false })
      .limit(5);

    if (!latest || latest.length === 0) {
      return null;
    }

    return (
      <RelatedContentList
        content={latest as DhammaContent[]}
        title="Recent Content"
      />
    );
  }

  const title = speakerId ? "More from this Speaker" : "Related Content";
  return (
    <RelatedContentList content={related as DhammaContent[]} title={title} />
  );
}

function RelatedContentList({
  content,
  title
}: {
  readonly content: DhammaContent[];
  readonly title: string;
}) {
  const formatDuration = (seconds?: number) => {
    if (!seconds) return null;
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {content.map((item) => (
          <div key={item.id} className="group">
            <Link href={`/content/${item.id}`} className="block space-y-2">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <Play className="h-4 w-4 text-primary" />
                </div>

                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-medium line-clamp-2 group-hover:text-primary transition-colors">
                    {item.title}
                  </h4>

                  <div className="flex items-center space-x-2 mt-1">
                    <Badge variant="secondary" className="text-xs">
                      {item.content_type}
                    </Badge>

                    {item.duration_estimate && (
                      <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        <span>{formatDuration(item.duration_estimate)}</span>
                      </div>
                    )}
                  </div>

                  {item.speaker && (
                    <div className="flex items-center space-x-2 mt-2">
                      <Avatar className="h-4 w-4">
                        <AvatarFallback className="text-xs">
                          {item.speaker.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-xs text-muted-foreground truncate">
                        {item.speaker.name}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </Link>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
