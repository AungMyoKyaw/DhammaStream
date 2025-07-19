import { queries } from "@/lib/supabase";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import SearchInput from "@/components/SearchInput";
import PaginationControls from "@/components/PaginationControls";
import { Navigation } from "@/components/Navigation";
import { FeatureIcons } from "@/components/ui/icons";

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
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 dark:from-gray-900 dark:to-gray-800">
        <Navigation />

        <div className="max-w-4xl mx-auto px-4 py-16 text-center">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            {search ? `No teachers found for "${search}"` : "No Teachers Found"}
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-8">
            {search
              ? "Try a different search term or browse all teachers."
              : "We're currently building our collection of Buddhist teachers and speakers."}
          </p>
          {search && (
            <Link
              href="/speakers"
              className="inline-block bg-orange-600 text-white px-6 py-3 rounded-lg hover:bg-orange-700 dark:bg-orange-500 dark:hover:bg-orange-600 transition-colors mr-4 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
            >
              View All Teachers
            </Link>
          )}
          <Link
            href="/"
            className="inline-block bg-orange-600 text-white px-6 py-3 rounded-lg hover:bg-orange-700 dark:bg-orange-500 dark:hover:bg-orange-600 transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
          >
            Return Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 dark:from-gray-900 dark:to-gray-800">
      <Navigation />

      {/* Page Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Buddhist Teachers & Speakers
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto mb-8">
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
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {getTeacherCountText(count || 0, search)}
          </p>
        </div>

        {/* Speakers Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {speakers.map((speaker) => (
            <Link
              key={speaker.id}
              href={`/speakers/${speaker.id}`}
              className="group focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 rounded-lg"
            >
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow p-6 border border-orange-100 dark:border-gray-700 h-full">
                {/* Speaker Avatar/Placeholder */}
                <div className="w-20 h-20 bg-orange-100 dark:bg-orange-900/30 rounded-full mx-auto mb-4 flex items-center justify-center">
                  {speaker.photo_url ? (
                    <Image
                      src={speaker.photo_url}
                      alt={speaker.name}
                      width={80}
                      height={80}
                      className="w-20 h-20 rounded-full object-cover"
                    />
                  ) : (
                    <FeatureIcons.meditation className="w-10 h-10 text-orange-600 dark:text-orange-400" />
                  )}
                </div>

                {/* Speaker Info */}
                <div className="text-center">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2 group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">
                    {speaker.name}
                  </h3>

                  {speaker.bio && (
                    <p className="text-gray-600 dark:text-gray-300 text-sm line-clamp-3">
                      {speaker.bio}
                    </p>
                  )}

                  {!speaker.bio && (
                    <p className="text-gray-500 dark:text-gray-400 text-sm italic">
                      Buddhist teacher and spiritual guide
                    </p>
                  )}
                </div>

                {/* View Details Link */}
                <div className="mt-4 text-center">
                  <span className="text-orange-600 dark:text-orange-400 text-sm font-medium group-hover:underline flex items-center justify-center gap-1">
                    View Teachings
                    <FeatureIcons.arrowRight className="w-4 h-4" />
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
            className="inline-block bg-orange-600 text-white px-8 py-3 rounded-lg hover:bg-orange-700 dark:bg-orange-500 dark:hover:bg-orange-600 transition-colors font-medium focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
          >
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
