import { createClient } from "@/lib/supabase/server";
import { ContentCard } from "@/components/content/content-card";
import { FileX } from "lucide-react";
import type { DhammaContent } from "@/lib/types";

export default async function AbhidhammaCategoryPage() {
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
      .or(`title.ilike.%abhidhamma%,description.ilike.%abhidhamma%`)
      .order("created_at", { ascending: false });

    content = data || [];
    error = fetchError;
  } catch (dbError) {
    console.warn("Database connection failed, using fallback data:", dbError);
    // Provide sample/fallback abhidhamma content
    content = [
      {
        id: 101,
        title: "Introduction to Abhidhamma",
        description: "Systematic philosophy and psychology of Buddhism.",
        content_type: "audio",
        language: "English",
        file_url: "https://example.com/abhidhamma.mp3",
        duration_estimate: 4800,
        created_at: new Date().toISOString(),
        speaker: {
          id: 101,
          name: "Abhidhamma Scholar",
          created_at: new Date().toISOString()
        },
        category: { id: 101, name: "Abhidhamma" }
      }
    ] as DhammaContent[];
  }

  if (error) {
    console.error("Error fetching abhidhamma content:", error);
    return (
      <div className="container mx-auto py-8">
        <div className="text-center py-12">
          <FileX className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-semibold">
            Error loading abhidhamma content
          </h3>
          <p className="text-muted-foreground">Please try again later.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Abhidhamma</h1>
        <p className="text-muted-foreground mt-2">
          Systematic philosophy and psychology of Buddhism
        </p>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Found {content.length} teaching{content.length === 1 ? "" : "s"}
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
