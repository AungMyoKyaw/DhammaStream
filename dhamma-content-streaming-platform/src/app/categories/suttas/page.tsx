import { createClient } from "@/lib/supabase/server";
import { ContentCard } from "@/components/content/content-card";
import { FileX } from "lucide-react";
import type { DhammaContent } from "@/lib/types";

export default async function SuttasCategoryPage() {
  let content: DhammaContent[] = [];
  let error: Error | null = null;

  try {
    const supabase = await createClient();
    const { data, error: fetchError } = await supabase
      .from("dhamma_content")
      .select(
        `
        *,
        speaker:speakers(id, name),
        category:categories(id, name)
      `
      )
      .or(`title.ilike.%sutta%,description.ilike.%sutta%`)
      .order("created_at", { ascending: false });

    content = data || [];
    error = fetchError;
  } catch (dbError) {
    console.warn("Database connection failed, using fallback data:", dbError);
    // Provide sample/fallback suttas content
    content = [
      {
        id: 103,
        title: "The Dhammacakkappavattana Sutta",
        description:
          "Original discourses of the Buddha - The Turning of the Wheel of Dhamma.",
        content_type: "audio",
        language: "English",
        file_url: "https://example.com/sutta.mp3",
        duration_estimate: 3600,
        created_at: new Date().toISOString(),
        speaker: {
          id: 103,
          name: "Sutta Scholar",
          created_at: new Date().toISOString()
        },
        category: { id: 103, name: "Suttas" }
      }
    ] as DhammaContent[];
  }

  if (error) {
    console.error("Error fetching suttas content:", error);
    return (
      <div className="container mx-auto py-8">
        <div className="text-center py-12">
          <FileX className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-semibold">
            Error loading suttas content
          </h3>
          <p className="text-muted-foreground">Please try again later.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Suttas</h1>
        <p className="text-muted-foreground mt-2">
          Original discourses of the Buddha
        </p>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Found {content.length} sutta{content.length === 1 ? "" : "s"}
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
