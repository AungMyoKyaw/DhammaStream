import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { Toaster } from "sonner";
import { AppLayout } from "@/components/layout/AppLayout";
import { AppRoutes } from "@/components/routing/AppRoutes";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import { PlayerProvider } from "@/components/player/PlayerProvider";
import { ErrorBoundary } from "@/components/common/ErrorBoundary";

// Create a client with optimized settings for Firestore
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
      retry: (failureCount, error: unknown) => {
        const apiError = error as { code?: string; status?: number };

        // Don't retry on specific Firebase errors
        if (
          apiError?.code === "permission-denied" ||
          apiError?.code === "unauthenticated" ||
          apiError?.status === 404
        ) {
          return false;
        }

        // Retry up to 3 times for other errors
        return failureCount < 3;
      },
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      refetchOnWindowFocus: false, // Disable refetch on window focus for better UX
      networkMode: "online" // Only run queries when online
    },
    mutations: {
      retry: 1,
      networkMode: "online"
    }
  }
});

function App() {
  const isDev = import.meta.env.DEV;
  const showDevtools =
    isDev && import.meta.env.VITE_ENABLE_QUERY_DEVTOOLS === "true";

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <ThemeProvider>
            <PlayerProvider>
              <AppLayout>
                <AppRoutes />
              </AppLayout>
              <Toaster
                position="top-right"
                richColors
                toastOptions={{
                  duration: 4000,
                  style: {
                    background: "hsl(var(--background))",
                    color: "hsl(var(--foreground))",
                    border: "1px solid hsl(var(--border))"
                  }
                }}
              />
            </PlayerProvider>
          </ThemeProvider>
        </BrowserRouter>
        {showDevtools && <ReactQueryDevtools initialIsOpen={false} />}
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
