"use client";

import { useEffect, useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Activity, Clock, Zap, Smartphone, Wifi, Eye, X } from "lucide-react";

interface PerformanceMetrics {
  // Core Web Vitals
  fcp: number | null; // First Contentful Paint
  lcp: number | null; // Largest Contentful Paint
  cls: number | null; // Cumulative Layout Shift
  fid: number | null; // First Input Delay
  ttfb: number | null; // Time to First Byte

  // Additional metrics
  domLoad: number | null;
  windowLoad: number | null;
  networkEffectiveType: string | null;
  deviceMemory: number | null;

  // Custom metrics
  interactionCount: number;
  errorCount: number;
  sessionDuration: number;
}

interface PerformanceAlert {
  id: string;
  type: "error" | "warning" | "info";
  metric: string;
  value: number;
  threshold: number;
  message: string;
  timestamp: number;
}

const PERFORMANCE_THRESHOLDS = {
  fcp: { good: 1800, poor: 3000 }, // ms
  lcp: { good: 2500, poor: 4000 }, // ms
  cls: { good: 0.1, poor: 0.25 }, // score
  fid: { good: 100, poor: 300 }, // ms
  ttfb: { good: 800, poor: 1800 } // ms
};

export function PerformanceMonitor() {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    fcp: null,
    lcp: null,
    cls: null,
    fid: null,
    ttfb: null,
    domLoad: null,
    windowLoad: null,
    networkEffectiveType: null,
    deviceMemory: null,
    interactionCount: 0,
    errorCount: 0,
    sessionDuration: 0
  });

  const [alerts, setAlerts] = useState<PerformanceAlert[]>([]);
  const [isMinimized, setIsMinimized] = useState(false);
  const [sessionStart] = useState(Date.now());

  // Get performance rating
  const getPerformanceRating = useCallback(
    (metric: string, value: number): "good" | "needs-improvement" | "poor" => {
      const thresholds =
        PERFORMANCE_THRESHOLDS[metric as keyof typeof PERFORMANCE_THRESHOLDS];
      if (!thresholds) return "good";

      if (value <= thresholds.good) return "good";
      if (value <= thresholds.poor) return "needs-improvement";
      return "poor";
    },
    []
  );

  // Add performance alert
  const addAlert = useCallback(
    (alert: Omit<PerformanceAlert, "id" | "timestamp">) => {
      const newAlert: PerformanceAlert = {
        ...alert,
        id: Math.random().toString(36).substr(2, 9),
        timestamp: Date.now()
      };

      setAlerts((prev) => [...prev.slice(-4), newAlert]); // Keep only last 5 alerts
    },
    []
  );

  // Collect Core Web Vitals
  useEffect(() => {
    if (typeof window === "undefined") return;

    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        switch (entry.entryType) {
          case "paint": {
            if (entry.name === "first-contentful-paint") {
              const fcp = entry.startTime;
              setMetrics((prev) => ({ ...prev, fcp }));

              const rating = getPerformanceRating("fcp", fcp);
              if (rating === "poor") {
                addAlert({
                  type: "warning",
                  metric: "FCP",
                  value: fcp,
                  threshold: PERFORMANCE_THRESHOLDS.fcp.poor,
                  message: "First Contentful Paint is slower than recommended"
                });
              }
            }
            break;
          }

          case "largest-contentful-paint": {
            const lcp = entry.startTime;
            setMetrics((prev) => ({ ...prev, lcp }));

            const lcpRating = getPerformanceRating("lcp", lcp);
            if (lcpRating === "poor") {
              addAlert({
                type: "warning",
                metric: "LCP",
                value: lcp,
                threshold: PERFORMANCE_THRESHOLDS.lcp.poor,
                message: "Largest Contentful Paint is slower than recommended"
              });
            }
            break;
          }

          case "layout-shift": {
            const layoutShiftEntry = entry as PerformanceEntry & {
              hadRecentInput?: boolean;
              value?: number;
            };
            if (!layoutShiftEntry.hadRecentInput) {
              setMetrics((prev) => ({
                ...prev,
                cls: (prev.cls || 0) + (layoutShiftEntry.value || 0)
              }));
            }
            break;
          }

          case "first-input": {
            const firstInputEntry = entry as PerformanceEntry & {
              processingStart?: number;
            };
            const fid =
              (firstInputEntry.processingStart || 0) - entry.startTime;
            setMetrics((prev) => ({ ...prev, fid }));

            const fidRating = getPerformanceRating("fid", fid);
            if (fidRating === "poor") {
              addAlert({
                type: "warning",
                metric: "FID",
                value: fid,
                threshold: PERFORMANCE_THRESHOLDS.fid.poor,
                message: "First Input Delay is higher than recommended"
              });
            }
            break;
          }

          case "navigation": {
            const nav = entry as PerformanceNavigationTiming;
            const ttfb = nav.responseStart - nav.requestStart;
            const domLoad = nav.domContentLoadedEventEnd - nav.fetchStart;
            const windowLoad = nav.loadEventEnd - nav.fetchStart;

            setMetrics((prev) => ({
              ...prev,
              ttfb,
              domLoad,
              windowLoad
            }));

            const ttfbRating = getPerformanceRating("ttfb", ttfb);
            if (ttfbRating === "poor") {
              addAlert({
                type: "warning",
                metric: "TTFB",
                value: ttfb,
                threshold: PERFORMANCE_THRESHOLDS.ttfb.poor,
                message: "Time to First Byte is slower than recommended"
              });
            }
            break;
          }
        }
      }
    });

    // Observe different entry types
    try {
      observer.observe({
        entryTypes: [
          "paint",
          "largest-contentful-paint",
          "layout-shift",
          "first-input",
          "navigation"
        ]
      });
    } catch (error) {
      console.warn("Performance observer not supported:", error);
    }

    return () => observer.disconnect();
  }, [getPerformanceRating, addAlert]);

  // Track device and network information
  useEffect(() => {
    if (typeof window === "undefined") return;

    // Network information - with proper typing
    interface NavigatorWithConnection extends Navigator {
      connection?: {
        effectiveType?: string;
      };
      mozConnection?: {
        effectiveType?: string;
      };
      webkitConnection?: {
        effectiveType?: string;
      };
      deviceMemory?: number;
    }

    const nav = navigator as NavigatorWithConnection;
    const connection =
      nav.connection || nav.mozConnection || nav.webkitConnection;
    if (connection) {
      setMetrics((prev) => ({
        ...prev,
        networkEffectiveType: connection.effectiveType || null
      }));
    }

    // Device memory
    if (nav.deviceMemory) {
      setMetrics((prev) => ({
        ...prev,
        deviceMemory: nav.deviceMemory || null
      }));
    }
  }, []);

  // Track session duration
  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics((prev) => ({
        ...prev,
        sessionDuration: Date.now() - sessionStart
      }));
    }, 1000);

    return () => clearInterval(interval);
  }, [sessionStart]);

  // Track interactions and errors
  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleInteraction = () => {
      setMetrics((prev) => ({
        ...prev,
        interactionCount: prev.interactionCount + 1
      }));
    };

    const handleError = () => {
      setMetrics((prev) => ({
        ...prev,
        errorCount: prev.errorCount + 1
      }));

      addAlert({
        type: "error",
        metric: "Error",
        value: metrics.errorCount + 1,
        threshold: 0,
        message: "JavaScript error detected"
      });
    };

    window.addEventListener("click", handleInteraction);
    window.addEventListener("keydown", handleInteraction);
    window.addEventListener("error", handleError);
    window.addEventListener("unhandledrejection", handleError);

    return () => {
      window.removeEventListener("click", handleInteraction);
      window.removeEventListener("keydown", handleInteraction);
      window.removeEventListener("error", handleError);
      window.removeEventListener("unhandledrejection", handleError);
    };
  }, [addAlert, metrics.errorCount]);

  // Format duration
  const formatDuration = useCallback((ms: number) => {
    if (ms < 1000) return `${Math.round(ms)}ms`;
    const seconds = Math.round(ms / 1000);
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    return `${minutes}m ${seconds % 60}s`;
  }, []);

  // Get metric badge variant
  const getMetricVariant = useCallback(
    (metric: string, value: number | null) => {
      if (value === null) return "outline";
      const rating = getPerformanceRating(metric, value);
      switch (rating) {
        case "good":
          return "default";
        case "needs-improvement":
          return "secondary";
        case "poor":
          return "destructive";
        default:
          return "outline";
      }
    },
    [getPerformanceRating]
  );

  if (process.env.NODE_ENV !== "development") {
    return null; // Only show in development
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm">
      <Card className="border-2 shadow-lg">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Performance Monitor
            </CardTitle>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMinimized(!isMinimized)}
                className="h-6 w-6 p-0"
              >
                {isMinimized ? (
                  <Eye className="h-3 w-3" />
                ) : (
                  <X className="h-3 w-3" />
                )}
              </Button>
            </div>
          </div>
        </CardHeader>

        {!isMinimized && (
          <CardContent className="space-y-4">
            {/* Core Web Vitals */}
            <div className="space-y-2">
              <h4 className="text-xs font-medium text-muted-foreground">
                Core Web Vitals
              </h4>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="flex items-center justify-between">
                  <span>FCP:</span>
                  <Badge
                    variant={getMetricVariant("fcp", metrics.fcp)}
                    className="text-xs"
                  >
                    {metrics.fcp ? formatDuration(metrics.fcp) : "N/A"}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>LCP:</span>
                  <Badge
                    variant={getMetricVariant("lcp", metrics.lcp)}
                    className="text-xs"
                  >
                    {metrics.lcp ? formatDuration(metrics.lcp) : "N/A"}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>CLS:</span>
                  <Badge
                    variant={getMetricVariant("cls", metrics.cls)}
                    className="text-xs"
                  >
                    {metrics.cls ? metrics.cls.toFixed(3) : "N/A"}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>FID:</span>
                  <Badge
                    variant={getMetricVariant("fid", metrics.fid)}
                    className="text-xs"
                  >
                    {metrics.fid ? formatDuration(metrics.fid) : "N/A"}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Additional Metrics */}
            <div className="space-y-2">
              <h4 className="text-xs font-medium text-muted-foreground">
                Session Info
              </h4>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  <span>{formatDuration(metrics.sessionDuration)}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Zap className="h-3 w-3" />
                  <span>{metrics.interactionCount} interactions</span>
                </div>
                {metrics.networkEffectiveType && (
                  <div className="flex items-center gap-1">
                    <Wifi className="h-3 w-3" />
                    <span>{metrics.networkEffectiveType}</span>
                  </div>
                )}
                {metrics.deviceMemory && (
                  <div className="flex items-center gap-1">
                    <Smartphone className="h-3 w-3" />
                    <span>{metrics.deviceMemory}GB RAM</span>
                  </div>
                )}
              </div>
            </div>

            {/* Alerts */}
            {alerts.length > 0 && (
              <div className="space-y-1">
                <h4 className="text-xs font-medium text-muted-foreground">
                  Recent Alerts
                </h4>
                <div className="space-y-1 max-h-20 overflow-y-auto">
                  {alerts.slice(-3).map((alert) => {
                    let alertStyles =
                      "bg-blue-50 border-blue-400 dark:bg-blue-900/20";
                    if (alert.type === "error") {
                      alertStyles = "bg-destructive/10 border-destructive";
                    } else if (alert.type === "warning") {
                      alertStyles =
                        "bg-yellow-50 border-yellow-400 dark:bg-yellow-900/20";
                    }

                    return (
                      <div
                        key={alert.id}
                        className={`text-xs p-2 rounded border-l-2 ${alertStyles}`}
                      >
                        <div className="font-medium">{alert.metric}</div>
                        <div className="text-muted-foreground">
                          {alert.message}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </CardContent>
        )}
      </Card>
    </div>
  );
}

// Hook to use performance monitoring
export function usePerformanceMonitoring() {
  const [metrics, setMetrics] = useState({
    renderCount: 0,
    renderTime: 0,
    componentName: ""
  });

  const trackRender = useCallback((componentName: string) => {
    const startTime = performance.now();

    return () => {
      const endTime = performance.now();
      const renderTime = endTime - startTime;

      setMetrics((prev) => ({
        ...prev,
        renderCount: prev.renderCount + 1,
        renderTime: renderTime,
        componentName
      }));

      // Log slow renders in development
      if (process.env.NODE_ENV === "development" && renderTime > 16) {
        console.warn(
          `Slow render detected in ${componentName}: ${renderTime.toFixed(2)}ms`
        );
      }
    };
  }, []);

  return { metrics, trackRender };
}
