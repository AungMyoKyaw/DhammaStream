"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AlertTriangle } from "lucide-react";

export default function ErrorPage({
  error,
  reset
}: {
  readonly error: Error & { readonly digest?: string };
  readonly reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error("Application error:", error);
  }, [error]);

  const handleGoHome = () => {
    window.location.href = "/";
  };

  return (
    <div className="container mx-auto py-8">
      <Card className="max-w-lg mx-auto">
        <CardContent className="p-8 text-center">
          <div className="space-y-4">
            <div className="mx-auto h-12 w-12 text-red-400">
              <AlertTriangle className="h-full w-full" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                Something went wrong!
              </h2>
              <p className="text-gray-500 mt-2">
                An error occurred while loading this page. Please try again.
              </p>
            </div>
            <div className="space-x-4">
              <Button onClick={reset} variant="default">
                Try again
              </Button>
              <Button onClick={handleGoHome} variant="outline">
                Go home
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
