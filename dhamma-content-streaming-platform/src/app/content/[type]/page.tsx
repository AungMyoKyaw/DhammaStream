import { queries } from "@/lib/supabase";
import Link from "next/link";
import { ContentTypeIcons } from "@/components/ui/icons";
import { notFound } from "next/navigation";
import CompactContentCard from "@/components/CompactContentCard";

interface Props {
  params: Promise<{ type: string }>;
}

const contentTypes = {
  video: {
    title: "Video Teachings",
    icon: (
      // eslint-disable-next-line jsx-a11y/media-has-caption,react/jsx-pascal-case -- false positive, this is an icon, not a media element
      <ContentTypeIcons.video className="inline-block w-12 h-12 text-red-500" />
    ),
    description:
      "Discover inspiring Buddhist video teachings, guided meditations, and dharma talks.",
    color: "red"
  },
  audio: {
    title: "Audio Content",
    icon: (
      // eslint-disable-next-line jsx-a11y/media-has-caption,react/jsx-pascal-case -- false positive, this is an icon, not a media element
      <ContentTypeIcons.audio className="inline-block w-12 h-12 text-blue-500" />
    ),
    description:
      "Listen to Buddhist podcasts, guided meditations, and spiritual discussions.",
    color: "blue"
  },
  ebook: {
    title: "Digital Books",
    icon: (
      // eslint-disable-next-line jsx-a11y/media-has-caption,react/jsx-pascal-case -- false positive, this is an icon, not a media element
      <ContentTypeIcons.ebook className="inline-block w-12 h-12 text-green-500" />
    ),
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
          <div className="grid gap-4">
            {content.map((item) => (
              <CompactContentCard key={item.id} content={item} />
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
