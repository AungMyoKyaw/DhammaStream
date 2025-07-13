"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger
} from "@/components/ui/navigation-menu";
import { cn } from "@/lib/utils";
import { Search, Play, Users, BookOpen, Menu, X } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";

export function Navigation() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const isActive = (path: string) => pathname === path;

  // Handle mobile menu toggle
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]); // This is correct - we want to close the menu when pathname changes

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-lg transition-shadow duration-300">
      <div className="container flex h-16 min-w-0 items-center justify-between gap-x-8">
        {/* Brand/Logo */}
        <div className="flex items-center min-w-0">
          <Link href="/" className="flex items-center space-x-3 group min-w-0">
            <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-primary to-accent flex items-center justify-center shadow-md group-hover:scale-105 group-hover:shadow-xl transition-transform duration-200">
              <Play className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="font-extrabold text-xl tracking-tight text-primary group-hover:text-primary/80 transition-colors duration-200 truncate">
              DhammaStream
            </span>
          </Link>
        </div>

        {/* Desktop Navigation - centered, flex-1 for perfect alignment */}
        <nav
          className="hidden md:flex flex-1 items-center justify-center min-w-0"
          aria-label="Main navigation"
        >
          <NavigationMenu>
            <NavigationMenuList>
              <NavigationMenuItem>
                <NavigationMenuLink
                  asChild
                  className={cn(
                    "group inline-flex h-10 w-max items-center justify-center rounded-lg px-5 py-2 text-base font-semibold transition-all duration-200 hover:bg-primary/10 hover:text-primary focus:bg-primary/20 focus:text-primary focus:outline-none data-[active]:bg-primary/20 data-[state=open]:bg-primary/20",
                    isActive("/content") && "bg-primary/20 text-primary"
                  )}
                >
                  <Link href="/content">Browse Content</Link>
                </NavigationMenuLink>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuLink
                  asChild
                  className={cn(
                    "group inline-flex h-10 w-max items-center justify-center rounded-lg px-5 py-2 text-base font-semibold transition-all duration-200 hover:bg-primary/10 hover:text-primary focus:bg-primary/20 focus:text-primary focus:outline-none data-[active]:bg-primary/20 data-[state=open]:bg-primary/20",
                    isActive("/speakers") && "bg-primary/20 text-primary"
                  )}
                >
                  <Link
                    href="/speakers"
                    className="flex flex-row items-center gap-2"
                  >
                    <Users className="h-5 w-5" aria-hidden="true" />
                    <span className="leading-none">Speakers</span>
                  </Link>
                </NavigationMenuLink>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuTrigger className="rounded-lg px-5 py-2 text-base font-semibold transition-all duration-200 hover:bg-primary/10 hover:text-primary focus:bg-primary/20 focus:text-primary">
                  Categories
                </NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul className="grid gap-3 p-4 md:w-[400px] lg:w-[500px] lg:grid-cols-[.75fr_1fr]">
                    <li className="row-span-3">
                      <NavigationMenuLink asChild>
                        <Link
                          className="flex h-full w-full select-none flex-col justify-end rounded-lg bg-gradient-to-b from-muted/50 to-muted p-6 no-underline outline-none focus:shadow-md hover:scale-105 transition-transform duration-200"
                          href="/categories"
                        >
                          <BookOpen className="h-6 w-6" />
                          <div className="mb-2 mt-4 text-lg font-semibold">
                            All Categories
                          </div>
                          <p className="text-sm leading-tight text-muted-foreground">
                            Explore content organized by topics and themes
                          </p>
                        </Link>
                      </NavigationMenuLink>
                    </li>
                    <li>
                      <NavigationMenuLink asChild>
                        <Link
                          href="/categories/audio"
                          className="block select-none space-y-1 rounded-lg p-3 leading-none no-underline outline-none transition-all duration-200 hover:bg-primary/10 hover:text-primary focus:bg-primary/20 focus:text-primary hover:scale-105"
                        >
                          <div className="text-base font-semibold leading-none">
                            Audio
                          </div>
                          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                            Dharma talks and audio content
                          </p>
                        </Link>
                      </NavigationMenuLink>
                    </li>
                    <li>
                      <NavigationMenuLink asChild>
                        <Link
                          href="/categories/video"
                          className="block select-none space-y-1 rounded-lg p-3 leading-none no-underline outline-none transition-all duration-200 hover:bg-primary/10 hover:text-primary focus:bg-primary/20 focus:text-primary hover:scale-105"
                        >
                          <div className="text-base font-semibold leading-none">
                            Video
                          </div>
                          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                            Video teachings and presentations
                          </p>
                        </Link>
                      </NavigationMenuLink>
                    </li>
                    <li>
                      <NavigationMenuLink asChild>
                        <Link
                          href="/categories/ebook"
                          className="block select-none space-y-1 rounded-lg p-3 leading-none no-underline outline-none transition-all duration-200 hover:bg-primary/10 hover:text-primary focus:bg-primary/20 focus:text-primary hover:scale-105"
                        >
                          <div className="text-base font-semibold leading-none">
                            Ebooks
                          </div>
                          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                            Digital books and texts
                          </p>
                        </Link>
                      </NavigationMenuLink>
                    </li>
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
        </nav>

        {/* Mobile Menu Button & Search - right aligned */}
        <div className="flex items-center gap-2 min-w-0">
          {/* Theme Toggle - Always visible */}
          <ThemeToggle />

          {/* Search Button - Hidden on mobile, replaced with compact version */}
          <Button
            asChild
            variant="outline"
            size="sm"
            className="hidden sm:flex h-9 w-40 lg:w-64 rounded-lg shadow-sm transition-all duration-200 hover:bg-primary/10 hover:text-primary focus:bg-primary/20 focus:text-primary focus-visible:ring-2 focus-visible:ring-primary/80"
          >
            <Link href="/search" aria-label="Search content">
              <Search className="mr-2 h-4 w-4" />
              Search content...
            </Link>
          </Button>

          {/* Mobile Search Button - Compact version for mobile */}
          <Button
            asChild
            variant="outline"
            size="sm"
            className="sm:hidden h-9 w-9 rounded-lg shadow-sm transition-all duration-200 hover:bg-primary/10 hover:text-primary focus:bg-primary/20 focus:text-primary focus-visible:ring-2 focus-visible:ring-primary/80"
          >
            <Link href="/search" aria-label="Search content">
              <Search className="h-4 w-4" />
            </Link>
          </Button>

          {/* Mobile Menu Button */}
          <Button
            variant="outline"
            size="sm"
            className="md:hidden h-9 w-9 rounded-lg shadow-sm transition-all duration-200 hover:bg-primary/10 hover:text-primary focus:bg-primary/20 focus:text-primary focus-visible:ring-2 focus-visible:ring-primary/80"
            onClick={toggleMobileMenu}
            aria-controls="mobile-navigation"
            aria-expanded={isMobileMenuOpen}
            aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
          >
            {isMobileMenuOpen ? (
              <X className="h-4 w-4" />
            ) : (
              <Menu className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      {isMobileMenuOpen && (
        <div
          id="mobile-navigation"
          className="md:hidden border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 animate-in slide-in-from-top-5 duration-200"
        >
          <nav className="container py-4" aria-label="Mobile navigation">
            <div className="flex flex-col space-y-3">
              <Link
                href="/content"
                className={cn(
                  "flex items-center rounded-lg px-4 py-3 text-base font-semibold transition-all duration-200 hover:bg-primary/10 hover:text-primary focus:bg-primary/20 focus:text-primary focus-visible:ring-2 focus-visible:ring-primary/80",
                  isActive("/content") && "bg-primary/20 text-primary"
                )}
                tabIndex={0}
              >
                <BookOpen className="mr-3 h-5 w-5" />
                Browse Content
              </Link>

              <Link
                href="/speakers"
                className={cn(
                  "flex items-center rounded-lg px-4 py-3 text-base font-semibold transition-all duration-200 hover:bg-primary/10 hover:text-primary focus:bg-primary/20 focus:text-primary focus-visible:ring-2 focus-visible:ring-primary/80",
                  isActive("/speakers") && "bg-primary/20 text-primary"
                )}
                tabIndex={0}
              >
                <Users className="mr-3 h-5 w-5" />
                Speakers
              </Link>

              {/* Categories in mobile menu */}
              <div className="px-4 py-2">
                <h3 className="text-sm font-semibold text-muted-foreground mb-3">
                  Categories
                </h3>
                <div className="flex flex-col space-y-2 ml-4">
                  <Link
                    href="/categories/audio"
                    className="flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200 hover:bg-primary/10 hover:text-primary focus:bg-primary/20 focus:text-primary focus-visible:ring-2 focus-visible:ring-primary/80"
                    tabIndex={0}
                  >
                    Audio
                  </Link>
                  <Link
                    href="/categories/video"
                    className="flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200 hover:bg-primary/10 hover:text-primary focus:bg-primary/20 focus:text-primary focus-visible:ring-2 focus-visible:ring-primary/80"
                    tabIndex={0}
                  >
                    Video
                  </Link>
                  <Link
                    href="/categories/ebook"
                    className="flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200 hover:bg-primary/10 hover:text-primary focus:bg-primary/20 focus:text-primary focus-visible:ring-2 focus-visible:ring-primary/80"
                    tabIndex={0}
                  >
                    Ebooks
                  </Link>
                  <Link
                    href="/categories"
                    className="flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200 hover:bg-primary/10 hover:text-primary focus:bg-primary/20 focus:text-primary border-t pt-3 mt-2 focus-visible:ring-2 focus-visible:ring-primary/80"
                    tabIndex={0}
                  >
                    All Categories
                  </Link>
                </div>
              </div>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
