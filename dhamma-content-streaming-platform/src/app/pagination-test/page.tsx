"use client";

import PaginationControls from "@/components/PaginationControls";

export default function PaginationTestPage() {
  return (
    <div className="container mx-auto p-8">
      <h1 className="text-2xl font-bold mb-8">Pagination Controls Test</h1>

      <div className="space-y-8">
        <div>
          <h2 className="text-lg font-semibold mb-4">
            Test Case 1: Middle pages with double ellipsis (current page 10 of
            20)
          </h2>
          <PaginationControls currentPage={10} totalPages={20} />
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-4">
            Test Case 2: Early pages with single ellipsis (current page 2 of 15)
          </h2>
          <PaginationControls currentPage={2} totalPages={15} />
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-4">
            Test Case 3: Late pages with single ellipsis (current page 14 of 15)
          </h2>
          <PaginationControls currentPage={14} totalPages={15} />
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-4">
            Test Case 4: Small pagination (current page 2 of 5)
          </h2>
          <PaginationControls currentPage={2} totalPages={5} />
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-4">
            Test Case 5: Single page (should not render)
          </h2>
          <PaginationControls currentPage={1} totalPages={1} />
          <p className="text-gray-500 text-sm">
            ⬆ Should be empty (component doesn't render for single page)
          </p>
        </div>
      </div>
    </div>
  );
}
