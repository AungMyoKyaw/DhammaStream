import { queries } from "@/lib/supabase";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import PaginationControls from "@/components/PaginationControls";
import CompactContentCard from "@/components/CompactContentCard";
import SpeakerContentToolbar from "@/components/SpeakerContentToolbar";
import { Navigation } from "@/components/Navigation";
import { UserRound } from "lucide-react";
import { Suspense } from "react";

interface SpeakerDetailPageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function SpeakerDetailPage(props: SpeakerDetailPageProps) {
  const params = await props.params;
  const searchParams = await props.searchParams;
  const { id } = params;

  // Helper function to get string value from search params
  const getSearchParam = (param: string | string[] | undefined): string => {
    if (Array.isArray(param)) return param[0] || "";
    return param || "";
  };

  const search = getSearchParam(searchParams.search);
  const type =
    (getSearchParam(searchParams.type) as
      | "all"
      | "video"
      | "audio"
      | "ebook") || "all";
  const sort =
    (getSearchParam(searchParams.sort) as
      | "newest"
      | "oldest"
      | "title-asc"
      | "title-desc") || "newest";
  const page = parseInt(getSearchParam(searchParams.page) || "1", 10);
  const pageSize = 12;
  const speakerId = parseInt(id);

  if (Number.isNaN(speakerId)) {
    notFound();
  }

  // Get speaker data and their content with pagination
  const [speakerResult, contentResult] = await Promise.all([
    queries.getSpeakers(),
    queries.getContentBySpeakerWithPagination(
      speakerId,
      page,
      pageSize,
      search,
      type,
      sort
    )
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
  const getItemCountText = (count: number, search: string) => {
    const itemText = count !== 1 ? "items" : "item";
    if (search) {
      return `${count} ${itemText} found for "${search}"`;
    }
    return `${count} ${itemText} found`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 dark:bg-gradient-to-br dark:from-gray-900 dark:to-gray-800 pb-24">
      {/* Shared Navigation Bar */}
      <Navigation />

      {/* Breadcrumb */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <nav
          className="text-sm text-gray-600 dark:text-gray-300 flex items-center gap-2"
          aria-label="Breadcrumb"
        >
          <Link
            href="/"
            className="hover:text-orange-600 dark:hover:text-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-400 dark:focus:ring-orange-300"
            aria-label="Home"
          >
            Home
          </Link>
          <span className="mx-2" aria-hidden="true">
            ›
          </span>
          <Link
            href="/speakers"
            className="hover:text-orange-600 dark:hover:text-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-400 dark:focus:ring-orange-300"
            aria-label="Teachers"
          >
            Teachers
          </Link>
          <span className="mx-2" aria-hidden="true">
            ›
          </span>
          <span className="text-gray-900 dark:text-white" aria-current="page">
            {speaker.name}
          </span>
        </nav>
      </div>

      {/* Speaker Profile */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg p-8 mb-8">
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
                  <UserRound
                    size={64}
                    className="text-orange-600"
                    strokeWidth={2.5}
                  />
                )}
              </div>
            </div>
            {/* Speaker Info */}
            <div className="flex-1 text-center md:text-left">
              <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
                {speaker.name}
              </h2>

              {speaker.bio && (
                <div className="text-gray-700 dark:text-gray-300 text-lg leading-relaxed">
                  <p>{speaker.bio}</p>
                </div>
              )}

              {!speaker.bio && (
                <p className="text-gray-600 dark:text-gray-400 text-lg italic">
                  Buddhist teacher and spiritual guide sharing wisdom and
                  meditation practices.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Content Sections */}
        <div className="space-y-6">
          {/* All Content - Unified List */}
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 p-4 md:p-6">
            {/* Unified Content Toolbar */}

            <Suspense>
              <SpeakerContentToolbar
                search={search}
                type={type}
                sort={sort}
                page={page}
              />
            </Suspense>

            {/* Results Context */}
            <div className="flex items-center justify-between mb-4">
              <p className="text-gray-600 dark:text-gray-300 font-medium text-sm md:text-base">
                {getItemCountText(totalCount, search)}
              </p>
            </div>

            {/* Content Grid - Display all content types together */}
            {speakerContent.length > 0 ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6 md:mb-8">
                  {speakerContent.map((content) => (
                    <CompactContentCard key={content.id} content={content} />
                  ))}
                </div>

                {/* Pagination */}
                <PaginationControls
                  currentPage={page}
                  totalPages={totalPages}
                  totalItems={totalCount}
                  itemsPerPage={pageSize}
                  className="justify-center"
                />
              </>
            ) : (
              <div className="text-center py-8 md:py-12">
                <span className="text-4xl md:text-6xl mb-4 block">🔍</span>
                <h4 className="text-lg md:text-xl font-bold text-gray-900 dark:text-white mb-2">
                  No content found
                </h4>
                <p className="text-gray-600 dark:text-gray-400 mb-4 text-sm md:text-base px-4">
                  {search
                    ? `No content from ${speaker.name} matches "${search}". Try a different search term.`
                    : `No content available from ${speaker.name} yet.`}
                </p>
                {search && (
                  <Link
                    href={`/speakers/${speakerId}`}
                    className="inline-block bg-orange-600 text-white dark:bg-orange-700 dark:text-white px-4 md:px-6 py-2 md:py-3 rounded-lg hover:bg-orange-700 dark:hover:bg-orange-800 transition-colors text-sm md:text-base"
                  >
                    View All Content from {speaker.name}
                  </Link>
                )}
              </div>
            )}
          </div>

          {/* No Content Message - Show when no content at all */}
          {totalCount === 0 && (
            <div className="bg-white dark:bg-gray-900 rounded-lg shadow-md p-12 text-center">
              <span className="text-6xl mb-4 block">🙏</span>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                Coming Soon
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                We're currently adding content from {speaker.name}. Please check
                back soon for teachings, guided meditations, and wisdom talks.
              </p>
              <Link
                href="/speakers"
                className="inline-block bg-orange-600 text-white dark:bg-orange-700 dark:text-white px-6 py-3 rounded-lg hover:bg-orange-700 dark:hover:bg-orange-800 transition-colors"
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
            className="inline-block bg-orange-600 text-white dark:bg-orange-700 dark:text-white px-8 py-3 rounded-lg hover:bg-orange-700 dark:hover:bg-orange-800 transition-colors font-medium"
          >
            ← Back to All Teachers
          </Link>
        </div>
      </div>
    </div>
  );
}
