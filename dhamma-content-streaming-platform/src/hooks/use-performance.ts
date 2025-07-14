"use client";

import { useEffect, useRef, useCallback } from "react";

// Hook for monitoring component render performance
export function usePerformance(componentName: string) {
  const startTimeRef = useRef<number>(0);

  useEffect(() => {
    startTimeRef.current = performance.now();

    return () => {
      const endTime = performance.now();
      const renderTime = endTime - startTimeRef.current;

      if (renderTime > 16) {
        // 60fps threshold (16.67ms per frame)
        console.warn(
          `Slow render detected in ${componentName}: ${renderTime.toFixed(2)}ms`
        );

        // Track performance metric
        trackPerformanceMetric({
          name: "component-render-time",
          value: renderTime,
          component: componentName,
          timestamp: Date.now()
        });
      }
    };
  }, [componentName]);
}

// Hook for tracking user interactions performance
export function useInteractionTracking() {
  const trackInteraction = useCallback(
    (action: string, element: string, startTime?: number) => {
      const endTime = performance.now();
      const duration = startTime ? endTime - startTime : 0;

      trackPerformanceMetric({
        name: "user-interaction",
        value: duration,
        action,
        element,
        timestamp: Date.now()
      });
    },
    []
  );

  return { trackInteraction };
}

// Hook for monitoring page load performance
export function usePagePerformance(pageName: string) {
  useEffect(() => {
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();

      entries.forEach((entry) => {
        if (entry.entryType === "navigation") {
          const navEntry = entry as PerformanceNavigationTiming;

          trackPerformanceMetric({
            name: "page-load-time",
            value: navEntry.loadEventEnd - navEntry.fetchStart,
            page: pageName,
            timestamp: Date.now()
          });
        }

        if (entry.entryType === "largest-contentful-paint") {
          trackPerformanceMetric({
            name: "largest-contentful-paint",
            value: entry.startTime,
            page: pageName,
            timestamp: Date.now()
          });
        }

        if (entry.entryType === "first-input") {
          const fidEntry = entry as PerformanceEventTiming;
          trackPerformanceMetric({
            name: "first-input-delay",
            value: fidEntry.processingStart - fidEntry.startTime,
            page: pageName,
            timestamp: Date.now()
          });
        }
      });
    });

    observer.observe({
      entryTypes: ["navigation", "largest-contentful-paint", "first-input"]
    });

    return () => observer.disconnect();
  }, [pageName]);
}

// Hook for monitoring memory usage
export function useMemoryMonitoring() {
  useEffect(() => {
    const checkMemory = () => {
      if ("memory" in performance) {
        const memInfo = (
          performance as {
            memory: {
              usedJSHeapSize: number;
              totalJSHeapSize: number;
              jsHeapSizeLimit: number;
            };
          }
        ).memory;

        trackPerformanceMetric({
          name: "memory-usage",
          value: memInfo.usedJSHeapSize,
          total: memInfo.totalJSHeapSize,
          limit: memInfo.jsHeapSizeLimit,
          timestamp: Date.now()
        });
      }
    };

    const interval = setInterval(checkMemory, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, []);
}

// Performance metric tracking function
interface PerformanceMetric {
  name: string;
  value: number;
  timestamp: number;
  [key: string]: string | number | boolean;
}

function trackPerformanceMetric(metric: PerformanceMetric) {
  // In development, log to console
  if (process.env.NODE_ENV === "development") {
    console.log("Performance Metric:", metric);
  }

  // Store in localStorage for debugging (with size limit)
  try {
    const metrics = JSON.parse(
      localStorage.getItem("dhamma-performance-metrics") || "[]"
    );
    metrics.push(metric);

    // Keep only last 100 metrics to prevent storage overflow
    if (metrics.length > 100) {
      metrics.splice(0, metrics.length - 100);
    }

    localStorage.setItem("dhamma-performance-metrics", JSON.stringify(metrics));
  } catch (error) {
    console.warn("Failed to store performance metric:", error);
  }

  // In production, send to analytics service
  if (process.env.NODE_ENV === "production" && typeof window !== "undefined") {
    // Example: Send to Google Analytics, PostHog, or other analytics service
    // gtag('event', 'performance_metric', {
    //   metric_name: metric.name,
    //   metric_value: metric.value,
    //   custom_parameter: metric
    // });
  }
}

// Utility to get performance insights
export function getPerformanceInsights(): PerformanceMetric[] {
  try {
    return JSON.parse(
      localStorage.getItem("dhamma-performance-metrics") || "[]"
    );
  } catch {
    return [];
  }
}

// Clear performance data
export function clearPerformanceData() {
  try {
    localStorage.removeItem("dhamma-performance-metrics");
  } catch (error) {
    console.warn("Failed to clear performance data:", error);
  }
}
