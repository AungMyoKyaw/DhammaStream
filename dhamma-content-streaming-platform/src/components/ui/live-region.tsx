"use client";
import {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo
} from "react";
import type { ReactNode } from "react";

interface LiveRegionContextType {
  announce: (message: string, priority?: "polite" | "assertive") => void;
}

const LiveRegionContext = createContext<LiveRegionContextType | null>(null);

interface LiveRegionProviderProps {
  children: ReactNode;
}

export function LiveRegionProvider({ children }: LiveRegionProviderProps) {
  const [messages, setMessages] = useState<
    Array<{
      id: string;
      message: string;
      priority: "polite" | "assertive";
    }>
  >([]);

  const removeMessage = useCallback((id: string) => {
    setMessages((prev) => prev.filter((m) => m.id !== id));
  }, []);

  const announce = useCallback(
    (message: string, priority: "polite" | "assertive" = "polite") => {
      const id = Date.now().toString();
      const newMessage = { id, message, priority };

      setMessages((prev) => [...prev, newMessage]);

      // Clear message after announcement
      setTimeout(() => removeMessage(id), 1000);
    },
    [removeMessage]
  );

  const contextValue = useMemo(() => ({ announce }), [announce]);

  const politeMessages = messages.filter((m) => m.priority === "polite");
  const assertiveMessages = messages.filter((m) => m.priority === "assertive");

  return (
    <LiveRegionContext.Provider value={contextValue}>
      {children}

      {/* Polite announcements */}
      <div
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
        id="polite-announcer"
      >
        {politeMessages.map((m) => (
          <div key={m.id}>{m.message}</div>
        ))}
      </div>

      {/* Assertive announcements */}
      <div
        aria-live="assertive"
        aria-atomic="true"
        className="sr-only"
        id="assertive-announcer"
      >
        {assertiveMessages.map((m) => (
          <div key={m.id}>{m.message}</div>
        ))}
      </div>
    </LiveRegionContext.Provider>
  );
}

export function useLiveRegion() {
  const context = useContext(LiveRegionContext);
  if (!context) {
    throw new Error("useLiveRegion must be used within LiveRegionProvider");
  }
  return context;
}
