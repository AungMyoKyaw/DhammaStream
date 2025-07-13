import { createClient } from "@/lib/supabase/server";
import { ContentCard } from "./content-card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { FileX } from "lucide-react";
import type { DhammaContent, ContentFilters } from "@/lib/types";

interface ContentListProps {
  readonly searchParams: {
    readonly [key: string]: string | string[] | undefined;
  };
  readonly view?: "grid" | "list";
}

export async function ContentList({
  searchParams,
  view = "grid"
}: ContentListProps) {
  let content: DhammaContent[] = [];
  let error: Error | null = null;

  try {
    const supabase = await createClient();

    // Parse search parameters
    const filters: ContentFilters = {
      search: searchParams.search as string,
      content_type: searchParams.content_type as string,
      language: searchParams.language as string,
      speaker_id: searchParams.speaker_id
        ? Number(searchParams.speaker_id)
        : undefined,
      category_id: searchParams.category_id
        ? Number(searchParams.category_id)
        : undefined
    };

    // Build query
    let query = supabase
      .from("dhamma_content")
      .select(
        `
        *,
        speaker:speakers(id, name),
        category:categories(id, name)
      `
      )
      .order("created_at", { ascending: false })
      .limit(50); // Limit for performance

    // Apply filters
    if (filters.search) {
      query = query.or(
        `title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`
      );
    }

    if (filters.content_type) {
      query = query.eq("content_type", filters.content_type);
    }

    if (filters.language) {
      query = query.eq("language", filters.language);
    }

    if (filters.speaker_id) {
      query = query.eq("speaker_id", filters.speaker_id);
    }

    if (filters.category_id) {
      query = query.eq("category_id", filters.category_id);
    }

    const result = await query;
    content = result.data || [];
    error = result.error;
  } catch (dbError) {
    console.warn("Database connection failed, using fallback data:", dbError);
    // Provide sample/fallback content when database is not available
    content = [
      {
        id: 19630,
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
      },
      {
        id: 19632,
        title: "Buddhist Philosophy eBook",
        description:
          "A comprehensive guide to Buddhist philosophy and practice.",
        content_type: "ebook",
        language: "English",
        file_url: "https://example.com/sample-book.pdf",
        created_at: new Date().toISOString(),
        speaker: {
          id: 3,
          name: "Philosophy Scholar",
          created_at: new Date().toISOString()
        },
        category: { id: 3, name: "Philosophy" }
      }
    ];
  }

  if (error) {
    console.error("Error fetching content:", error);
    return (
      <div className="text-center py-12">
        <FileX className="mx-auto h-12 w-12 text-muted-foreground" />
        <h3 className="mt-4 text-lg font-semibold">Error loading content</h3>
        <p className="text-muted-foreground">Please try again later.</p>
      </div>
    );
  }

  if (!content || content.length === 0) {
    return (
      <div className="text-center py-12">
        <FileX className="mx-auto h-12 w-12 text-muted-foreground" />
        <h3 className="mt-4 text-lg font-semibold">No content found</h3>
        <p className="text-muted-foreground mb-4">
          Try adjusting your search terms or filters.
        </p>
        <Button asChild variant="outline">
          <Link href="/content">Clear all filters</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Found {content.length} result{content.length === 1 ? "" : "s"}
        </p>
      </div>

      <div
        className={
          view === "grid"
            ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
            : "space-y-4"
        }
      >
        {content.map((item) => (
          <ContentCard key={item.id} content={item} />
        ))}
      </div>
    </div>
  );
}
