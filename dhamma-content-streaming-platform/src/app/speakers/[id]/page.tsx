import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ContentCard } from "@/components/content/content-card";
import type { Speaker, DhammaContent } from "@/lib/types";

interface SpeakerPageProps {
  readonly params: Promise<{
    readonly id: string;
  }>;
}

export default async function SpeakerPage({ params }: SpeakerPageProps) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: speaker, error: speakerError } = await supabase
    .from("speakers")
    .select("*")
    .eq("id", id)
    .single();

  if (speakerError || !speaker) {
    notFound();
  }

  const { data: content, error: contentError } = await supabase
    .from("dhamma_content")
    .select(
      `
      *,
      speaker:speakers(id, name),
      category:categories(id, name)
    `
    )
    .eq("speaker_id", id)
    .order("created_at", { ascending: false });

  const typedSpeaker = speaker as Speaker;
  const typedContent = (content || []) as DhammaContent[];

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .slice(0, 2)
      .map((word) => word.charAt(0))
      .join("")
      .toUpperCase();
  };

  return (
    <div className="container mx-auto py-8">
      {/* Speaker Profile */}
      <Card className="mb-8">
        <CardContent className="p-8">
          <div className="flex flex-col md:flex-row items-start space-y-6 md:space-y-0 md:space-x-8">
            <Avatar className="h-32 w-32 mx-auto md:mx-0">
              {typedSpeaker.photo_url ? (
                <AvatarImage
                  src={typedSpeaker.photo_url}
                  alt={typedSpeaker.name}
                />
              ) : (
                <AvatarFallback className="text-2xl bg-primary/10">
                  {getInitials(typedSpeaker.name)}
                </AvatarFallback>
              )}
            </Avatar>

            <div className="flex-1 text-center md:text-left">
              <h1 className="text-3xl font-bold mb-4">{typedSpeaker.name}</h1>

              {typedSpeaker.bio && (
                <p className="text-muted-foreground text-lg leading-relaxed mb-6">
                  {typedSpeaker.bio}
                </p>
              )}

              <div className="flex flex-col sm:flex-row items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center space-x-2">
                  <span className="font-medium">{typedContent.length}</span>
                  <span>teaching{typedContent.length === 1 ? "" : "s"}</span>
                </div>

                {typedContent.length > 0 && (
                  <>
                    <div className="hidden sm:block">•</div>
                    <div className="flex items-center space-x-2">
                      <span>Content types:</span>
                      <span className="font-medium">
                        {Array.from(
                          new Set(typedContent.map((c) => c.content_type))
                        ).join(", ")}
                      </span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Content List */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">
            Teachings by {typedSpeaker.name}
          </h2>
        </div>

        {contentError && (
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-muted-foreground">
                Error loading content. Please try again later.
              </p>
            </CardContent>
          </Card>
        )}

        {!contentError && typedContent.length === 0 && (
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-muted-foreground">
                No content available from this speaker yet.
              </p>
            </CardContent>
          </Card>
        )}

        {!contentError && typedContent.length > 0 && (
          <div className="space-y-4">
            {typedContent.map((item) => (
              <ContentCard key={item.id} content={item} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
