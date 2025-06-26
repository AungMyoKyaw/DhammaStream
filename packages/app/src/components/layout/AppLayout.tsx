import type { ReactNode } from "react";
import { Header } from "./Header";
import { Sidebar } from "./Sidebar";
import { MobilePlayer } from "../player/MobilePlayer";
import { useAppStore } from "@/store";
import { cn } from "@/utils";

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const sidebarOpen = useAppStore((state) => state.sidebarOpen);

  return (
    <div className="flex h-screen bg-background text-foreground">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <Header />

        {/* Page Content */}
        <main
          className={cn(
            "flex-1 overflow-y-auto transition-all duration-300",
            sidebarOpen ? "md:ml-0" : ""
          )}
        >
          {children}
        </main>

        {/* Mobile Player (always visible on mobile when content is playing) */}
        <MobilePlayer />
      </div>
    </div>
  );
}
