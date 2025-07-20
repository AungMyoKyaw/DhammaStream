"use client";

import { FeatureIcons } from "@/components/ui/icons";

interface DefaultMediaCoverProps {
  type: "video" | "audio";
  title?: string;
  className?: string;
}

export default function DefaultMediaCover({
  type,
  title,
  className = ""
}: DefaultMediaCoverProps) {
  const Icon = type === "video" ? FeatureIcons.Play : FeatureIcons.Volume;

  return (
    <div
      className={`flex flex-col items-center justify-center bg-gradient-to-br from-orange-50 to-amber-50 dark:from-gray-800 dark:to-gray-700 ${className}`}
      style={{ aspectRatio: type === "video" ? "16/9" : "auto" }}
    >
      <div className="flex flex-col items-center space-y-4">
        <div className="w-20 h-20 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center">
          <Icon className="w-10 h-10 text-orange-600 dark:text-orange-400" />
        </div>
        {title && (
          <h3 className="text-lg font-medium text-gray-900 dark:text-white text-center px-4">
            {title}
          </h3>
        )}
        <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
          {type === "video"
            ? "Video content ready to play"
            : "Audio content ready to play"}
        </p>
      </div>
    </div>
  );
}
