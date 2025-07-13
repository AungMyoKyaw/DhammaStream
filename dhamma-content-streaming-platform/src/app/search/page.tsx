import { SearchForm } from "@/components/search/search-form";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Clock,
  User,
  BookOpen,
  Video,
  Headphones,
  ChevronLeft,
  ChevronRight,
  Search
} from "lucide-react";
import Link from "next/link";
import type { DhammaContent } from "@/lib/types";

interface DatabaseItem {
  readonly id: number;
  readonly title: string;
  readonly description?: string;
  readonly content_type: "audio" | "video" | "ebook" | "other";
  readonly file_url: string;
  readonly language: string;
  readonly created_at: string;
  readonly duration_estimate?: number;
  readonly speaker_id?: number;
  readonly category_id?: number;
  readonly speaker?: { readonly name: string };
  readonly category?: { readonly name: string };
  readonly tags?: ReadonlyArray<{
    readonly tag: { readonly id: number; readonly name: string };
  }>;
}

export default async function SearchPage({
  searchParams
}: {
  readonly searchParams: Promise<{
    readonly [key: string]: string | string[] | undefined;
  }>;
}) {
  const resolvedSearchParams = await searchParams;
  const hasQuery =
    resolvedSearchParams.q ||
    resolvedSearchParams.speaker ||
    resolvedSearchParams.category;

  let searchResults: DhammaContent[] = [];
  let totalResults = 0;
  let searchError = false;

  if (hasQuery) {
    try {
      const supabase = await createClient();

      // Extract search parameters
      const query = (resolvedSearchParams.q as string) || "";
      const speaker = (resolvedSearchParams.speaker as string) || "";
      const language = (resolvedSearchParams.language as string) || "";
      const contentTypes =
        (resolvedSearchParams.types as string)?.split(",").filter(Boolean) ||
        [];
      const sortBy = (resolvedSearchParams.sort as string) || "relevance";
      const page = parseInt(resolvedSearchParams.page as string) || 1;

      let supabaseQuery = supabase.from("dhamma_content").select(`
          *,
          speaker:speakers(*),
          category:categories(*),
          tags:dhamma_content_tags(tag:tags(*))
        `);

      // Apply filters
      if (query) {
        supabaseQuery = supabaseQuery.or(
          `title.ilike.%${query}%,description.ilike.%${query}%`
        );
      }

      if (speaker) {
        supabaseQuery = supabaseQuery.eq("speaker_id", speaker);
      }

      if (language) {
        supabaseQuery = supabaseQuery.eq("language", language);
      }

      if (contentTypes.length > 0) {
        supabaseQuery = supabaseQuery.in("content_type", contentTypes);
      }

      // Apply sorting
      switch (sortBy) {
        case "date-desc":
          supabaseQuery = supabaseQuery.order("created_at", {
            ascending: false
          });
          break;
        case "date-asc":
          supabaseQuery = supabaseQuery.order("created_at", {
            ascending: true
          });
          break;
        case "title":
          supabaseQuery = supabaseQuery.order("title", { ascending: true });
          break;
        case "duration-desc":
          supabaseQuery = supabaseQuery.order("duration_estimate", {
            ascending: false
          });
          break;
        case "duration-asc":
          supabaseQuery = supabaseQuery.order("duration_estimate", {
            ascending: true
          });
          break;
        default:
          supabaseQuery = supabaseQuery.order("created_at", {
            ascending: false
          });
      }

      // Pagination
      const from = (page - 1) * 10;
      const to = from + 9;
      supabaseQuery = supabaseQuery.range(from, to);

      const { data, error, count } = await supabaseQuery;

      if (error) {
        console.error("Search error:", error);
        searchError = true;
      } else {
        // Transform the data to match our expected structure
        searchResults =
          (data?.map((item: DatabaseItem) => ({
            ...item,
            tags: item.tags?.map((tagRelation) => tagRelation.tag) || []
          })) as DhammaContent[]) || [];

        totalResults = count || 0;
      }
    } catch (error) {
      console.error("Search error:", error);
      searchError = true;
    }
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold tracking-tight mb-4">
          Search Dhamma Content
        </h1>
        <p className="text-muted-foreground">
          Find teachings, speakers, and topics that resonate with your practice
        </p>
      </div>

      <div className="max-w-4xl mx-auto space-y-8">
        {/* Search Form */}
        <Card>
          <CardContent className="p-6">
            <SearchForm />
          </CardContent>
        </Card>

        {/* Search Results */}
        {hasQuery ? (
          searchError ? (
            <SearchError />
          ) : (
            <SearchResultsList
              results={searchResults}
              totalResults={totalResults}
              searchParams={resolvedSearchParams}
            />
          )
        ) : (
          <EmptySearch />
        )}
      </div>
    </div>
  );
}

function SearchError() {
  return (
    <Card>
      <CardContent className="p-8 text-center">
        <div className="space-y-4">
          <div className="mx-auto h-12 w-12 text-red-400">
            <BookOpen className="h-full w-full" />
          </div>
          <div>
            <h3 className="text-lg font-medium text-gray-900">Search Error</h3>
            <p className="text-gray-500">
              There was an error performing your search. Please try again.
            </p>
          </div>
          <Button variant="outline" asChild>
            <Link href="/search">Try Again</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

interface SearchResultsListProps {
  readonly results: DhammaContent[];
  readonly totalResults: number;
  readonly searchParams: {
    readonly [key: string]: string | string[] | undefined;
  };
}

function SearchResultsList({
  results,
  totalResults,
  searchParams
}: SearchResultsListProps) {
  const currentPage = parseInt(searchParams.page as string) || 1;
  const totalPages = Math.ceil(totalResults / 10);

  if (results.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <div className="space-y-4">
            <div className="mx-auto h-12 w-12 text-gray-400">
              <BookOpen className="h-full w-full" />
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-900">
                No results found
              </h3>
              <p className="text-gray-500">
                Try adjusting your search terms or filters to find what
                you&apos;re looking for.
              </p>
            </div>
            <Button variant="outline" asChild>
              <Link href="/search">Clear Search</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const buildPageUrl = (newPage: number) => {
    const params = new URLSearchParams();
    Object.entries(searchParams).forEach(([key, value]) => {
      if (value && key !== "page") {
        params.set(key, String(value));
      }
    });
    if (newPage > 1) {
      params.set("page", String(newPage));
    }
    return `/search?${params.toString()}`;
  };

  return (
    <div className="space-y-6">
      {/* Results Summary */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-700">
          Showing {(currentPage - 1) * 10 + 1}-
          {Math.min(currentPage * 10, totalResults)} of {totalResults} results
        </p>
      </div>

      {/* Results List */}
      <div className="space-y-4">
        {results.map((content) => (
          <SearchResultCard key={content.id} content={content} />
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center space-x-2">
          {currentPage > 1 && (
            <Button variant="outline" size="sm" asChild>
              <Link href={buildPageUrl(currentPage - 1)}>
                <ChevronLeft className="h-4 w-4 mr-1" />
                Previous
              </Link>
            </Button>
          )}

          <div className="flex space-x-1">
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const startPage = Math.max(1, currentPage - 2);
              const page = startPage + i;

              if (page > totalPages) return null;

              return (
                <Button
                  key={page}
                  variant={page === currentPage ? "default" : "outline"}
                  size="sm"
                  className="w-8 h-8 p-0"
                  asChild
                >
                  <Link href={buildPageUrl(page)}>{page}</Link>
                </Button>
              );
            })}
          </div>

          {currentPage < totalPages && (
            <Button variant="outline" size="sm" asChild>
              <Link href={buildPageUrl(currentPage + 1)}>
                Next
                <ChevronRight className="h-4 w-4 ml-1" />
              </Link>
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

function SearchResultCard({ content }: { readonly content: DhammaContent }) {
  const getContentIcon = () => {
    switch (content.content_type) {
      case "audio":
        return <Headphones className="h-5 w-5 text-blue-500" />;
      case "video":
        return <Video className="h-5 w-5 text-red-500" />;
      case "ebook":
        return <BookOpen className="h-5 w-5 text-green-500" />;
      default:
        return <BookOpen className="h-5 w-5 text-gray-500" />;
    }
  };

  const formatDuration = (seconds: number | null) => {
    if (!seconds) return null;
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex space-x-4">
          {/* Content Type Icon */}
          <div className="flex-shrink-0 mt-1">{getContentIcon()}</div>

          {/* Content Details */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <Link
                  href={`/content/${content.id}`}
                  className="text-lg font-semibold text-gray-900 hover:text-blue-600 transition-colors"
                >
                  {content.title}
                </Link>

                {content.description && (
                  <p className="mt-2 text-gray-600 line-clamp-2">
                    {content.description}
                  </p>
                )}

                {/* Metadata */}
                <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-gray-500">
                  {content.speaker?.name && (
                    <div className="flex items-center">
                      <User className="h-4 w-4 mr-1" />
                      <Link
                        href={`/speakers/${content.speaker_id}`}
                        className="hover:text-blue-600 transition-colors"
                      >
                        {content.speaker.name}
                      </Link>
                    </div>
                  )}

                  {content.duration_estimate && (
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-1" />
                      {formatDuration(content.duration_estimate)}
                    </div>
                  )}

                  {content.created_at && (
                    <span>
                      {new Date(content.created_at).toLocaleDateString()}
                    </span>
                  )}
                </div>

                {/* Tags and Categories */}
                <div className="mt-3 flex flex-wrap gap-2">
                  {content.category && (
                    <Badge variant="secondary" className="text-xs">
                      {content.category.name}
                    </Badge>
                  )}
                  {content.tags?.map((tag) => (
                    <Badge key={tag.id} variant="outline" className="text-xs">
                      {tag.name}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function EmptySearch() {
  return (
    <Card>
      <CardContent className="p-12 text-center">
        <Search className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">Start Your Search</h3>
        <p className="text-muted-foreground">
          Enter keywords, select a speaker, or choose a category to find
          relevant content
        </p>
      </CardContent>
    </Card>
  );
}
