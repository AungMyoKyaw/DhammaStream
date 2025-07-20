import { useRouter } from "next/navigation";
import { FeatureIcons } from "@/components/ui/icons";

interface ActiveFiltersSummaryProps {
  readonly search: string;
  readonly type: string;
  readonly sort: string;
}

export default function ActiveFiltersSummary({
  search,
  type,
  sort
}: ActiveFiltersSummaryProps) {
  const router = useRouter();

  const hasActiveFilters = search || type !== "all" || sort !== "newest";

  if (!hasActiveFilters) return null;

  const clearAllFilters = () => {
    const params = new URLSearchParams();
    // Keep only the speaker ID param and remove all filters
    router.push(`?${params.toString()}`);
  };

  const getActiveFilterCount = () => {
    let count = 0;
    if (search) count++;
    if (type !== "all") count++;
    if (sort !== "newest") count++;
    return count;
  };

  const activeCount = getActiveFilterCount();
  const FilterIcon = FeatureIcons.Filter;
  const CloseIcon = FeatureIcons.Close;

  return (
    <div className="flex items-center gap-2 text-sm text-gray-600">
      <span className="flex items-center gap-1">
        <FilterIcon className="w-4 h-4" />
        {activeCount} filter{activeCount !== 1 ? "s" : ""} applied
      </span>
      <button
        type="button"
        onClick={clearAllFilters}
        className="text-orange-600 hover:text-orange-700 font-medium flex items-center gap-1 focus:outline-none focus:ring-2 focus:ring-orange-400 rounded px-2 py-1"
        aria-label="Clear all filters"
      >
        <CloseIcon className="w-3 h-3" />
        Clear all
      </button>
    </div>
  );
}
