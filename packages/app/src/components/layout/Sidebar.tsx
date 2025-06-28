import {
  Home,
  Search,
  BookOpen,
  Headphones,
  Video,
  ChevronLeft
} from "lucide-react";
import { Button } from "@/components/common/Button";
import { useAppStore } from "@/store";
import { cn } from "@/utils";
import { NavLink } from "react-router-dom";

const mainNavItems = [
  { icon: Home, label: "Home", path: "/" },
  { icon: Search, label: "Browse", path: "/browse" }
];

const browseItems = [
  { icon: Headphones, label: "Audio Dharma", path: "/audios" },
  { icon: Video, label: "Video Teachings", path: "/videos" },
  { icon: BookOpen, label: "E-books", path: "/pdfs" }
];

export function Sidebar() {
  const { sidebarOpen, setSidebarOpen } = useAppStore();

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
            {/* Discover Section */}
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

            {/* Browse Section */}
            <div>
              <h3 className="mb-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Browse
              </h3>
              <ul className="space-y-1">
                {browseItems.map((item) => (
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
          </nav>
        </div>
      </aside>
    </>
  );
}
