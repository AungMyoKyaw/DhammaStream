// Loading component with different variants
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/utils";

const loadingVariants = cva("animate-spin", {
  variants: {
    size: {
      default: "h-6 w-6",
      sm: "h-4 w-4",
      lg: "h-8 w-8",
      xl: "h-12 w-12"
    },
    variant: {
      spinner:
        "border-2 border-gray-300 border-t-2 border-t-primary rounded-full",
      dots: "flex space-x-1",
      pulse: "bg-primary rounded-full animate-pulse"
    }
  },
  defaultVariants: {
    size: "default",
    variant: "spinner"
  }
});

interface LoadingProps extends VariantProps<typeof loadingVariants> {
  className?: string;
  message?: string;
}

export function Loading({ size, variant, className, message }: LoadingProps) {
  if (variant === "dots") {
    return (
      <div className={cn("flex items-center space-x-4", className)}>
        <div className="flex space-x-1">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className={cn(
                "rounded-full bg-primary animate-bounce",
                size === "sm"
                  ? "h-2 w-2"
                  : size === "lg"
                    ? "h-4 w-4"
                    : "h-3 w-3"
              )}
              style={{ animationDelay: `${i * 0.1}s` }}
            />
          ))}
        </div>
        {message && (
          <span className="text-sm text-muted-foreground">{message}</span>
        )}
      </div>
    );
  }

  if (variant === "pulse") {
    return (
      <div className={cn("flex items-center space-x-4", className)}>
        <div className={cn(loadingVariants({ size, variant }))} />
        {message && (
          <span className="text-sm text-muted-foreground">{message}</span>
        )}
      </div>
    );
  }

  return (
    <div className={cn("flex items-center space-x-4", className)}>
      <div className={cn(loadingVariants({ size, variant }))} />
      {message && (
        <span className="text-sm text-muted-foreground">{message}</span>
      )}
    </div>
  );
}

// Full page loading
export function LoadingPage({ message = "Loading..." }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen space-y-4">
      <Loading size="xl" message={message} />
    </div>
  );
}

// Overlay loading
export function LoadingOverlay({
  message = "Loading...",
  show
}: {
  message?: string;
  show: boolean;
}) {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-background rounded-lg p-6 shadow-lg">
        <Loading size="lg" message={message} />
      </div>
    </div>
  );
}

// Skeleton loader for content cards
export function ContentSkeleton() {
  return (
    <div className="space-y-3 animate-pulse">
      <div className="bg-gray-200 dark:bg-gray-700 rounded-lg aspect-square w-full" />
      <div className="space-y-2">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
      </div>
    </div>
  );
}

// List skeleton
export function ListSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }, (_, i) => `skeleton-${i}`).map((key) => (
        <div key={key} className="flex space-x-4 animate-pulse">
          <div className="bg-gray-200 dark:bg-gray-700 rounded-lg w-16 h-16 flex-shrink-0" />
          <div className="space-y-2 flex-1">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
}

// Grid skeleton
export function GridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
      {Array.from({ length: count }, (_, i) => `grid-skeleton-${i}`).map(
        (key) => (
          <div key={key} className="animate-pulse">
            <div className="bg-gray-200 dark:bg-gray-700 aspect-square rounded-lg mb-3" />
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full" />
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
            </div>
          </div>
        )
      )}
    </div>
  );
}
