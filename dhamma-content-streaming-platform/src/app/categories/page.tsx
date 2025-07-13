import { createStaticClient } from "@/lib/supabase/static";
import { ContentCard } from "@/components/content/content-card";
import { FileX } from "lucide-react";
import type { DhammaContent } from "@/lib/types";

export default async function CategoriesPage() {
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
      .order("created_at", { ascending: false });

    content = data || [];
    error = fetchError;
  } catch (dbError) {
    console.warn("Database connection failed, using fallback data:", dbError);
    // Provide sample/fallback content when database is not available
    content = [
      {
        id: 1,
        title: "Sample Dhamma Talk: The Four Noble Truths",
        description:
          "An introduction to the fundamental teachings of Buddhism.",
        content_type: "audio",
        language: "English",
        file_url: "https://example.com/sample-audio.mp3",
        duration_estimate: 3600,
        created_at: new Date().toISOString(),
        speaker: {
          id: 1,
          name: "Sample Teacher",
          created_at: new Date().toISOString()
        },
        category: { id: 1, name: "Core Teachings" }
      }
    ] as DhammaContent[];
  }

  if (error) {
    console.error("Error fetching content:", error);
    return (
      <div className="container mx-auto py-8">
        <div className="text-center py-12">
          <FileX className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-semibold">Error loading content</h3>
          <p className="text-muted-foreground">Please try again later.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10">
      <div className="mb-10 text-center">
        <h1 className="text-4xl font-extrabold tracking-tight text-primary mb-2">
          All Categories
        </h1>
        <p className="text-muted-foreground text-lg">
          Explore content organized by topics and themes
        </p>
      </div>

      <div className="flex items-center justify-between mb-6">
        <p className="text-sm text-muted-foreground">
          Found {content.length} result{content.length === 1 ? "" : "s"}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {content.map((item) => (
          <div key={item.id} className="group">
            <ContentCard content={item} />
          </div>
        ))}
      </div>
    </div>
  );
}
