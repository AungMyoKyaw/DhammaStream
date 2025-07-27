"use client";
import { useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
// Dynamically import player only on client to prevent SSR document errors
const ReactPlayerComponentSimple = dynamic(
  () => import("@/components/ReactPlayerComponentSimple"),
  { ssr: false }
);

export default function VideoPlayerTestClient() {
  const [selectedVideo, setSelectedVideo] = useState<string>("16:9");

  const testVideos = {
    "16:9": {
      src: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
      title: "16:9 Landscape Video (Big Buck Bunny)",
      description: "Standard widescreen video format"
    },
    "4:3": {
      src: "https://sample-videos.com/zip/10/mp4/SampleVideo_1280x1024_1mb.mp4",
      title: "4:3 Video",
      description: "Traditional TV aspect ratio"
    },
    "9:16": {
      src: "https://sample-videos.com/zip/10/mp4/SampleVideo_360x640_1mb.mp4",
      title: "9:16 Portrait Video",
      description: "Mobile/vertical video format"
    },
    "1:1": {
      src: "https://sample-videos.com/zip/10/mp4/SampleVideo_640x640_1mb.mp4",
      title: "1:1 Square Video",
      description: "Instagram-style square format"
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-orange-100 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <Link href="/" className="flex items-center">
              <h1 className="text-3xl font-bold text-orange-600 dark:text-orange-400">
                DhammaStream
              </h1>
            </Link>
            <div className="text-sm text-gray-600 dark:text-gray-300">
              Video Player Responsiveness Test
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Introduction */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Video Player Responsiveness Test
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-4xl mb-6">
            This page tests the ReactPlayerComponentSimple component with videos
            of different aspect ratios. The player should automatically adapt
            its height based on the video's dimensions while maintaining
            responsiveness across different screen sizes.
          </p>

          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <span className="text-2xl">✅</span>
              </div>
              <div className="ml-3">
                <p className="text-green-800 dark:text-green-200 font-medium">
                  <strong>Fixed:</strong> Video player wrapper now dynamically
                  adjusts to video dimensions
                </p>
                <p className="text-green-700 dark:text-green-300 text-sm mt-1">
                  • Removed forced 16:9 aspect ratio
                  <br />
                  • Added responsive CSS for proper video scaling
                  <br />• Videos now maintain their natural aspect ratio
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Video Selection */}
        <div className="mb-8">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Select Test Video:
          </h3>
          <div className="flex flex-wrap gap-3">
            {Object.entries(testVideos).map(([key, video]) => (
              <button
                key={key}
                type="button"
                onClick={() => setSelectedVideo(key)}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  selectedVideo === key
                    ? "bg-orange-600 text-white"
                    : "bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-orange-50 dark:hover:bg-gray-600"
                } border border-gray-300 dark:border-gray-600`}
              >
                {video.title}
              </button>
            ))}
          </div>
        </div>

        {/* Current Video Display */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Video Player */}
          <div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              {testVideos[selectedVideo as keyof typeof testVideos].title}
            </h3>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-4">
              <ReactPlayerComponentSimple
                src={testVideos[selectedVideo as keyof typeof testVideos].src}
                type="video"
                className="w-full"
                contentId={1}
                title={
                  testVideos[selectedVideo as keyof typeof testVideos].title
                }
              />
            </div>
            <p className="text-gray-600 dark:text-gray-300">
              {testVideos[selectedVideo as keyof typeof testVideos].description}
            </p>
          </div>

          {/* Test Instructions */}
          <div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Testing Checklist
            </h3>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
              <ul className="space-y-3 text-gray-700 dark:text-gray-300">
                <li className="flex items-start">
                  <span className="text-green-600 mr-2">✓</span>
                  <span>
                    Video wrapper adjusts height based on video content
                  </span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-600 mr-2">✓</span>
                  <span>
                    Different aspect ratios display correctly without cropping
                  </span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-600 mr-2">✓</span>
                  <span>
                    Player remains responsive when resizing browser window
                  </span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-600 mr-2">✓</span>
                  <span>Video scales properly on mobile devices</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-600 mr-2">✓</span>
                  <span>
                    Portrait videos don't get forced into landscape containers
                  </span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-600 mr-2">✓</span>
                  <span>Square videos maintain 1:1 aspect ratio</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-600 mr-2">✓</span>
                  <span>Player controls remain accessible and functional</span>
                </li>
              </ul>
            </div>

            {/* Technical Details */}
            <div className="mt-6 bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                Technical Implementation:
              </h4>
              <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                <li>
                  • Removed forced <code>aspectRatio: "16 / 9"</code>
                </li>
                <li>
                  • Added <code>height: auto</code> for dynamic sizing
                </li>
                <li>
                  • Implemented <code>object-fit: contain</code> in CSS
                </li>
                <li>
                  • Container uses <code>position: relative</code>
                </li>
                <li>• maxHeight constraint prevents oversized videos</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Back to Home */}
        <div className="text-center mt-12">
          <Link
            href="/"
            className="inline-block bg-orange-600 text-white px-8 py-3 rounded-lg hover:bg-orange-700 dark:bg-orange-500 dark:hover:bg-orange-600 transition-colors font-medium"
          >
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
