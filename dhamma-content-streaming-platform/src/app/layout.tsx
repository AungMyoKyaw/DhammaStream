import { Inter } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { Navigation } from "@/components/navigation";
import { ThemeProvider } from "@/components/theme-provider";
import { Footer } from "@/components/footer";
import { ErrorBoundary } from "@/components/ui/error-boundary";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "DhammaStream - Buddhist Content Platform",
  description:
    "Stream, browse, and discover Dhamma content including audio talks, videos, and ebooks"
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
          <div className="relative flex min-h-screen flex-col">
            <Navigation />
            <ErrorBoundary>
              <main className="flex-1">{children}</main>
            </ErrorBoundary>
            <Footer />
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
