import { queries } from "@/lib/supabase";
import Link from "next/link";
import { notFound } from "next/navigation";

interface Props {
  params: Promise<{ type: string }>;
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

export default async function ContentTypePage({ params }: Props) {
  const { type } = await params;

  if (!type || !Object.keys(contentTypes).includes(type)) {
    notFound();
  }

  const contentConfig = contentTypes[type as keyof typeof contentTypes];

  const { data: content, error } = await queries.getContentByType(
    type as "video" | "audio" | "ebook"
  );

  if (error) {
    console.error("Error fetching content:", error);
    notFound();
  }

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
                href="/content/video"
                className={`${type === "video" ? "text-orange-600 font-medium" : "text-gray-600 hover:text-orange-600"} transition-colors`}
              >
                Videos
              </Link>
              <Link
                href="/content/audio"
                className={`${type === "audio" ? "text-orange-600 font-medium" : "text-gray-600 hover:text-orange-600"} transition-colors`}
              >
                Audio
              </Link>
              <Link
                href="/content/ebook"
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
        <div className="text-center mb-12">
          <div className="text-6xl mb-4">{contentConfig.icon}</div>
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            {contentConfig.title}
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            {contentConfig.description}
          </p>
        </div>

        {/* Content Grid */}
        {content && content.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {content.map((item) => (
              <Link
                key={item.id}
                href={`/content-item/${item.id}`}
                className="group"
              >
                <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6 border border-orange-100 h-full">
                  {/* Content Thumbnail */}
                  <div
                    className={`
                    ${type === "video" ? "aspect-video" : type === "ebook" ? "aspect-[3/4]" : "aspect-square"}
                    bg-gray-200 rounded mb-4 flex items-center justify-center
                  `}
                  >
                    <span className="text-4xl">{contentConfig.icon}</span>
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

                    {item.description && (
                      <p className="text-gray-600 text-sm line-clamp-3 mb-4">
                        {item.description}
                      </p>
                    )}

                    {/* Duration/Pages if available */}
                    {item.duration_minutes && (
                      <div className="text-xs text-gray-500 mb-2">
                        Duration: {Math.floor(item.duration_minutes / 60)}h{" "}
                        {item.duration_minutes % 60}m
                      </div>
                    )}

                    {/* View Link */}
                    <div
                      className={`text-${contentConfig.color}-600 text-sm font-medium group-hover:underline`}
                    >
                      {type === "video"
                        ? "Watch Video"
                        : type === "audio"
                          ? "Listen Now"
                          : "Read Book"}{" "}
                      →
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          /* No Content Message */
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <span className="text-6xl mb-4 block">🙏</span>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Coming Soon
            </h3>
            <p className="text-gray-600 mb-6">
              We're currently building our collection of{" "}
              {contentConfig.title.toLowerCase()}. Please check back soon for
              new content.
            </p>
            <Link
              href="/"
              className="inline-block bg-orange-600 text-white px-6 py-3 rounded-lg hover:bg-orange-700 transition-colors"
            >
              Return Home
            </Link>
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
