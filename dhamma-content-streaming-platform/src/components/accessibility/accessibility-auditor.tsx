"use client";

import { useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Eye,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Scan,
  RefreshCw,
  ChevronDown,
  ChevronUp
} from "lucide-react";

interface AccessibilityIssue {
  id: string;
  severity: "error" | "warning" | "info";
  category:
    | "keyboard"
    | "color-contrast"
    | "alt-text"
    | "aria-labels"
    | "focus"
    | "structure";
  element: string;
  description: string;
  recommendation: string;
  location?: string;
}

interface AccessibilityReport {
  score: number;
  totalChecks: number;
  passedChecks: number;
  issues: AccessibilityIssue[];
  lastScan: number;
}

const ACCESSIBILITY_CHECKS = {
  keyboard: {
    name: "Keyboard Navigation",
    description: "All interactive elements should be accessible via keyboard"
  },
  colorContrast: {
    name: "Color Contrast",
    description: "Text should meet WCAG contrast requirements"
  },
  altText: {
    name: "Alternative Text",
    description: "Images should have meaningful alt text"
  },
  ariaLabels: {
    name: "ARIA Labels",
    description: "Interactive elements should have proper ARIA labels"
  },
  focus: {
    name: "Focus Management",
    description: "Focus should be visible and properly managed"
  },
  structure: {
    name: "Semantic Structure",
    description: "Content should use proper semantic HTML"
  }
};

export function AccessibilityAuditor() {
  const [report, setReport] = useState<AccessibilityReport | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [isMinimized, setIsMinimized] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  // Check for missing alt text
  const checkAltText = useCallback((): AccessibilityIssue[] => {
    const issues: AccessibilityIssue[] = [];
    const images = document.querySelectorAll("img");

    images.forEach((img, index) => {
      if (!img.alt || img.alt.trim() === "") {
        issues.push({
          id: `alt-text-${index}`,
          severity: "error",
          category: "alt-text",
          element: `<img> #${index}`,
          description: "Image missing alternative text",
          recommendation: "Add descriptive alt text for the image content",
          location: img.src ? `Image: ${img.src.slice(-30)}` : undefined
        });
      }
    });

    return issues;
  }, []);

  // Check for missing ARIA labels
  const checkAriaLabels = useCallback((): AccessibilityIssue[] => {
    const issues: AccessibilityIssue[] = [];
    const interactiveElements = document.querySelectorAll(
      "button, a, input, select, textarea"
    );

    interactiveElements.forEach((element, index) => {
      const hasLabel =
        element.getAttribute("aria-label") ||
        element.getAttribute("aria-labelledby") ||
        element.textContent?.trim() ||
        element.querySelector("span:not(.sr-only)")?.textContent?.trim();

      if (!hasLabel) {
        issues.push({
          id: `aria-label-${index}`,
          severity: "warning",
          category: "aria-labels",
          element: `<${element.tagName.toLowerCase()}> #${index}`,
          description: "Interactive element missing accessible label",
          recommendation: "Add aria-label or ensure visible text content",
          location: element.className
            ? `Class: ${element.className.slice(0, 30)}`
            : undefined
        });
      }
    });

    return issues;
  }, []);

  // Check keyboard accessibility
  const checkKeyboardAccess = useCallback((): AccessibilityIssue[] => {
    const issues: AccessibilityIssue[] = [];
    const interactiveElements = document.querySelectorAll(
      'button, a, input, select, textarea, [role="button"], [tabindex]'
    );

    interactiveElements.forEach((element, index) => {
      const tabIndex = element.getAttribute("tabindex");
      const isDisabled = element.hasAttribute("disabled");

      // Check for positive tabindex (anti-pattern)
      if (tabIndex && parseInt(tabIndex) > 0) {
        issues.push({
          id: `keyboard-${index}`,
          severity: "warning",
          category: "keyboard",
          element: `<${element.tagName.toLowerCase()}> #${index}`,
          description: "Element uses positive tabindex",
          recommendation: 'Use tabindex="0" or natural tab order instead'
        });
      }

      // Check for disabled elements that might need better UX
      if (isDisabled && !element.getAttribute("aria-disabled")) {
        issues.push({
          id: `keyboard-disabled-${index}`,
          severity: "info",
          category: "keyboard",
          element: `<${element.tagName.toLowerCase()}> #${index}`,
          description: "Disabled element could use aria-disabled for better UX",
          recommendation:
            'Consider using aria-disabled="true" instead of disabled'
        });
      }
    });

    return issues;
  }, []);

  // Check focus management
  const checkFocusManagement = useCallback((): AccessibilityIssue[] => {
    const issues: AccessibilityIssue[] = [];
    const style = getComputedStyle(document.documentElement);

    // Check if focus indicators are properly styled
    const outlineColor = style.getPropertyValue("--ring");
    if (!outlineColor) {
      issues.push({
        id: "focus-outline",
        severity: "warning",
        category: "focus",
        element: ":root",
        description: "Focus outline color not defined in CSS variables",
        recommendation:
          "Define --ring CSS variable for consistent focus indicators"
      });
    }

    return issues;
  }, []);

  // Check semantic structure
  const checkSemanticStructure = useCallback((): AccessibilityIssue[] => {
    const issues: AccessibilityIssue[] = [];

    // Check for main landmark
    const mains = document.querySelectorAll("main");
    if (mains.length === 0) {
      issues.push({
        id: "semantic-main",
        severity: "error",
        category: "structure",
        element: "document",
        description: "Page missing main landmark",
        recommendation: "Add <main> element to identify primary content area"
      });
    } else if (mains.length > 1) {
      issues.push({
        id: "semantic-main-multiple",
        severity: "warning",
        category: "structure",
        element: "document",
        description: "Multiple main landmarks found",
        recommendation: "Use only one main element per page"
      });
    }

    // Check heading hierarchy
    const headings = document.querySelectorAll("h1, h2, h3, h4, h5, h6");
    let previousLevel = 0;

    headings.forEach((heading, index) => {
      const level = parseInt(heading.tagName.charAt(1));

      if (index === 0 && level !== 1) {
        issues.push({
          id: "heading-start",
          severity: "warning",
          category: "structure",
          element: `<${heading.tagName.toLowerCase()}>`,
          description: "Page should start with h1",
          recommendation: "Use h1 for the main page heading"
        });
      }

      if (level > previousLevel + 1) {
        issues.push({
          id: `heading-skip-${index}`,
          severity: "warning",
          category: "structure",
          element: `<${heading.tagName.toLowerCase()}>`,
          description: `Heading level skipped (${previousLevel} to ${level})`,
          recommendation: "Use consecutive heading levels for proper hierarchy"
        });
      }

      previousLevel = level;
    });

    return issues;
  }, []);

  // Check color contrast (simplified)
  const checkColorContrast = useCallback((): AccessibilityIssue[] => {
    const issues: AccessibilityIssue[] = [];

    // This is a simplified check - in a real implementation,
    // you'd use a proper color contrast algorithm
    const textElements = document.querySelectorAll(
      "p, span, div, a, button, label"
    );

    textElements.forEach((element, index) => {
      const style = getComputedStyle(element);
      const color = style.color;
      const backgroundColor = style.backgroundColor;

      // Simple check for very light text on light backgrounds
      if (color.includes("rgb(255") && backgroundColor.includes("rgb(255")) {
        issues.push({
          id: `contrast-${index}`,
          severity: "warning",
          category: "color-contrast",
          element: `<${element.tagName.toLowerCase()}> #${index}`,
          description: "Potential low color contrast detected",
          recommendation:
            "Verify color contrast meets WCAG requirements (4.5:1 for normal text)"
        });
      }
    });

    return issues.slice(0, 5); // Limit to prevent overwhelming results
  }, []);

  // Run accessibility scan
  const runAccessibilityScan = useCallback(async () => {
    setIsScanning(true);

    // Simulate scanning delay for better UX
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const allIssues: AccessibilityIssue[] = [
      ...checkAltText(),
      ...checkAriaLabels(),
      ...checkKeyboardAccess(),
      ...checkFocusManagement(),
      ...checkSemanticStructure(),
      ...checkColorContrast()
    ];

    const totalChecks = Object.keys(ACCESSIBILITY_CHECKS).length * 5; // Approximate
    const passedChecks = totalChecks - allIssues.length;
    const score = Math.max(0, Math.round((passedChecks / totalChecks) * 100));

    setReport({
      score,
      totalChecks,
      passedChecks,
      issues: allIssues,
      lastScan: Date.now()
    });

    setIsScanning(false);
  }, [
    checkAltText,
    checkAriaLabels,
    checkKeyboardAccess,
    checkFocusManagement,
    checkSemanticStructure,
    checkColorContrast
  ]);

  // Filter issues by category
  const filteredIssues =
    report?.issues.filter(
      (issue) =>
        selectedCategory === "all" || issue.category === selectedCategory
    ) || [];

  // Get severity icon
  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case "error":
        return <XCircle className="h-4 w-4 text-red-500" />;
      case "warning":
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case "info":
        return <CheckCircle className="h-4 w-4 text-blue-500" />;
      default:
        return <CheckCircle className="h-4 w-4" />;
    }
  };

  // Get score color
  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-green-600";
    if (score >= 70) return "text-yellow-600";
    return "text-red-600";
  };

  if (process.env.NODE_ENV !== "development") {
    return null; // Only show in development
  }

  return (
    <div className="fixed bottom-20 right-4 z-50 max-w-md">
      <Card className="border-2 shadow-lg">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2">
              <Eye className="h-4 w-4" />
              Accessibility Audit
            </CardTitle>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={runAccessibilityScan}
                disabled={isScanning}
                className="h-6 w-6 p-0"
              >
                <RefreshCw
                  className={`h-3 w-3 ${isScanning ? "animate-spin" : ""}`}
                />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMinimized(!isMinimized)}
                className="h-6 w-6 p-0"
              >
                {isMinimized ? (
                  <ChevronUp className="h-3 w-3" />
                ) : (
                  <ChevronDown className="h-3 w-3" />
                )}
              </Button>
            </div>
          </div>
        </CardHeader>

        {!isMinimized && (
          <CardContent className="space-y-4">
            {!report && (
              <div className="text-center py-4">
                <Button
                  onClick={runAccessibilityScan}
                  disabled={isScanning}
                  size="sm"
                >
                  <Scan className="h-4 w-4 mr-2" />
                  {isScanning ? "Scanning..." : "Run Accessibility Scan"}
                </Button>
              </div>
            )}

            {report && (
              <>
                {/* Score */}
                <div className="text-center space-y-2">
                  <div
                    className={`text-2xl font-bold ${getScoreColor(report.score)}`}
                  >
                    {report.score}%
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {report.passedChecks}/{report.totalChecks} checks passed
                  </div>
                  <Progress value={report.score} className="h-2" />
                </div>

                {/* Category Filter */}
                <div className="flex flex-wrap gap-1">
                  <Button
                    variant={selectedCategory === "all" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedCategory("all")}
                    className="text-xs h-6"
                  >
                    All ({report.issues.length})
                  </Button>
                  {Object.entries(ACCESSIBILITY_CHECKS).map(([key, check]) => {
                    const count = report.issues.filter(
                      (i) => i.category === key
                    ).length;
                    if (count === 0) return null;

                    return (
                      <Button
                        key={key}
                        variant={
                          selectedCategory === key ? "default" : "outline"
                        }
                        size="sm"
                        onClick={() => setSelectedCategory(key)}
                        className="text-xs h-6"
                      >
                        {check.name} ({count})
                      </Button>
                    );
                  })}
                </div>

                {/* Issues List */}
                {filteredIssues.length > 0 && (
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {filteredIssues.slice(0, 10).map((issue) => (
                      <div
                        key={issue.id}
                        className="text-xs p-2 border rounded-md space-y-1"
                      >
                        <div className="flex items-center gap-2">
                          {getSeverityIcon(issue.severity)}
                          <span className="font-medium">{issue.element}</span>
                          <Badge variant="outline" className="text-xs">
                            {issue.category}
                          </Badge>
                        </div>
                        <div className="text-muted-foreground">
                          {issue.description}
                        </div>
                        <div className="text-blue-600 text-xs">
                          {issue.recommendation}
                        </div>
                        {issue.location && (
                          <div className="text-xs text-muted-foreground">
                            {issue.location}
                          </div>
                        )}
                      </div>
                    ))}
                    {filteredIssues.length > 10 && (
                      <div className="text-xs text-center text-muted-foreground">
                        ... and {filteredIssues.length - 10} more issues
                      </div>
                    )}
                  </div>
                )}

                {filteredIssues.length === 0 && (
                  <div className="text-center py-4 text-green-600">
                    <CheckCircle className="h-8 w-8 mx-auto mb-2" />
                    <div className="text-sm font-medium">Great job!</div>
                    <div className="text-xs text-muted-foreground">
                      No issues found in this category
                    </div>
                  </div>
                )}

                <div className="text-xs text-center text-muted-foreground">
                  Last scan: {new Date(report.lastScan).toLocaleTimeString()}
                </div>
              </>
            )}
          </CardContent>
        )}
      </Card>
    </div>
  );
}
