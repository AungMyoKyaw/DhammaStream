import { queries } from "@/lib/supabase";
import Link from "next/link";
import { ContentTypeIcons, FeatureIcons } from "@/components/ui/icons";
import { ReactNode } from "react";

// alias icon components for proper JSX naming
const {
  video: VideoIcon,
  audio: AudioIcon,
  ebook: EbookIcon
} = ContentTypeIcons;
import { notFound } from "next/navigation";
import SearchInput from "@/components/SearchInput";
import PaginationControls from "@/components/PaginationControls";
import CompactContentCard from "@/components/CompactContentCard";
import { Navigation } from "@/components/Navigation";
import type { DhammaContentWithRelations } from "@/types/database";

interface Props {
  params: Promise<{ type: string }>;
  searchParams: Promise<{ search?: string; page?: string }>;
}

const contentTypes = {
  video: {
    title: "Video Teachings",
    icon: <VideoIcon className="inline-block w-12 h-12 text-red-500" />,
    description:
      "Discover inspiring Buddhist video teachings, guided meditations, and dharma talks.",
    color: "red"
  },
  audio: {
    title: "Audio Content",
    icon: <AudioIcon className="inline-block w-12 h-12 text-blue-500" />,
    description:
      "Listen to Buddhist podcasts, guided meditations, and spiritual discussions.",
    color: "blue"
  },
  ebook: {
    title: "Digital Books",
    icon: <EbookIcon className="inline-block w-12 h-12 text-green-500" />,
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
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 dark:from-gray-900 dark:to-gray-800">
      <Navigation />
      <Breadcrumb contentConfig={contentConfig} />
      <MainContent
        contentConfig={contentConfig}
        search={search}
        count={count || undefined}
        currentPage={currentPage}
        totalPages={totalPages}
        content={content || []}
        pageSize={pageSize}
        type={type}
      />
    </div>
  );
}

interface BreadcrumbProps {
  contentConfig: {
    title: string;
    icon: ReactNode;
    description: string;
    color: string;
  };
}

function Breadcrumb({ contentConfig }: BreadcrumbProps) {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
      <nav className="text-sm text-gray-600 dark:text-gray-400">
        <Link
          href="/"
          className="hover:text-orange-600 dark:hover:text-orange-400"
        >
          Home
        </Link>
        <span className="mx-2">›</span>
        <span className="text-gray-900 dark:text-white">
          {contentConfig.title}
        </span>
      </nav>
    </div>
  );
}

interface MainContentProps {
  contentConfig: {
    title: string;
    icon: ReactNode;
    description: string;
    color: string;
  };
  search?: string;
  count?: number;
  currentPage: number;
  totalPages: number;
  content: DhammaContentWithRelations[];
  pageSize: number;
  type: string;
}

function MainContent({
  contentConfig,
  search,
  count,
  currentPage,
  totalPages,
  content,
  pageSize,
  type
}: MainContentProps) {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <PageIntro contentConfig={contentConfig} />
      <ResultsSummary
        search={search}
        count={count}
        currentPage={currentPage}
        totalPages={totalPages}
        contentConfig={contentConfig}
        contentLength={content?.length || 0}
        pageSize={pageSize}
      />
      <ContentDisplay
        content={content}
        currentPage={currentPage}
        totalPages={totalPages}
        contentConfig={contentConfig}
        search={search}
        type={type}
      />
      <BackToHome />
    </div>
  );
}

function PageIntro({
  contentConfig
}: {
  contentConfig: { title: string; icon: ReactNode; description: string };
}) {
  return (
    <div className="text-center mb-8">
      <div className="text-6xl mb-4">{contentConfig.icon}</div>
      <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
        {contentConfig.title}
      </h2>
      <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto mb-8">
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
  );
}

interface ResultsSummaryProps {
  search?: string;
  count?: number;
  currentPage: number;
  totalPages: number;
  contentConfig: { title: string };
  contentLength: number;
  pageSize: number;
}

function ResultsSummary({
  search,
  count,
  currentPage,
  totalPages,
  contentConfig,
  contentLength,
  pageSize
}: ResultsSummaryProps) {
  if (!search && count === undefined) return null;

  return (
    <div className="mb-6">
      <p className="text-gray-600 text-center">
        {search ? (
          <SearchResults
            count={count || 0}
            search={search}
            currentPage={currentPage}
            totalPages={totalPages}
          />
        ) : (
          <AllResults
            contentLength={contentLength}
            count={count || 0}
            contentConfig={contentConfig}
            pageSize={pageSize}
            currentPage={currentPage}
            totalPages={totalPages}
          />
        )}
      </p>
    </div>
  );
}

function SearchResults({
  count,
  search,
  currentPage,
  totalPages
}: {
  count: number;
  search: string;
  currentPage: number;
  totalPages: number;
}) {
  return (
    <>
      Found {count} result{count !== 1 ? "s" : ""} for "{search}"
      {count > 0 && ` (page ${currentPage} of ${totalPages})`}
    </>
  );
}

function AllResults({
  contentLength,
  count,
  contentConfig,
  pageSize,
  currentPage,
  totalPages
}: {
  contentLength: number;
  count: number;
  contentConfig: { title: string };
  pageSize: number;
  currentPage: number;
  totalPages: number;
}) {
  return (
    <>
      Showing {contentLength} of {count} {contentConfig.title.toLowerCase()}
      {count > pageSize && ` (page ${currentPage} of ${totalPages})`}
    </>
  );
}

interface ContentDisplayProps {
  content: DhammaContentWithRelations[];
  currentPage: number;
  totalPages: number;
  contentConfig: { title: string };
  search?: string;
  type: string;
}

function ContentDisplay({
  content,
  currentPage,
  totalPages,
  contentConfig,
  search,
  type
}: ContentDisplayProps) {
  if (content && content.length > 0) {
    return (
      <>
        <div className="grid gap-4 mb-8">
          {content.map((item) => (
            <CompactContentCard key={item.id} content={item} />
          ))}
        </div>
        <PaginationControls
          currentPage={currentPage}
          totalPages={totalPages}
          className="mb-8"
        />
      </>
    );
  }

  return (
    <NoContentMessage
      contentConfig={contentConfig}
      search={search}
      type={type}
    />
  );
}

function NoContentMessage({
  contentConfig,
  search,
  type
}: {
  contentConfig: { title: string };
  search?: string;
  type: string;
}) {
  return (
    <div className="bg-white rounded-lg shadow-md p-12 text-center">
      <FeatureIcons.meditation className="w-12 h-12 text-gray-400 mx-auto mb-4" />
      <h3 className="text-2xl font-bold text-gray-900 mb-4">
        {search ? "No Results Found" : "Coming Soon"}
      </h3>
      <p className="text-gray-600 mb-6">
        {search ? (
          <>
            No {contentConfig.title.toLowerCase()} found matching "{search}".
            Try adjusting your search terms or browse all content.
          </>
        ) : (
          <>
            We're currently building our collection of{" "}
            {contentConfig.title.toLowerCase()}. Please check back soon for new
            content.
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
  );
}

function BackToHome() {
  return (
    <div className="text-center mt-12">
      <Link
        href="/"
        className="inline-block bg-orange-600 text-white px-8 py-3 rounded-lg hover:bg-orange-700 transition-colors font-medium"
      >
        Back to Home
      </Link>
    </div>
  );
}
