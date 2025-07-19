"use client";
import ContentTypeTabs from "../app/speakers/[id]/ContentTypeTabs";
import SearchInput from "./SearchInput";
import SortDropdownWrapper from "./SortDropdownWrapper";
import ActiveFiltersSummary from "./ActiveFiltersSummary";

interface SpeakerContentToolbarProps {
  readonly search: string;
  readonly type: string;
  readonly sort: string;
  readonly page: number;
}

export default function SpeakerContentToolbar({
  search,
  type,
  sort,
  page
}: SpeakerContentToolbarProps) {
  return (
    <div className="space-y-4 mb-6">
      {/* Primary Search */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3 md:p-4">
        <SearchInput
          placeholder="Search this teacher's content..."
          className="w-full"
        />
      </div>

      {/* Secondary Filters + Sort */}
      <div className="flex flex-col space-y-3 md:space-y-0 md:flex-row md:items-center md:justify-between md:gap-4">
        <div className="flex flex-col space-y-3 sm:space-y-0 sm:flex-row sm:items-center sm:gap-3">
          <ContentTypeTabs />
          <ActiveFiltersSummary search={search} type={type} sort={sort} />
        </div>
        <div className="flex justify-end">
          <SortDropdownWrapper
            sort={sort}
            search={search}
            type={type}
            page={page}
          />
        </div>
      </div>
    </div>
  );
}
