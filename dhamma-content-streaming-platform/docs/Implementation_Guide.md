# DhammaStream UI/UX Implementation Guide

## Quick Start Implementation Checklist

```markdown
## Phase 1: Foundation (Weeks 1-4)

- [ ] Accessibility enhancements
- [ ] Loading states implementation
- [ ] Performance optimizations
- [ ] Error boundary improvements

## Phase 2: User Experience (Weeks 5-8)

- [ ] Navigation enhancements
- [ ] Content discovery features
- [ ] Search improvements
- [ ] Mobile optimizations

## Phase 3: Advanced Features (Weeks 9-12)

- [ ] Media player enhancements
- [ ] Progressive Web App features
- [ ] Offline capabilities
- [ ] Advanced interactions

## Phase 4: Polish (Weeks 13-16)

- [ ] Visual design improvements
- [ ] Micro-interactions
- [ ] Performance tuning
- [ ] Final testing
```

---

## 1. Phase 1: Foundation Implementation

### 1.1 Accessibility Enhancements

#### Skip Navigation Links

**File**: `src/components/navigation.tsx`

```tsx
// Add to Navigation component, before existing header
<nav className="sr-only focus:not-sr-only" aria-label="Skip navigation">
  <a
    href="#main-content"
    className="absolute left-4 top-4 z-50 px-4 py-2 bg-primary text-primary-foreground rounded-md transform -translate-y-16 focus:translate-y-0 transition-transform"
  >
    Skip to main content
  </a>
  <a
    href="#search"
    className="absolute left-4 top-16 z-50 px-4 py-2 bg-primary text-primary-foreground rounded-md transform -translate-y-16 focus:translate-y-0 transition-transform"
  >
    Skip to search
  </a>
</nav>
```

#### ARIA Live Regions

**New File**: `src/components/ui/live-region.tsx`

```tsx
"use client";
import { createContext, useContext, useState, useCallback } from "react";

const LiveRegionContext = createContext<{
  announce: (message: string, priority?: "polite" | "assertive") => void;
} | null>(null);

export function LiveRegionProvider({
  children
}: {
  children: React.ReactNode;
}) {
  const [messages, setMessages] = useState<
    Array<{ id: string; message: string; priority: string }>
  >([]);

  const announce = useCallback(
    (message: string, priority: "polite" | "assertive" = "polite") => {
      const id = Date.now().toString();
      setMessages((prev) => [...prev, { id, message, priority }]);
      setTimeout(
        () => setMessages((prev) => prev.filter((m) => m.id !== id)),
        1000
      );
    },
    []
  );

  return (
    <LiveRegionContext.Provider value={{ announce }}>
      {children}
      <div aria-live="polite" aria-atomic="true" className="sr-only">
        {messages
          .filter((m) => m.priority === "polite")
          .map((m) => (
            <div key={m.id}>{m.message}</div>
          ))}
      </div>
      <div aria-live="assertive" aria-atomic="true" className="sr-only">
        {messages
          .filter((m) => m.priority === "assertive")
          .map((m) => (
            <div key={m.id}>{m.message}</div>
          ))}
      </div>
    </LiveRegionContext.Provider>
  );
}

export const useLiveRegion = () => {
  const context = useContext(LiveRegionContext);
  if (!context)
    throw new Error("useLiveRegion must be used within LiveRegionProvider");
  return context;
};
```

### 1.2 Loading States Implementation

#### Enhanced Loading Component

**File**: `src/components/ui/loading.tsx`

```tsx
import { cn } from "@/lib/utils";

interface LoadingProps {
  variant?: "spinner" | "skeleton" | "dots";
  size?: "sm" | "md" | "lg";
  text?: string;
  className?: string;
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
        <div className="h-4 bg-muted rounded w-3/4"></div>
        <div className="h-4 bg-muted rounded w-1/2"></div>
        <div className="h-4 bg-muted rounded w-2/3"></div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-2",
        className
      )}
      role="status"
      aria-label={text || "Loading"}
    >
      <div
        className={cn(
          "animate-spin rounded-full border-2 border-muted border-t-primary",
          sizeClasses[size]
        )}
      />
      {text && <p className="text-sm text-muted-foreground">{text}</p>}
    </div>
  );
}
```

#### Content Card Skeleton

**File**: `src/components/content/content-loading.tsx`

```tsx
export function ContentCardSkeleton() {
  return (
    <div className="rounded-xl border bg-card p-6 animate-pulse">
      <div className="flex gap-4">
        <div className="w-16 h-16 bg-muted rounded-2xl" />
        <div className="flex-1 space-y-3">
          <div className="flex gap-2">
            <div className="h-6 w-16 bg-muted rounded" />
            <div className="h-6 w-12 bg-muted rounded" />
          </div>
          <div className="h-6 w-3/4 bg-muted rounded" />
          <div className="h-4 w-full bg-muted rounded" />
          <div className="h-4 w-2/3 bg-muted rounded" />
        </div>
        <div className="w-20 h-8 bg-muted rounded" />
      </div>
    </div>
  );
}
```

### 1.3 Error Boundary Enhancement

**File**: `src/components/ui/error-boundary.tsx`

```tsx
"use client";
import { Component, ReactNode, ErrorInfo } from "react";
import { Button } from "./button";
import { AlertTriangle, RefreshCw } from "lucide-react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Error caught by boundary:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
            <AlertTriangle className="h-12 w-12 text-destructive" />
            <div className="text-center space-y-2">
              <h2 className="text-lg font-semibold">Something went wrong</h2>
              <p className="text-muted-foreground">
                We apologize for the inconvenience
              </p>
            </div>
            <Button onClick={() => window.location.reload()} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Reload Page
            </Button>
          </div>
        )
      );
    }
    return this.props.children;
  }
}
```

---

## 2. Phase 2: Navigation & Discovery

### 2.1 Breadcrumb Component

**New File**: `src/components/ui/breadcrumb.tsx`

```tsx
import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";
import { cn } from "@/lib/utils";

interface BreadcrumbItem {
  label: string;
  href?: string;
  current?: boolean;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
}

export function Breadcrumb({ items, className }: BreadcrumbProps) {
  return (
    <nav
      aria-label="Breadcrumb"
      className={cn("flex items-center space-x-1 text-sm", className)}
    >
      <Link href="/" className="text-muted-foreground hover:text-foreground">
        <Home className="h-4 w-4" />
        <span className="sr-only">Home</span>
      </Link>
      {items.map((item, index) => (
        <div key={index} className="flex items-center space-x-1">
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
          {item.current || !item.href ? (
            <span className="font-medium text-foreground" aria-current="page">
              {item.label}
            </span>
          ) : (
            <Link
              href={item.href}
              className="text-muted-foreground hover:text-foreground"
            >
              {item.label}
            </Link>
          )}
        </div>
      ))}
    </nav>
  );
}
```

### 2.2 Continue Listening Component

**New File**: `src/components/content/continue-listening.tsx`

```tsx
"use client";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Play, Clock } from "lucide-react";
import Link from "next/link";
import type { DhammaContent } from "@/lib/types";

export function ContinueListening() {
  const [recentContent, setRecentContent] = useState<
    Array<{
      content: DhammaContent;
      position: number;
      timestamp: number;
    }>
  >([]);

  useEffect(() => {
    // Load recent listening history from localStorage
    const keys = Object.keys(localStorage).filter((key) =>
      key.startsWith("dhamma-playback-")
    );
    const history = keys
      .map((key) => {
        const contentId = key.replace("dhamma-playback-", "");
        const position = parseFloat(localStorage.getItem(key) || "0");
        return { contentId, position, timestamp: Date.now() };
      })
      .slice(0, 3);

    // In real implementation, fetch content details from API
    // setRecentContent(history);
  }, []);

  if (recentContent.length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Continue Listening
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {recentContent.map(({ content, position }) => (
          <div
            key={content.id}
            className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
          >
            <div className="flex-1 min-w-0">
              <h4 className="font-medium truncate">{content.title}</h4>
              <p className="text-sm text-muted-foreground">
                {Math.floor(position / 60)}:
                {String(Math.floor(position % 60)).padStart(2, "0")} remaining
              </p>
            </div>
            <Button size="sm" asChild>
              <Link href={`/content/${content.id}`}>
                <Play className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
```

---

## 3. Phase 3: Media Player Enhancements

### 3.1 Advanced Audio Player

**File**: `src/components/content/content-player.tsx` (additions)

```tsx
// Add these new features to existing ContentPlayer component

const [playbackRate, setPlaybackRate] = useState(1);
const [showTranscript, setShowTranscript] = useState(false);

// Playback speed control
const changePlaybackRate = (rate: number) => {
  const element = audioRef.current || videoRef.current;
  if (element) {
    element.playbackRate = rate;
    setPlaybackRate(rate);
  }
};

// Skip functionality
const skip = (seconds: number) => {
  const element = audioRef.current || videoRef.current;
  if (element) {
    element.currentTime = Math.max(
      0,
      Math.min(element.duration, element.currentTime + seconds)
    );
  }
};

// Keyboard shortcuts
useEffect(() => {
  const handleKeyPress = (e: KeyboardEvent) => {
    if (e.target instanceof HTMLInputElement) return;

    switch (e.key) {
      case " ":
        e.preventDefault();
        togglePlay();
        break;
      case "ArrowLeft":
        skip(-15);
        break;
      case "ArrowRight":
        skip(15);
        break;
      case "m":
        toggleMute();
        break;
    }
  };

  document.addEventListener("keydown", handleKeyPress);
  return () => document.removeEventListener("keydown", handleKeyPress);
}, []);

// Add to player UI:
<div className="flex items-center gap-2">
  <Button variant="outline" size="sm" onClick={() => skip(-15)}>
    -15s
  </Button>
  <Button variant="outline" size="sm" onClick={() => skip(15)}>
    +15s
  </Button>
  <select
    value={playbackRate}
    onChange={(e) => changePlaybackRate(Number(e.target.value))}
    className="px-2 py-1 rounded border"
  >
    <option value={0.5}>0.5x</option>
    <option value={0.75}>0.75x</option>
    <option value={1}>1x</option>
    <option value={1.25}>1.25x</option>
    <option value={1.5}>1.5x</option>
    <option value={2}>2x</option>
  </select>
</div>;
```

### 3.2 Progressive Web App Setup

**File**: `next.config.ts`

```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // ...existing config
  experimental: {
    // Enable PWA features
    serverComponents: true
  }
};

export default nextConfig;
```

**New File**: `public/manifest.json`

```json
{
  "name": "DhammaStream - Buddhist Content Platform",
  "short_name": "DhammaStream",
  "description": "Stream Buddhist teachings, audio talks, and meditation content",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#1a1a2e",
  "icons": [
    {
      "src": "/icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icon-512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

---

## 4. Phase 4: Performance & Polish

### 4.1 Image Optimization

**New File**: `src/components/ui/optimized-image.tsx`

```tsx
import Image from "next/image";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  priority?: boolean;
}

export function OptimizedImage({
  src,
  alt,
  width,
  height,
  className,
  priority = false
}: OptimizedImageProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  return (
    <div className={cn("relative overflow-hidden", className)}>
      {isLoading && <div className="absolute inset-0 bg-muted animate-pulse" />}
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        priority={priority}
        className={cn(
          "transition-opacity duration-300",
          isLoading ? "opacity-0" : "opacity-100"
        )}
        onLoad={() => setIsLoading(false)}
        onError={() => {
          setIsLoading(false);
          setHasError(true);
        }}
      />
      {hasError && (
        <div className="absolute inset-0 bg-muted flex items-center justify-center">
          <span className="text-muted-foreground text-sm">
            Failed to load image
          </span>
        </div>
      )}
    </div>
  );
}
```

### 4.2 Performance Monitoring Hook

**New File**: `src/hooks/use-performance.ts`

```tsx
"use client";
import { useEffect } from "react";

export function usePerformance(componentName: string) {
  useEffect(() => {
    const startTime = performance.now();

    return () => {
      const endTime = performance.now();
      const renderTime = endTime - startTime;

      if (renderTime > 16) {
        // 60fps threshold
        console.warn(
          `Slow render detected in ${componentName}: ${renderTime.toFixed(2)}ms`
        );
      }
    };
  }, [componentName]);
}
```

---

## 5. Testing Implementation

### 5.1 Accessibility Testing Setup

**File**: `__tests__/accessibility.test.tsx`

```tsx
import { render } from "@testing-library/react";
import { axe, toHaveNoViolations } from "jest-axe";
import { Navigation } from "@/components/navigation";

expect.extend(toHaveNoViolations);

describe("Accessibility Tests", () => {
  test("Navigation component should not have accessibility violations", async () => {
    const { container } = render(<Navigation />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
```

### 5.2 Performance Testing

**File**: `__tests__/performance.test.tsx`

```tsx
import { render, screen } from "@testing-library/react";
import { ContentCard } from "@/components/content/content-card";

describe("Performance Tests", () => {
  test("ContentCard renders within performance budget", () => {
    const startTime = performance.now();

    render(<ContentCard content={mockContent} />);

    const endTime = performance.now();
    const renderTime = endTime - startTime;

    expect(renderTime).toBeLessThan(16); // 60fps = 16ms budget
  });
});
```

---

## 6. Deployment Checklist

### 6.1 Pre-deployment Verification

```bash
# Performance audit
npm run lighthouse-ci

# Accessibility testing
npm run test:a11y

# Build optimization check
npm run analyze

# Type checking
npm run type-check

# Security audit
npm audit

# Bundle size analysis
npm run bundle-analyzer
```

### 6.2 Environment Variables

```env
# Add to .env.local
NEXT_PUBLIC_PWA_ENABLED=true
NEXT_PUBLIC_ANALYTICS_ID=your_analytics_id
NEXT_PUBLIC_PERFORMANCE_MONITORING=true
```

---

## 7. Monitoring & Maintenance

### 7.1 Performance Monitoring Setup

```typescript
// src/lib/performance.ts
export function trackWebVitals(metric: any) {
  switch (metric.name) {
    case "CLS":
    case "FID":
    case "FCP":
    case "LCP":
    case "TTFB":
      // Send to analytics
      break;
  }
}
```

### 7.2 Error Monitoring

```typescript
// src/lib/error-tracking.ts
export function trackError(error: Error, context?: any) {
  console.error("Application error:", error, context);
  // Send to error tracking service
}
```

---

_This implementation guide provides the technical foundation for elevating DhammaStream's UI/UX to world-class standards. Follow the phases sequentially for best results._
