"use client";

import dynamic from "next/dynamic";

// Dynamically import PlyrPlayer to avoid SSR issues
const DynamicPlyrPlayer = dynamic(() => import("./PlyrPlayer"), {
  ssr: false,
  loading: () => (
    <div className="aspect-video bg-gray-200 rounded flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto mb-2"></div>
        <p className="text-gray-600">Loading player...</p>
      </div>
    </div>
  )
});

// Export the dynamic component as default
export default DynamicPlyrPlayer;

// Re-export types for convenience
export type { PlyrPlayerProps, PlyrPlayerRef } from "./PlyrPlayer";
