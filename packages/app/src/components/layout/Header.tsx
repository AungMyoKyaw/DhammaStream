import { Search, Menu, Bell, User, Settings, LogOut } from "lucide-react";
import { Button } from "@/components/common/Button";
import { useAppStore } from "@/store";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/utils";
import { useState } from "react";

export function Header() {
  const { setSidebarOpen, sidebarOpen } = useAppStore();
  const { user, logout } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Navigate to search results
      console.log("Searching for:", searchQuery);
    }
  };

  return (
    <header className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border sticky top-0 z-50">
      <div className="flex items-center justify-between px-4 py-3 md:px-6">
        {/* Left Section */}
        <div className="flex items-center space-x-4">
          {/* Mobile Menu Toggle */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            <Menu className="h-5 w-5" />
          </Button>

          {/* Logo */}
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">D</span>
            </div>
            <span className="hidden md:block text-xl font-bold text-foreground">
              DhammaStream
            </span>
          </div>
        </div>

        {/* Center Section - Search */}
        <div className="flex-1 max-w-md mx-4">
          <form onSubmit={handleSearch} className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search dharma content..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={cn(
                "w-full pl-10 pr-4 py-2 bg-muted/50 border border-border rounded-lg",
                "focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent",
                "placeholder:text-muted-foreground text-sm"
              )}
            />
          </form>
        </div>

        {/* Right Section */}
        <div className="flex items-center space-x-2">
          {/* Notifications */}
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
              2
            </span>
          </Button>

          {/* User Menu */}
          {user ? (
            <div className="relative">
              <Button
                variant="ghost"
                className="flex items-center space-x-2 px-3"
                onClick={() => setShowUserMenu(!showUserMenu)}
              >
                <div className="w-6 h-6 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs font-medium">
                    {user.displayName?.[0] || user.email[0].toUpperCase()}
                  </span>
                </div>
                <span className="hidden md:block text-sm font-medium">
                  {user.displayName || user.email}
                </span>
              </Button>

              {/* User Dropdown Menu */}
              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-popover border border-border rounded-md shadow-lg z-50">
                  <div className="py-1">
                    <button
                      type="button"
                      className="w-full px-4 py-2 text-left text-sm hover:bg-accent flex items-center space-x-2"
                    >
                      <User className="h-4 w-4" />
                      <span>Profile</span>
                    </button>
                    <button
                      type="button"
                      className="w-full px-4 py-2 text-left text-sm hover:bg-accent flex items-center space-x-2"
                    >
                      <Settings className="h-4 w-4" />
                      <span>Settings</span>
                    </button>
                    <div className="border-t border-border my-1" />
                    <button
                      type="button"
                      onClick={logout}
                      className="w-full px-4 py-2 text-left text-sm hover:bg-accent flex items-center space-x-2 text-red-600"
                    >
                      <LogOut className="h-4 w-4" />
                      <span>Logout</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <Button variant="default" size="sm">
              Sign In
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
