import { Suspense } from "react";
import { ContentList } from "@/components/content/content-list";
import { ContentFilters } from "@/components/content/content-filters";
import { ContentSearch } from "@/components/content/content-search";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default async function ContentPage({
  searchParams
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const resolvedSearchParams = await searchParams;
  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Browse Content</h1>
        <p className="text-muted-foreground mt-2">
          Discover thousands of Dhamma talks, videos, and ebooks from renowned
          teachers
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Filters Sidebar */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Filters</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <Suspense fallback={<Skeleton className="h-[200px]" />}>
                <ContentFilters />
              </Suspense>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3 space-y-6">
          {/* Search */}
          <ContentSearch />

          {/* Content List */}
          <Suspense fallback={<ContentListSkeleton />}>
            <ContentList searchParams={resolvedSearchParams} />
          </Suspense>
        </div>
      </div>
    </div>
  );
}

function ContentListSkeleton() {
  const skeletonItems = Array.from(
    { length: 6 },
    (_, i) => `skeleton-${Date.now()}-${i}`
  );

  return (
    <div className="space-y-4">
      {skeletonItems.map((id) => (
        <Card key={id}>
          <CardContent className="p-6">
            <div className="flex space-x-4">
              <Skeleton className="h-20 w-20 rounded" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
                <Skeleton className="h-3 w-1/4" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
