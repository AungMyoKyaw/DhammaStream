import { queries } from "@/lib/supabase";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import SearchInput from "@/components/SearchInput";
import PaginationControls from "@/components/PaginationControls";

interface SpeakersPageProps {
  readonly searchParams: Promise<{
    search?: string;
    page?: string;
  }>;
}

export default async function SpeakersPage({
  searchParams
}: SpeakersPageProps) {
  const params = await searchParams;
  const search = params.search || "";
  const page = parseInt(params.page || "1", 10);
  const pageSize = 12;

  const {
    data: speakers,
    error,
    count
  } = await queries.getSpeakersWithPagination(page, pageSize, search);

  if (error) {
    console.error("Error fetching speakers:", error);
    notFound();
  }

  const totalPages = Math.ceil((count || 0) / pageSize);

  // Helper function for pluralization
  const getTeacherCountText = (count: number, search: string) => {
    const teacherText = count !== 1 ? "teachers" : "teacher";
    if (search) {
      return `Found ${count} ${teacherText} for "${search}"`;
    }
    return `Showing ${count} ${teacherText}`;
  };

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
            {search ? `No teachers found for "${search}"` : "No Teachers Found"}
          </h2>
          <p className="text-gray-600 mb-8">
            {search
              ? "Try a different search term or browse all teachers."
              : "We're currently building our collection of Buddhist teachers and speakers."}
          </p>
          {search && (
            <Link
              href="/speakers"
              className="inline-block bg-orange-600 text-white px-6 py-3 rounded-lg hover:bg-orange-700 transition-colors mr-4"
            >
              View All Teachers
            </Link>
          )}
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
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Discover wisdom from renowned Buddhist teachers, meditation masters,
            and spiritual guides from around the world.
          </p>

          {/* Search Input */}
          <div className="max-w-lg mx-auto mb-8">
            <SearchInput
              placeholder="Search teachers by name..."
              className="w-full"
            />
          </div>

          {/* Results Count */}
          <p className="text-gray-600 mb-6">
            {getTeacherCountText(count || 0, search)}
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

        {/* Pagination */}
        <div className="mt-12">
          <PaginationControls
            currentPage={page}
            totalPages={totalPages}
            className="justify-center"
          />
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
