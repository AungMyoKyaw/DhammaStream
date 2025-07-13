"use client";

import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { Moon, Sun, Monitor } from "lucide-react";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger
} from "@/components/ui/navigation-menu";
import { cn } from "@/lib/utils";

export function ThemeToggle() {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  // useEffect only runs on the client, so now we can safely show the UI
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <Button variant="outline" size="sm" className="h-9 w-9">
        <Sun className="h-4 w-4" />
        <span className="sr-only">Toggle theme</span>
      </Button>
    );
  }

  return (
    <NavigationMenu>
      <NavigationMenuList>
        <NavigationMenuItem>
          <NavigationMenuTrigger asChild>
            <Button variant="outline" size="sm" className="h-9 w-9 p-0">
              {(() => {
                if (theme === "light") return <Sun className="h-4 w-4" />;
                if (theme === "dark") return <Moon className="h-4 w-4" />;
                return <Monitor className="h-4 w-4" />;
              })()}
              <span className="sr-only">Toggle theme</span>
            </Button>
          </NavigationMenuTrigger>
          <NavigationMenuContent>
            <div className="grid w-48 p-2">
              <NavigationMenuLink asChild>
                <button
                  type="button"
                  onClick={() => setTheme("light")}
                  className={cn(
                    "flex items-center rounded-lg px-3 py-2 text-sm transition-all duration-200 hover:bg-accent hover:text-accent-foreground",
                    theme === "light" && "bg-accent text-accent-foreground"
                  )}
                >
                  <Sun className="mr-2 h-4 w-4" />
                  Light
                </button>
              </NavigationMenuLink>
              <NavigationMenuLink asChild>
                <button
                  type="button"
                  onClick={() => setTheme("dark")}
                  className={cn(
                    "flex items-center rounded-lg px-3 py-2 text-sm transition-all duration-200 hover:bg-accent hover:text-accent-foreground",
                    theme === "dark" && "bg-accent text-accent-foreground"
                  )}
                >
                  <Moon className="mr-2 h-4 w-4" />
                  Dark
                </button>
              </NavigationMenuLink>
              <NavigationMenuLink asChild>
                <button
                  type="button"
                  onClick={() => setTheme("system")}
                  className={cn(
                    "flex items-center rounded-lg px-3 py-2 text-sm transition-all duration-200 hover:bg-accent hover:text-accent-foreground",
                    theme === "system" && "bg-accent text-accent-foreground"
                  )}
                >
                  <Monitor className="mr-2 h-4 w-4" />
                  System
                </button>
              </NavigationMenuLink>
            </div>
          </NavigationMenuContent>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  );
}
