import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function ContentCardSkeleton() {
  return (
    <Card className="rounded-xl shadow-sm bg-card/95">
      <CardContent className="p-6">
        <div className="flex gap-4">
          {/* Content Type Icon Skeleton */}
          <div className="flex-shrink-0">
            <Skeleton className="w-14 h-14 rounded-xl" />
          </div>

          {/* Content Details Skeleton */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <CardHeader className="p-0">
                  {/* Badges Skeleton */}
                  <div className="flex items-center gap-2 mb-2">
                    <Skeleton className="h-5 w-16" />
                    <Skeleton className="h-5 w-14" />
                    <Skeleton className="h-5 w-20" />
                  </div>

                  {/* Title Skeleton */}
                  <Skeleton className="h-6 w-full mb-2" />
                  <Skeleton className="h-6 w-3/4" />

                  {/* Description Skeleton */}
                  <div className="mt-2">
                    <Skeleton className="h-4 w-full mb-1" />
                    <Skeleton className="h-4 w-2/3" />
                  </div>
                </CardHeader>

                {/* Speaker Info Skeleton */}
                <div className="flex items-center gap-2 mt-3">
                  <Skeleton className="h-6 w-6 rounded-full" />
                  <Skeleton className="h-4 w-24" />
                </div>

                {/* Metadata Skeleton */}
                <div className="flex flex-wrap items-center gap-4 mt-3">
                  <Skeleton className="h-3 w-12" />
                  <Skeleton className="h-3 w-16" />
                  <Skeleton className="h-3 w-20" />
                </div>
              </div>

              {/* Action Button Skeleton */}
              <div className="flex-shrink-0">
                <Skeleton className="h-8 w-16 rounded-lg" />
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function ContentListSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }, () => (
        <ContentCardSkeleton key={crypto.randomUUID()} />
      ))}
    </div>
  );
}
