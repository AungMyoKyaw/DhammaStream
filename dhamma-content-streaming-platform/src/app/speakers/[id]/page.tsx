import { queries } from "@/lib/supabase";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";

export default async function SpeakerDetailPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const speakerId = parseInt(id);

  if (Number.isNaN(speakerId)) {
    notFound();
  }

  // Get speaker data and their content
  const [speakerResult, contentResult] = await Promise.all([
    queries.getSpeakers(),
    queries.getContentByType("video") // We'll filter by speaker after
  ]);

  if (speakerResult.error || contentResult.error) {
    console.error(
      "Error fetching data:",
      speakerResult.error || contentResult.error
    );
    notFound();
  }

  const speaker = speakerResult.data?.find((s) => s.id === speakerId);

  if (!speaker) {
    notFound();
  }

  // Filter content by this speaker
  const speakerContent =
    contentResult.data?.filter((content) => content.speaker_id === speakerId) ||
    [];

  // Categorize content by type
  const videoContent = speakerContent.filter(
    (content) => content.content_type === "video"
  );
  const audioContent = speakerContent.filter(
    (content) => content.content_type === "audio"
  );
  const ebookContent = speakerContent.filter(
    (content) => content.content_type === "ebook"
  );

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
              <Link href="/speakers" className="text-orange-600 font-medium">
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
          <Link href="/speakers" className="hover:text-orange-600">
            Teachers
          </Link>
          <span className="mx-2">›</span>
          <span className="text-gray-900">{speaker.name}</span>
        </nav>
      </div>

      {/* Speaker Profile */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
            {/* Speaker Photo */}
            <div className="flex-shrink-0">
              <div className="w-32 h-32 bg-orange-100 rounded-full flex items-center justify-center">
                {speaker.photo_url ? (
                  <Image
                    src={speaker.photo_url}
                    alt={speaker.name}
                    width={128}
                    height={128}
                    className="w-32 h-32 rounded-full object-cover"
                  />
                ) : (
                  <span className="text-6xl text-orange-600">🧘‍♂️</span>
                )}
              </div>
            </div>

            {/* Speaker Info */}
            <div className="flex-1 text-center md:text-left">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                {speaker.name}
              </h2>

              {speaker.bio && (
                <div className="text-gray-700 text-lg leading-relaxed">
                  <p>{speaker.bio}</p>
                </div>
              )}

              {!speaker.bio && (
                <p className="text-gray-600 text-lg italic">
                  Buddhist teacher and spiritual guide sharing wisdom and
                  meditation practices.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Content Sections */}
        <div className="space-y-8">
          {/* Video Content */}
          {videoContent.length > 0 && (
            <section>
              <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <span className="text-red-600 mr-3">📹</span>
                Video Teachings ({videoContent.length})
              </h3>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {videoContent.map((content) => (
                  <Link
                    key={content.id}
                    href={`/content-item/${content.id}`}
                    className="group"
                  >
                    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6 border border-orange-100">
                      <div className="aspect-video bg-gray-200 rounded mb-4 flex items-center justify-center">
                        <span className="text-4xl">📹</span>
                      </div>
                      <h4 className="font-semibold text-gray-900 mb-2 group-hover:text-orange-600 transition-colors">
                        {content.title}
                      </h4>
                      {content.description && (
                        <p className="text-gray-600 text-sm line-clamp-3">
                          {content.description}
                        </p>
                      )}
                      <div className="mt-4 text-orange-600 text-sm font-medium">
                        Watch Video →
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* Audio Content */}
          {audioContent.length > 0 && (
            <section>
              <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <span className="text-blue-600 mr-3">🎧</span>
                Audio Teachings ({audioContent.length})
              </h3>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {audioContent.map((content) => (
                  <Link
                    key={content.id}
                    href={`/content-item/${content.id}`}
                    className="group"
                  >
                    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6 border border-orange-100">
                      <div className="aspect-square bg-gray-200 rounded mb-4 flex items-center justify-center">
                        <span className="text-4xl">🎧</span>
                      </div>
                      <h4 className="font-semibold text-gray-900 mb-2 group-hover:text-orange-600 transition-colors">
                        {content.title}
                      </h4>
                      {content.description && (
                        <p className="text-gray-600 text-sm line-clamp-3">
                          {content.description}
                        </p>
                      )}
                      <div className="mt-4 text-orange-600 text-sm font-medium">
                        Listen Now →
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* Ebook Content */}
          {ebookContent.length > 0 && (
            <section>
              <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <span className="text-green-600 mr-3">📚</span>
                Digital Books ({ebookContent.length})
              </h3>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {ebookContent.map((content) => (
                  <Link
                    key={content.id}
                    href={`/content-item/${content.id}`}
                    className="group"
                  >
                    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6 border border-orange-100">
                      <div className="aspect-[3/4] bg-gray-200 rounded mb-4 flex items-center justify-center">
                        <span className="text-4xl">📚</span>
                      </div>
                      <h4 className="font-semibold text-gray-900 mb-2 group-hover:text-orange-600 transition-colors">
                        {content.title}
                      </h4>
                      {content.description && (
                        <p className="text-gray-600 text-sm line-clamp-3">
                          {content.description}
                        </p>
                      )}
                      <div className="mt-4 text-orange-600 text-sm font-medium">
                        Read Book →
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* No Content Message */}
          {videoContent.length === 0 &&
            audioContent.length === 0 &&
            ebookContent.length === 0 && (
              <div className="bg-white rounded-lg shadow-md p-12 text-center">
                <span className="text-6xl mb-4 block">🙏</span>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  Coming Soon
                </h3>
                <p className="text-gray-600 mb-6">
                  We're currently adding content from {speaker.name}. Please
                  check back soon for teachings, guided meditations, and wisdom
                  talks.
                </p>
                <Link
                  href="/speakers"
                  className="inline-block bg-orange-600 text-white px-6 py-3 rounded-lg hover:bg-orange-700 transition-colors"
                >
                  Explore Other Teachers
                </Link>
              </div>
            )}
        </div>

        {/* Back to Speakers */}
        <div className="text-center mt-12">
          <Link
            href="/speakers"
            className="inline-block bg-orange-600 text-white px-8 py-3 rounded-lg hover:bg-orange-700 transition-colors font-medium"
          >
            ← Back to All Teachers
          </Link>
        </div>
      </div>
    </div>
  );
}
