"use client";

interface SpeakerFilterChipsProps {
  search: string;
  type: string;
  sort: string;
}

const SpeakerFilterChips: React.FC<SpeakerFilterChipsProps> = ({
  search,
  type,
  sort
}) => {
  return (
    <div className="flex flex-wrap items-center gap-2 mb-2">
      {search && (
        <button
          type="button"
          onClick={() => {
            const params = new URLSearchParams(window.location.search);
            params.delete("search");
            params.set("page", "1");
            window.location.search = params.toString();
          }}
          className="flex items-center bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 px-3 py-1 rounded-full text-sm font-medium hover:bg-orange-200 dark:hover:bg-orange-900/50 focus:outline-none focus:ring-2 focus:ring-orange-400 dark:focus:ring-orange-500"
          aria-label="Clear search filter"
        >
          Search: "{search}"<span className="ml-1 text-lg">×</span>
        </button>
      )}
      {type && type !== "all" && (
        <button
          type="button"
          onClick={() => {
            const params = new URLSearchParams(window.location.search);
            params.delete("type");
            params.set("page", "1");
            window.location.search = params.toString();
          }}
          className="flex items-center bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 px-3 py-1 rounded-full text-sm font-medium hover:bg-orange-200 dark:hover:bg-orange-900/50 focus:outline-none focus:ring-2 focus:ring-orange-400 dark:focus:ring-orange-500"
          aria-label="Clear type filter"
        >
          Type: {type.charAt(0).toUpperCase() + type.slice(1)}
          <span className="ml-1 text-lg">×</span>
        </button>
      )}
      {sort && sort !== "newest" && (
        <button
          type="button"
          onClick={() => {
            const params = new URLSearchParams(window.location.search);
            params.delete("sort");
            params.set("page", "1");
            window.location.search = params.toString();
          }}
          className="flex items-center bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 px-3 py-1 rounded-full text-sm font-medium hover:bg-orange-200 dark:hover:bg-orange-900/50 focus:outline-none focus:ring-2 focus:ring-orange-400 dark:focus:ring-orange-500"
          aria-label="Clear sort filter"
        >
          Sort:{" "}
          {sort.replace("-", " ").replace("asc", "A-Z").replace("desc", "Z-A")}
          <span className="ml-1 text-lg">×</span>
        </button>
      )}
      {(search || (type && type !== "all") || (sort && sort !== "newest")) && (
        <button
          type="button"
          onClick={() => {
            const params = new URLSearchParams(window.location.search);
            params.delete("search");
            params.delete("type");
            params.delete("sort");
            params.set("page", "1");
            window.location.search = params.toString();
          }}
          className="flex items-center bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-3 py-1 rounded-full text-sm font-medium hover:bg-gray-300 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-orange-400 dark:focus:ring-orange-500 ml-2"
          aria-label="Reset all filters"
        >
          Reset All
        </button>
      )}
    </div>
  );
};

export default SpeakerFilterChips;
