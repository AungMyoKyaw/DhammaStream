"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { queries } from "@/lib/supabase";

import type { DhammaContentWithRelations } from "@/types/database";
import DynamicPlyrPlayer from "@/components/DynamicPlyrPlayer";

export default function ContentViewPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const { id } = use(params);

  const [content, setContent] = useState<DhammaContentWithRelations | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const contentId = parseInt(id);

  useEffect(() => {
    async function fetchContent() {
      if (!contentId || Number.isNaN(contentId)) {
        setError("Invalid content ID");
        setLoading(false);
        return;
      }
      try {
        const { data: foundContent, error: fetchError } =
          await queries.getContentById(contentId);
        if (fetchError) {
          console.error("Error fetching content:", fetchError);
          setError("Content not found");
        } else if (foundContent) {
          setContent(foundContent);
        } else {
          setError("Content not found");
        }
      } catch (err) {
        console.error("Error fetching content:", err);
        setError("Failed to load content");
      } finally {
        setLoading(false);
      }
    }
    if (contentId) fetchContent();
  }, [contentId]);

  // Extracted labels for clarity and type safety
  let contentTypeLabel = "Books";
  if (content && content.content_type === "video") contentTypeLabel = "Videos";
  else if (content && content.content_type === "audio")
    contentTypeLabel = "Audio";

  // Main return and JSX
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading content...</p>
        </div>
      </div>
    );
  }

  if (error || !content) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50">
        <header className="bg-white shadow-sm border-b border-orange-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-6">
              <Link href="/" className="flex items-center">
                <h1 className="text-3xl font-bold text-orange-600">
                  DhammaStream
                </h1>
              </Link>
            </div>
          </div>
        </header>
        <div className="max-w-4xl mx-auto px-4 py-16 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Content Not Found
          </h2>
          <p className="text-gray-600 mb-8">
            {error || "The requested content could not be found."}
          </p>
          <Link
            href="/"
            className="inline-block bg-orange-600 text-white px-6 py-3 rounded-lg hover:bg-orange-700 transition-colors"
          >
            Return Home
          </Link>
        </div>
      </div>
    );
  }

  const contentTypeConfig = {
    video: { icon: "📹", color: "red" },
    audio: { icon: "🎧", color: "blue" },
    ebook: { icon: "📚", color: "green" },
    other: { icon: "📄", color: "gray" }
  } as const;

  const config =
    contentTypeConfig[content.content_type as keyof typeof contentTypeConfig] ||
    contentTypeConfig.video;

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-orange-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <Link href="/" className="flex items-center">
              <h1 className="text-3xl font-bold text-orange-600">
                DhammaStream
              </h1>
            </Link>
            <nav className="hidden md:flex space-x-6">
              <Link
                href="/speakers"
                className="text-gray-600 hover:text-orange-600 transition-colors"
              >
                Teachers
              </Link>
              <Link
                href="/browse/video"
                className="text-gray-600 hover:text-orange-600 transition-colors"
              >
                Videos
              </Link>
              <Link
                href="/browse/audio"
                className="text-gray-600 hover:text-orange-600 transition-colors"
              >
                Audio
              </Link>
              <Link
                href="/browse/ebook"
                className="text-gray-600 hover:text-orange-600 transition-colors"
              >
                Books
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Breadcrumb */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <nav className="text-sm text-gray-600">
          <Link href="/" className="hover:text-orange-600">
            Home
          </Link>
          <span className="mx-2">›</span>
          <Link
            href={`/browse/${content.content_type}`}
            className="hover:text-orange-600"
          >
            {contentTypeLabel}
          </Link>
          <span className="mx-2">›</span>
          <span className="text-gray-900">{content.title}</span>
        </nav>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Media Player for Video/Audio */}
            {(content.content_type === "video" ||
              content.content_type === "audio") &&
              content.file_url && (
                <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
                  <DynamicPlyrPlayer
                    src={content.file_url}
                    type={content.content_type}
                    width="100%"
                    height={content.content_type === "video" ? "400px" : "80px"}
                  />
                </div>
              )}

            {/* Ebook Content */}
            {content.content_type === "ebook" && (
              <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
                <div className="text-center">
                  <span className="text-6xl mb-4 block">📚</span>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">
                    Digital Book
                  </h3>
                  {content.file_url ? (
                    <a
                      href={content.file_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors"
                    >
                      Open Book
                    </a>
                  ) : (
                    <p className="text-gray-600">Book file not available</p>
                  )}
                </div>
              </div>
            )}

            {/* Content Details */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                {content.title}
              </h1>

              {/* Metadata */}
              <div className="border-t pt-4 space-y-3">
                <div className="flex items-center text-gray-600">
                  <span className="font-medium mr-2">Type:</span>
                  <span className="flex items-center">
                    {config.icon}{" "}
                    {content.content_type.charAt(0).toUpperCase() +
                      content.content_type.slice(1)}
                  </span>
                </div>

                {content.duration_estimate && (
                  <div className="flex items-center text-gray-600">
                    <span className="font-medium mr-2">Duration:</span>
                    <span>
                      {Math.floor(content.duration_estimate / 60)}h{" "}
                      {content.duration_estimate % 60}m
                    </span>
                  </div>
                )}

                {content.category && (
                  <div className="flex items-center text-gray-600">
                    <span className="font-medium mr-2">Category:</span>
                    <span>{content.category.name}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            {/* Speaker Info */}
            {content.speaker && (
              <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  Teacher
                </h3>
                <Link
                  href={`/speakers/${content.speaker.id}`}
                  className="group"
                >
                  <div className="flex items-center space-x-3 group-hover:bg-orange-50 p-3 rounded-lg transition-colors">
                    <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                      {content.speaker.photo_url ? (
                        <Image
                          src={content.speaker.photo_url}
                          alt={content.speaker.name}
                          width={48}
                          height={48}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                      ) : (
                        <span className="text-2xl text-orange-600">🧘‍♂️</span>
                      )}
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 group-hover:text-orange-600 transition-colors">
                        {content.speaker.name}
                      </h4>
                      <p className="text-sm text-gray-600">
                        View all teachings
                      </p>
                    </div>
                  </div>
                </Link>
              </div>
            )}

            {/* Actions */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Actions
              </h3>
              <div className="space-y-3">
                <Link
                  href={`/browse/${content.content_type}`}
                  className="w-full bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors text-center block"
                >
                  More {contentTypeLabel}
                </Link>

                {content.speaker && (
                  <Link
                    href={`/speakers/${content.speaker.id}`}
                    className="w-full bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors text-center block"
                  >
                    More by {content.speaker.name}
                  </Link>
                )}

                <button
                  type="button"
                  onClick={() => router.back()}
                  className="w-full bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  ← Go Back
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
  // End of file
}
