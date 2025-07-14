import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";
import { cn } from "@/lib/utils";

interface BreadcrumbItem {
  readonly label: string;
  readonly href?: string;
  readonly current?: boolean;
}

interface BreadcrumbProps {
  readonly items: BreadcrumbItem[];
  readonly className?: string;
}

export function Breadcrumb({ items, className }: BreadcrumbProps) {
  return (
    <nav
      aria-label="Breadcrumb"
      className={cn("flex items-center space-x-1 text-sm", className)}
    >
      <Link
        href="/"
        className="text-muted-foreground hover:text-foreground transition-colors"
        aria-label="Go to homepage"
      >
        <Home className="h-4 w-4" />
        <span className="sr-only">Home</span>
      </Link>

      {items.map((item, index) => (
        <div
          key={`${item.label}-${index}`}
          className="flex items-center space-x-1"
        >
          <ChevronRight
            className="h-4 w-4 text-muted-foreground"
            aria-hidden="true"
          />
          {item.current || !item.href ? (
            <span className="font-medium text-foreground" aria-current="page">
              {item.label}
            </span>
          ) : (
            <Link
              href={item.href}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              {item.label}
            </Link>
          )}
        </div>
      ))}
    </nav>
  );
}

// Utility function to generate breadcrumbs from pathname
export function generateBreadcrumbs(pathname: string): BreadcrumbItem[] {
  const segments = pathname.split("/").filter(Boolean);
  const breadcrumbs: BreadcrumbItem[] = [];

  segments.forEach((segment, index) => {
    const isLast = index === segments.length - 1;
    const href = "/" + segments.slice(0, index + 1).join("/");

    // Convert segment to readable label
    const label = segment
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");

    breadcrumbs.push({
      label,
      href: isLast ? undefined : href,
      current: isLast
    });
  });

  return breadcrumbs;
}
