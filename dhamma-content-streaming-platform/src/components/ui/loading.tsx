import { cn } from "@/lib/utils";

interface LoadingProps {
  readonly variant?: "spinner" | "skeleton" | "dots" | "pulse";
  readonly size?: "sm" | "md" | "lg";
  readonly text?: string;
  readonly className?: string;
}

export function Loading({
  variant = "spinner",
  size = "md",
  text,
  className
}: LoadingProps) {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-8 h-8",
    lg: "w-12 h-12"
  };

  if (variant === "skeleton") {
    return (
      <div className={cn("animate-pulse space-y-4", className)}>
        <div className="h-4 bg-muted rounded w-3/4" />
        <div className="h-4 bg-muted rounded w-1/2" />
        <div className="h-4 bg-muted rounded w-2/3" />
        <span className="sr-only">{text || "Loading content"}</span>
      </div>
    );
  }

  if (variant === "dots") {
    return (
      <div className={cn("flex items-center justify-center gap-1", className)}>
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className={cn(
              "bg-primary rounded-full animate-bounce",
              sizeClasses[size]
            )}
            style={{
              animationDelay: `${i * 0.1}s`,
              animationDuration: "0.6s"
            }}
          />
        ))}
        <span className="sr-only">{text || "Loading"}</span>
      </div>
    );
  }

  if (variant === "pulse") {
    return (
      <div className={cn("flex items-center justify-center", className)}>
        <div
          className={cn(
            "bg-primary rounded-full animate-pulse",
            sizeClasses[size]
          )}
        />
        {text && <p className="ml-3 text-sm text-muted-foreground">{text}</p>}
        <span className="sr-only">{text || "Loading"}</span>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-2",
        className
      )}
    >
      <div
        className={cn(
          "animate-spin rounded-full border-2 border-muted border-t-primary",
          sizeClasses[size]
        )}
      />
      {text && <p className="text-sm text-muted-foreground">{text}</p>}
      <span className="sr-only">{text || "Loading"}</span>
    </div>
  );
}

// Content-specific loading components
export function ContentCardSkeleton() {
  return (
    <div className="rounded-xl border bg-card p-6 animate-pulse">
      <div className="flex gap-4">
        <div className="w-16 h-16 bg-muted rounded-2xl flex-shrink-0" />
        <div className="flex-1 space-y-3">
          <div className="flex gap-2">
            <div className="h-6 w-16 bg-muted rounded" />
            <div className="h-6 w-12 bg-muted rounded" />
          </div>
          <div className="h-6 w-3/4 bg-muted rounded" />
          <div className="h-4 w-full bg-muted rounded" />
          <div className="h-4 w-2/3 bg-muted rounded" />
        </div>
        <div className="w-20 h-8 bg-muted rounded flex-shrink-0" />
      </div>
      <span className="sr-only">Loading content card</span>
    </div>
  );
}

export function NavigationSkeleton() {
  return (
    <div className="h-16 border-b bg-background/95 backdrop-blur">
      <div className="container flex items-center justify-between h-full animate-pulse">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-muted rounded-full" />
          <div className="w-32 h-6 bg-muted rounded" />
        </div>
        <div className="hidden md:flex gap-6">
          <div className="w-24 h-6 bg-muted rounded" />
          <div className="w-20 h-6 bg-muted rounded" />
          <div className="w-28 h-6 bg-muted rounded" />
        </div>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-muted rounded" />
          <div className="w-40 h-9 bg-muted rounded hidden sm:block" />
          <div className="w-8 h-8 bg-muted rounded md:hidden" />
        </div>
      </div>
      <span className="sr-only">Loading navigation</span>
    </div>
  );
}
