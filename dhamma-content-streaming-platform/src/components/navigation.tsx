"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
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
import { Search, Play, Users, BookOpen } from "lucide-react";

export function Navigation() {
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-lg transition-shadow duration-300">
      <div className="container flex h-16 items-center justify-between">
        {/* Brand/Logo */}
        <Link href="/" className="flex items-center space-x-3 group">
          <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-primary to-accent flex items-center justify-center shadow-md group-hover:scale-105 group-hover:shadow-xl transition-transform duration-200">
            <Play className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="font-extrabold text-xl tracking-tight text-primary group-hover:text-accent transition-colors duration-200">
            DhammaStream
          </span>
        </Link>

        {/* Navigation */}
        <nav className="hidden md:flex items-center space-x-2">
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
                  <Link href="/speakers">
                    <Users className="mr-2 h-5 w-5" />
                    Speakers
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

        {/* Search Button */}
        <div className="flex items-center">
          <Button
            asChild
            variant="outline"
            size="sm"
            className="h-9 w-40 lg:w-64 rounded-lg shadow-sm transition-all duration-200 hover:bg-primary/10 hover:text-primary focus:bg-primary/20 focus:text-primary"
          >
            <Link href="/search">
              <Search className="mr-2 h-4 w-4" />
              Search content...
            </Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
