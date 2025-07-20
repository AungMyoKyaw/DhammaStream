"use client";

import ResponsivePlyrPlayer from "@/components/ResponsivePlyrPlayer";

export default function TestPlayerPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 dark:from-gray-900 dark:to-gray-800 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
          Player Test Page
        </h1>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Video Player Test
          </h2>
          <ResponsivePlyrPlayer
            src="https://www.w3schools.com/html/mov_bbb.mp4"
            type="video"
            contentId={1}
            title="Test Video"
            className="w-full"
            maxHeight="400px"
          />
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Audio Player Test
          </h2>
          <ResponsivePlyrPlayer
            src="https://www.soundjay.com/misc/sounds/bell-ringing-05.wav"
            type="audio"
            contentId={2}
            title="Test Audio"
            className="w-full"
          />
        </div>
      </div>
    </div>
  );
}
