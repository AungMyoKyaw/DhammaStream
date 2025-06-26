import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { Toaster } from "sonner";
import { AppLayout } from "@/components/layout/AppLayout";
import { AppRoutes } from "@/components/routing/AppRoutes";
import { AuthProvider } from "@/components/auth/AuthProvider";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import { PlayerProvider } from "@/components/player/PlayerProvider";
import { ErrorBoundary } from "@/components/common/ErrorBoundary";

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: (failureCount, error: unknown) => {
        const apiError = error as { status?: number };
        if (apiError?.status === 404) return false;
        return failureCount < 3;
      }
    }
  }
});

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <ThemeProvider>
            <AuthProvider>
              <PlayerProvider>
                <AppLayout>
                  <AppRoutes />
                </AppLayout>
                <Toaster position="top-right" richColors />
              </PlayerProvider>
            </AuthProvider>
          </ThemeProvider>
        </BrowserRouter>
        {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />}
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
