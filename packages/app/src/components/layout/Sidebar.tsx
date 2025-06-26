import {
  Home,
  Search,
  Heart,
  Settings,
  Download,
  Clock,
  BookOpen,
  Headphones,
  Video,
  ChevronLeft
} from "lucide-react";
import { Button } from "@/components/common/Button";
import { useAppStore } from "@/store";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/utils";
import { NavLink } from "react-router-dom";

const mainNavItems = [
  { icon: Home, label: "Home", path: "/" },
  { icon: Search, label: "Browse", path: "/browse" },
  { icon: Clock, label: "Recently Played", path: "/recent" }
];

const libraryItems = [
  { icon: Heart, label: "Favorites", path: "/favorites" },
  { icon: Download, label: "Downloads", path: "/downloads" },
  { icon: Clock, label: "Listening History", path: "/history" }
];

const contentTypes = [
  { icon: Headphones, label: "Audio Dharma", path: "/browse?type=audio" },
  { icon: Video, label: "Video Teachings", path: "/browse?type=video" },
  { icon: BookOpen, label: "E-books", path: "/browse?type=ebook" }
];

export function Sidebar() {
  const { sidebarOpen, setSidebarOpen } = useAppStore();
  const { user } = useAuth();

  return (
    <>
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <button
          type="button"
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
          onKeyDown={(e) => {
            if (e.key === "Escape") setSidebarOpen(false);
          }}
          aria-label="Close sidebar"
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 z-50 h-screen w-64 transform bg-background border-r border-border transition-transform duration-300",
          "md:relative md:z-auto md:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-border">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">D</span>
              </div>
              <span className="text-lg font-bold text-foreground">
                DhammaStream
              </span>
            </div>

            {/* Collapse Button */}
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => setSidebarOpen(false)}
              className="md:hidden"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto p-4 space-y-6">
            {/* Main Navigation */}
            <div>
              <h3 className="mb-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Discover
              </h3>
              <ul className="space-y-1">
                {mainNavItems.map((item) => (
                  <li key={item.path}>
                    <NavLink
                      to={item.path}
                      className={({ isActive }) =>
                        cn(
                          "flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors text-sm font-medium",
                          isActive
                            ? "bg-primary text-primary-foreground"
                            : "text-muted-foreground hover:text-foreground hover:bg-accent"
                        )
                      }
                    >
                      <item.icon className="h-5 w-5" />
                      <span>{item.label}</span>
                    </NavLink>
                  </li>
                ))}
              </ul>
            </div>

            {/* Content Types */}
            <div>
              <h3 className="mb-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Content Types
              </h3>
              <ul className="space-y-1">
                {contentTypes.map((item) => (
                  <li key={item.path}>
                    <NavLink
                      to={item.path}
                      className={({ isActive }) =>
                        cn(
                          "flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors text-sm font-medium",
                          isActive
                            ? "bg-primary text-primary-foreground"
                            : "text-muted-foreground hover:text-foreground hover:bg-accent"
                        )
                      }
                    >
                      <item.icon className="h-5 w-5" />
                      <span>{item.label}</span>
                    </NavLink>
                  </li>
                ))}
              </ul>
            </div>

            {/* Browse Content Types */}
            <div>
              <h3 className="mb-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Browse
              </h3>
              <ul className="space-y-1">
                {contentTypes.map((item) => (
                  <li key={item.path}>
                    <NavLink
                      to={item.path}
                      className={({ isActive }) =>
                        cn(
                          "flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors text-sm font-medium",
                          isActive
                            ? "bg-primary text-primary-foreground"
                            : "text-muted-foreground hover:text-foreground hover:bg-accent"
                        )
                      }
                    >
                      <item.icon className="h-5 w-5" />
                      <span>{item.label}</span>
                    </NavLink>
                  </li>
                ))}
              </ul>
            </div>

            {/* Your Library */}
            {user && (
              <div>
                <h3 className="mb-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Your Library
                </h3>
                <ul className="space-y-1">
                  {libraryItems.map((item) => (
                    <li key={item.path}>
                      <NavLink
                        to={item.path}
                        className={({ isActive }) =>
                          cn(
                            "flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors text-sm font-medium",
                            isActive
                              ? "bg-primary text-primary-foreground"
                              : "text-muted-foreground hover:text-foreground hover:bg-accent"
                          )
                        }
                      >
                        <item.icon className="h-5 w-5" />
                        <span>{item.label}</span>
                      </NavLink>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-border">
            {user ? (
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs font-medium">
                    {user.displayName?.[0] || user.email[0].toUpperCase()}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">
                    {user.displayName || "User"}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {user.email}
                  </p>
                </div>
                <NavLink to="/profile">
                  <Button variant="ghost" size="icon-sm">
                    <Settings className="h-4 w-4" />
                  </Button>
                </NavLink>
              </div>
            ) : (
              <NavLink to="/auth/login" className="w-full">
                <Button className="w-full" size="sm">
                  Sign In
                </Button>
              </NavLink>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}
