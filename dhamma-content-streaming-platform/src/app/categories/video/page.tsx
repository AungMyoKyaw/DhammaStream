import { createStaticClient } from "@/lib/supabase/static";
import { ContentCard } from "@/components/content/content-card";
import { FileX } from "lucide-react";
import type { DhammaContent } from "@/lib/types";

export default async function VideoCategoryPage() {
  let content: DhammaContent[] = [];
  let error: Error | null = null;

  try {
    const supabase = createStaticClient();
    const { data, error: fetchError } = await supabase
      .from("dhamma_content")
      .select(
        `
        *,
        speaker:speakers(id, name),
        category:categories(id, name)
      `
      )
      .eq("content_type", "video")
      .order("created_at", { ascending: false });

    content = data || [];
    error = fetchError;
  } catch (dbError) {
    console.warn("Database connection failed, using fallback data:", dbError);
    // Provide sample/fallback video content
    content = [
      {
        id: 2,
        title: "Sample Video Teaching",
        description: "A sample video teaching on meditation practices.",
        content_type: "video",
        language: "English",
        file_url: "https://example.com/sample-video.mp4",
        duration_estimate: 2400,
        created_at: new Date().toISOString(),
        speaker: {
          id: 2,
          name: "Video Teacher",
          created_at: new Date().toISOString()
        },
        category: { id: 2, name: "Video Teachings" }
      }
    ] as DhammaContent[];
  }

  if (error) {
    console.error("Error fetching video content:", error);
    return (
      <div className="container mx-auto py-8">
        <div className="text-center py-12">
          <FileX className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-semibold">
            Error loading video content
          </h3>
          <p className="text-muted-foreground">Please try again later.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Video Content</h1>
        <p className="text-muted-foreground mt-2">
          Video teachings and presentations for visual learning
        </p>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Found {content.length} video{content.length === 1 ? "" : "s"}
          </p>
        </div>

        <div className="space-y-4">
          {content.map((item) => (
            <ContentCard key={item.id} content={item} />
          ))}
        </div>
      </div>
    </div>
  );
}
