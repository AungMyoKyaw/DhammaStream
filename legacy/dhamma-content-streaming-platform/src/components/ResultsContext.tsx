"use client";

interface ResultsContextProps {
  currentPage: number;
  pageSize: number;
  totalCount: number;
  search?: string;
}

export default function ResultsContext({
  currentPage,
  pageSize,
  totalCount,
  search
}: ResultsContextProps) {
  const startItem = totalCount === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalCount);

  const getResultsText = () => {
    if (totalCount === 0) {
      return search ? `No results found for "${search}"` : "No content found";
    }

    const itemText = totalCount === 1 ? "item" : "items";

    if (totalCount <= pageSize) {
      return search
        ? `${totalCount} ${itemText} found for "${search}"`
        : `${totalCount} ${itemText} found`;
    }

    const contextText = `Showing ${startItem}-${endItem} of ${totalCount} ${itemText}`;
    return search ? `${contextText} for "${search}"` : contextText;
  };

  return (
    <div className="flex items-center justify-between mb-4">
      <p className="text-gray-600 font-medium">{getResultsText()}</p>
    </div>
  );
}
