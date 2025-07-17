import { queries } from "@/lib/supabase";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import SearchInput from "@/components/SearchInput";
import PaginationControls from "@/components/PaginationControls";
import {
  getDefaultCoverImage,
  getContentAspectRatio
} from "@/lib/content-images";

interface Props {
  params: Promise<{ type: string }>;
  searchParams: Promise<{ search?: string; page?: string }>;
}

const contentTypes = {
  video: {
    title: "Video Teachings",
    icon: "📹",
    description:
      "Discover inspiring Buddhist video teachings, guided meditations, and dharma talks.",
    color: "red"
  },
  audio: {
    title: "Audio Content",
    icon: "🎧",
    description:
      "Listen to Buddhist podcasts, guided meditations, and spiritual discussions.",
    color: "blue"
  },
  ebook: {
    title: "Digital Books",
    icon: "📚",
    description:
      "Read Buddhist texts, meditation guides, and spiritual literature.",
    color: "green"
  }
};

export default async function BrowsePage({ params, searchParams }: Props) {
  const { type } = await params;
  const { search, page } = await searchParams;

  if (!type || !Object.keys(contentTypes).includes(type)) {
    notFound();
  }

  const contentConfig = contentTypes[type as keyof typeof contentTypes];
  const currentPage = Number(page) || 1;
  const pageSize = 12;

  // Fetch content with pagination and search
  const {
    data: content,
    error,
    count
  } = await queries.getContentByTypeWithPagination(
    type as "video" | "audio" | "ebook",
    currentPage,
    pageSize,
    search
  );

  if (error) {
    console.error("Error fetching content:", error);
    notFound();
  }

  const totalPages = Math.ceil((count || 0) / pageSize);

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
                className={`${type === "video" ? "text-orange-600 font-medium" : "text-gray-600 hover:text-orange-600"} transition-colors`}
              >
                Videos
              </Link>
              <Link
                href="/browse/audio"
                className={`${type === "audio" ? "text-orange-600 font-medium" : "text-gray-600 hover:text-orange-600"} transition-colors`}
              >
                Audio
              </Link>
              <Link
                href="/browse/ebook"
                className={`${type === "ebook" ? "text-orange-600 font-medium" : "text-gray-600 hover:text-orange-600"} transition-colors`}
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
          <span className="text-gray-900">{contentConfig.title}</span>
        </nav>
      </div>

      {/* Page Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">{contentConfig.icon}</div>
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            {contentConfig.title}
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            {contentConfig.description}
          </p>

          {/* Search Bar */}
          <div className="max-w-lg mx-auto">
            <SearchInput
              placeholder={`Search ${contentConfig.title.toLowerCase()}...`}
              className="w-full"
            />
          </div>
        </div>

        {/* Results Summary */}
        {(search || count !== undefined) && (
          <div className="mb-6">
            <p className="text-gray-600 text-center">
              {search ? (
                <>
                  Found {count || 0} result{(count || 0) !== 1 ? "s" : ""} for "
                  {search}"
                  {count &&
                    count > 0 &&
                    ` (page ${currentPage} of ${totalPages})`}
                </>
              ) : (
                <>
                  Showing {content?.length || 0} of {count || 0}{" "}
                  {contentConfig.title.toLowerCase()}
                  {count &&
                    count > pageSize &&
                    ` (page ${currentPage} of ${totalPages})`}
                </>
              )}
            </p>
          </div>
        )}

        {/* Content Grid */}
        {content && content.length > 0 ? (
          <>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
              {content.map((item) => (
                <Link
                  key={item.id}
                  href={`/content-item/${item.id}`}
                  className="group"
                >
                  <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-4 border border-orange-100 h-full">
                    {/* Content Cover Image */}
                    <div
                      className={`${getContentAspectRatio(item.content_type as "video" | "audio" | "ebook" | "other")} bg-gray-200 rounded mb-4 overflow-hidden`}
                    >
                      <Image
                        src={getDefaultCoverImage(
                          item.content_type as
                            | "video"
                            | "audio"
                            | "ebook"
                            | "other"
                        )}
                        alt={`Cover for ${item.title}`}
                        width={400}
                        height={400}
                        className="w-full h-full object-cover"
                        unoptimized
                      />
                    </div>

                    {/* Content Info */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-orange-600 transition-colors line-clamp-2">
                        {item.title}
                      </h3>

                      {item.speaker?.name && (
                        <p className="text-sm text-gray-600 mb-2">
                          by {item.speaker.name}
                        </p>
                      )}

                      {/* Duration/Pages if available */}
                      {item.duration_estimate && (
                        <div className="text-xs text-gray-500 mb-2">
                          Duration: {Math.floor(item.duration_estimate / 60)}h{" "}
                          {item.duration_estimate % 60}m
                        </div>
                      )}

                      {/* View Link */}
                      <div
                        className={`text-${contentConfig.color}-600 text-sm font-medium group-hover:underline`}
                      >
                        {(() => {
                          if (type === "video") return "Watch Video";
                          if (type === "audio") return "Listen Now";
                          return "Read Book";
                        })()}{" "}
                        →
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* Pagination */}
            <PaginationControls
              currentPage={currentPage}
              totalPages={totalPages}
              className="mb-8"
            />
          </>
        ) : (
          /* No Content Message */
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <span className="text-6xl mb-4 block">🙏</span>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              {search ? "No Results Found" : "Coming Soon"}
            </h3>
            <p className="text-gray-600 mb-6">
              {search ? (
                <>
                  No {contentConfig.title.toLowerCase()} found matching "
                  {search}". Try adjusting your search terms or browse all
                  content.
                </>
              ) : (
                <>
                  We're currently building our collection of{" "}
                  {contentConfig.title.toLowerCase()}. Please check back soon
                  for new content.
                </>
              )}
            </p>
            {search ? (
              <Link
                href={`/browse/${type}`}
                className="inline-block bg-orange-600 text-white px-6 py-3 rounded-lg hover:bg-orange-700 transition-colors"
              >
                Clear Search
              </Link>
            ) : (
              <Link
                href="/"
                className="inline-block bg-orange-600 text-white px-6 py-3 rounded-lg hover:bg-orange-700 transition-colors"
              >
                Return Home
              </Link>
            )}
          </div>
        )}

        {/* Back to Home */}
        <div className="text-center mt-12">
          <Link
            href="/"
            className="inline-block bg-orange-600 text-white px-8 py-3 rounded-lg hover:bg-orange-700 transition-colors font-medium"
          >
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
