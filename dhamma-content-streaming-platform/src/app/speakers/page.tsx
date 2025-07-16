import { queries } from "@/lib/supabase";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";

export default async function SpeakersPage() {
  const { data: speakers, error } = await queries.getSpeakers();

  if (error) {
    console.error("Error fetching speakers:", error);
    notFound();
  }

  if (!speakers || speakers.length === 0) {
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
            </div>
          </div>
        </header>

        <div className="max-w-4xl mx-auto px-4 py-16 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            No Teachers Found
          </h2>
          <p className="text-gray-600 mb-8">
            We're currently building our collection of Buddhist teachers and
            speakers.
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

      {/* Page Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Buddhist Teachers & Speakers
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Discover wisdom from renowned Buddhist teachers, meditation masters,
            and spiritual guides from around the world.
          </p>
        </div>

        {/* Speakers Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {speakers.map((speaker) => (
            <Link
              key={speaker.id}
              href={`/speakers/${speaker.id}`}
              className="group"
            >
              <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6 border border-orange-100 h-full">
                {/* Speaker Avatar/Placeholder */}
                <div className="w-20 h-20 bg-orange-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                  {speaker.photo_url ? (
                    <Image
                      src={speaker.photo_url}
                      alt={speaker.name}
                      width={80}
                      height={80}
                      className="w-20 h-20 rounded-full object-cover"
                    />
                  ) : (
                    <span className="text-3xl text-orange-600">🧘‍♂️</span>
                  )}
                </div>

                {/* Speaker Info */}
                <div className="text-center">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-orange-600 transition-colors">
                    {speaker.name}
                  </h3>

                  {speaker.bio && (
                    <p className="text-gray-600 text-sm line-clamp-3">
                      {speaker.bio}
                    </p>
                  )}

                  {!speaker.bio && (
                    <p className="text-gray-500 text-sm italic">
                      Buddhist teacher and spiritual guide
                    </p>
                  )}
                </div>

                {/* View Details Link */}
                <div className="mt-4 text-center">
                  <span className="text-orange-600 text-sm font-medium group-hover:underline">
                    View Teachings →
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>

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
