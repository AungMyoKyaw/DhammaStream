import { Component, type ErrorInfo, type ReactNode } from "react";
import { Button } from "@/components/common/Button";

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
    // Log error to console and potentially to error reporting service
    console.error("Error caught by boundary:", error, errorInfo);

    // In production, you might want to log to an error reporting service
    if (import.meta.env.PROD) {
      // Example: logErrorToService(error, errorInfo);
    }
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-background px-4">
          <div className="max-w-md w-full text-center space-y-6">
            <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-orange-600 rounded-lg flex items-center justify-center mx-auto">
              <span className="text-white font-bold text-2xl">!</span>
            </div>

            <h1 className="text-2xl font-bold text-foreground">
              Something went wrong
            </h1>

            <p className="text-muted-foreground">
              We apologize for the inconvenience. An unexpected error occurred
              while loading this page.
            </p>

            {import.meta.env.DEV && this.state.error && (
              <details className="text-left bg-muted p-4 rounded-lg">
                <summary className="font-semibold cursor-pointer">
                  Error Details
                </summary>
                <pre className="mt-2 text-sm text-destructive overflow-auto">
                  {this.state.error.message}
                  {this.state.error.stack}
                </pre>
              </details>
            )}

            <div className="space-y-3">
              <Button
                onClick={() => window.location.reload()}
                className="w-full"
              >
                Reload Page
              </Button>

              <Button
                variant="outline"
                onClick={() => {
                  window.location.href = "/";
                }}
                className="w-full"
              >
                Go to Home
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Hook version for functional components
export function useErrorHandler() {
  return (error: Error, errorInfo?: ErrorInfo) => {
    console.error("Error caught by handler:", error, errorInfo);

    if (import.meta.env.PROD) {
      // Log to error reporting service in production
    }
  };
}
