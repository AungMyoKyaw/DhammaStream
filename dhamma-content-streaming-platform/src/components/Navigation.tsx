"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useState, useEffect } from "react";

interface NavigationProps {
  readonly className?: string;
}

export function Navigation({ className = "" }: NavigationProps) {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [navigatingTo, setNavigatingTo] = useState<string | null>(null);

  // Clear navigation state when pathname changes
  useEffect(() => {
    setNavigatingTo(null);
  }, [pathname]);

  const handleNavClick = (href: string) => {
    if (href !== pathname) {
      setNavigatingTo(href);
    }
    setIsMobileMenuOpen(false);
  };

  const isActive = (path: string) => {
    if (path === "/speakers") {
      return pathname === "/speakers" || pathname.startsWith("/speakers/");
    }
    if (path.startsWith("/browse/")) {
      return pathname.startsWith(path);
    }
    return pathname === path;
  };

  const getLinkClasses = (path: string) => {
    const baseClasses =
      "transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 rounded-md px-2 py-1";
    const activeClasses = "text-orange-600 dark:text-orange-400 font-medium";
    const inactiveClasses =
      "text-gray-600 hover:text-orange-600 dark:text-gray-300 dark:hover:text-orange-400";
    const loadingClasses = "opacity-75 pointer-events-none";

    const isNavigating = navigatingTo === path;
    return `${baseClasses} ${isActive(path) ? activeClasses : inactiveClasses} ${isNavigating ? loadingClasses : ""}`;
  };

  const navLinks = [
    { href: "/speakers", label: "Teachers" },
    { href: "/browse/video", label: "Videos" },
    { href: "/browse/audio", label: "Audio" },
    { href: "/browse/ebook", label: "Books" }
  ];

  return (
    <header
      className={`bg-white shadow-sm border-b border-orange-100 dark:bg-gray-900 dark:border-gray-700 ${className}`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4 md:py-6">
          <Link
            href="/"
            className="flex items-center focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 rounded-md"
          >
            <h1 className="text-2xl md:text-3xl font-bold text-orange-600 dark:text-orange-400">
              DhammaStream
            </h1>
          </Link>

          <div className="flex items-center space-x-3 md:space-x-6">
            {/* Desktop Navigation */}
            <nav className="hidden md:flex space-x-6">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={getLinkClasses(link.href)}
                  onClick={() => handleNavClick(link.href)}
                >
                  <span className="flex items-center gap-2">
                    {link.label}
                    {navigatingTo === link.href && (
                      <div className="animate-spin rounded-full h-3 w-3 border border-orange-600 dark:border-orange-400 border-t-transparent"></div>
                    )}
                  </span>
                </Link>
              ))}
            </nav>

            {/* Mobile menu button */}
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-md text-gray-600 hover:text-orange-600 dark:text-gray-300 dark:hover:text-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 transition-colors"
              aria-label="Toggle navigation menu"
              aria-expanded={isMobileMenuOpen}
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                {isMobileMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>

            <ThemeToggle />
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden pb-4 border-t border-orange-100 dark:border-gray-700">
            <nav className="flex flex-col space-y-1 pt-4">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`${getLinkClasses(link.href)} block py-3 text-lg`}
                  onClick={() => handleNavClick(link.href)}
                >
                  <span className="flex items-center gap-2">
                    {link.label}
                    {navigatingTo === link.href && (
                      <div className="animate-spin rounded-full h-3 w-3 border border-orange-600 dark:border-orange-400 border-t-transparent"></div>
                    )}
                  </span>
                </Link>
              ))}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
