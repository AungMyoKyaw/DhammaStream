import { Inter } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { Navigation } from "@/components/navigation";
import { ThemeProvider } from "@/components/theme-provider";
import { Footer } from "@/components/footer";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { LiveRegionProvider } from "@/components/ui/live-region";
import { ServiceWorkerProvider } from "@/components/service-worker-provider";
import { PerformanceMonitor } from "@/components/performance/performance-monitor";
import { AccessibilityAuditor } from "@/components/accessibility/accessibility-auditor";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "DhammaStream - Buddhist Content Platform",
  description:
    "Stream, browse, and discover Dhamma content including audio talks, videos, and ebooks",
  manifest: "/manifest.json",
  themeColor: "#1a1a2e",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "DhammaStream"
  },
  other: {
    "mobile-web-app-capable": "yes",
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "default",
    "apple-mobile-web-app-title": "DhammaStream"
  }
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={cn(
          "min-h-screen bg-background font-sans antialiased",
          inter.className
        )}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <LiveRegionProvider>
            <ServiceWorkerProvider>
              {/* Skip Navigation Links */}
              <nav
                className="sr-only focus-within:not-sr-only"
                aria-label="Skip navigation"
              >
                <a
                  href="#main-content"
                  className="absolute left-4 top-4 z-50 px-4 py-2 bg-primary text-primary-foreground rounded-md transform -translate-y-16 focus:translate-y-0 transition-transform duration-200 focus:outline-none focus:ring-2 focus:ring-primary-foreground"
                >
                  Skip to main content
                </a>
                <a
                  href="#search"
                  className="absolute left-4 top-16 z-50 px-4 py-2 bg-primary text-primary-foreground rounded-md transform -translate-y-16 focus:translate-y-0 transition-transform duration-200 focus:outline-none focus:ring-2 focus:ring-primary-foreground"
                >
                  Skip to search
                </a>
              </nav>

              <div className="relative flex min-h-screen flex-col">
                <Navigation />
                <ErrorBoundary>
                  <main id="main-content" className="flex-1">
                    {children}
                  </main>
                </ErrorBoundary>
                <Footer />
              </div>
              <PerformanceMonitor />
              <AccessibilityAuditor />
            </ServiceWorkerProvider>
          </LiveRegionProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
