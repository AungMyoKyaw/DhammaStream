import { queries } from "@/lib/supabase";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import SearchInput from "@/components/SearchInput";
import PaginationControls from "@/components/PaginationControls";
import CompactContentCard from "@/components/CompactContentCard";

interface SpeakerDetailPageProps {
  readonly params: Promise<{ id: string }>;
  readonly searchParams: Promise<{
    search?: string;
    page?: string;
  }>;
}

export default async function SpeakerDetailPage({
  params,
  searchParams
}: SpeakerDetailPageProps) {
  const { id } = await params;
  const searchParamsData = await searchParams;
  const search = searchParamsData.search || "";
  const page = parseInt(searchParamsData.page || "1", 10);
  const pageSize = 12;
  const speakerId = parseInt(id);

  if (Number.isNaN(speakerId)) {
    notFound();
  }

  // Get speaker data and their content with pagination
  const [speakerResult, contentResult] = await Promise.all([
    queries.getSpeakers(),
    queries.getContentBySpeakerWithPagination(speakerId, page, pageSize, search)
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

  const speakerContent = contentResult.data || [];
  const totalCount = contentResult.count || 0;
  const totalPages = Math.ceil(totalCount / pageSize);

  // Helper functions
  const getItemCountText = (count: number, search: string) => {
    const itemText = count !== 1 ? "items" : "item";
    if (search) {
      return `Found ${count} ${itemText} for "${search}"`;
    }
    return `Showing ${count} ${itemText}`;
  };

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
          {/* All Content - Unified List */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
              <h3 className="text-2xl font-bold text-gray-900">
                All Content from {speaker.name}
              </h3>
              <div className="max-w-md">
                <SearchInput
                  placeholder="Search this teacher's content..."
                  className="w-full"
                />
              </div>
            </div>

            {/* Results Count */}
            <p className="text-gray-600 mb-6">
              {getItemCountText(totalCount, search)}
            </p>

            {/* Content Grid - Display all content types together */}
            {speakerContent.length > 0 ? (
              <>
                <div className="grid gap-4 mb-8">
                  {speakerContent.map((content) => (
                    <CompactContentCard key={content.id} content={content} />
                  ))}
                </div>

                {/* Pagination */}
                <PaginationControls
                  currentPage={page}
                  totalPages={totalPages}
                  className="justify-center"
                />
              </>
            ) : (
              <div className="text-center py-12">
                <span className="text-6xl mb-4 block">🔍</span>
                <h4 className="text-xl font-bold text-gray-900 mb-2">
                  No content found
                </h4>
                <p className="text-gray-600 mb-4">
                  {search
                    ? `No content from ${speaker.name} matches "${search}". Try a different search term.`
                    : `No content available from ${speaker.name} yet.`}
                </p>
                {search && (
                  <Link
                    href={`/speakers/${speakerId}`}
                    className="inline-block bg-orange-600 text-white px-6 py-3 rounded-lg hover:bg-orange-700 transition-colors"
                  >
                    View All Content from {speaker.name}
                  </Link>
                )}
              </div>
            )}
          </div>

          {/* No Content Message - Show when no content at all */}
          {totalCount === 0 && (
            <div className="bg-white rounded-lg shadow-md p-12 text-center">
              <span className="text-6xl mb-4 block">🙏</span>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Coming Soon
              </h3>
              <p className="text-gray-600 mb-6">
                We're currently adding content from {speaker.name}. Please check
                back soon for teachings, guided meditations, and wisdom talks.
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
