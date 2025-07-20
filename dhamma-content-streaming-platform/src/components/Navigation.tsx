"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useState } from "react";

interface NavigationProps {
  readonly className?: string;
}

export function Navigation({ className = "" }: NavigationProps) {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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

    return `${baseClasses} ${isActive(path) ? activeClasses : inactiveClasses}`;
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
        <div className="flex justify-between items-center py-6">
          <Link
            href="/"
            className="flex items-center focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 rounded-md"
          >
            <h1 className="text-3xl font-bold text-orange-600 dark:text-orange-400">
              DhammaStream
            </h1>
          </Link>

          <div className="flex items-center space-x-6">
            {/* Desktop Navigation */}
            <nav className="hidden md:flex space-x-6">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={getLinkClasses(link.href)}
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* Mobile menu button */}
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-md text-gray-600 hover:text-orange-600 dark:text-gray-300 dark:hover:text-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
              aria-label="Toggle navigation menu"
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
          <div className="md:hidden pb-4 border-t border-orange-100 dark:border-gray-700 mt-4">
            <nav className="flex flex-col space-y-2 pt-4">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`${getLinkClasses(link.href)} block`}
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
