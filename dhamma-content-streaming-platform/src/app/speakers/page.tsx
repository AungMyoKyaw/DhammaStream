import { Suspense } from "react";
import { SpeakersList } from "@/components/speakers/speakers-list";
import { SpeakersSearch } from "@/components/speakers/speakers-search";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default async function SpeakersPage({
  searchParams
}: {
  readonly searchParams: Promise<{
    readonly [key: string]: string | string[] | undefined;
  }>;
}) {
  const resolvedSearchParams = await searchParams;
  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Dhamma Teachers</h1>
        <p className="text-muted-foreground mt-2">
          Discover talks and teachings from experienced Buddhist teachers and
          monastics
        </p>
      </div>

      <div className="space-y-6">
        {/* Search */}
        <SpeakersSearch />

        {/* Speakers List */}
        <Suspense fallback={<SpeakersListSkeleton />}>
          <SpeakersList searchParams={resolvedSearchParams} />
        </Suspense>
      </div>
    </div>
  );
}

function SpeakersListSkeleton() {
  const skeletonItems = Array.from(
    { length: 12 },
    (_, i) => `speaker-skeleton-${Date.now()}-${i}`
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {skeletonItems.map((id) => (
        <Card key={id}>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <Skeleton className="h-12 w-12 rounded-full" />
              <div className="space-y-2 flex-1">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
