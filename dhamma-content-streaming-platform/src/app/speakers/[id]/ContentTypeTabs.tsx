"use client";
import { useRouter, useSearchParams } from "next/navigation";

export default function ContentTypeTabs() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const type = searchParams.get("type") || "all";
  const types = [
    { label: "All", value: "all" },
    { label: "Video", value: "video" },
    { label: "Audio", value: "audio" },
    { label: "Book", value: "ebook" }
  ];

  function handleTabClick(newType: string) {
    const params = new URLSearchParams(Array.from(searchParams.entries()));
    if (newType === "all") {
      params.delete("type");
    } else {
      params.set("type", newType);
    }
    params.set("page", "1");
    router.push(`?${params.toString()}`);
  }

  return (
    <div className="flex flex-wrap gap-1 sm:space-x-1">
      {types.map((t) => (
        <button
          key={t.value}
          type="button"
          aria-pressed={type === t.value}
          aria-label={`Filter by ${t.label}`}
          className={`px-3 py-2 md:px-4 rounded-lg text-xs md:text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-orange-400 ${
            type === t.value
              ? "bg-orange-600 text-white shadow-sm"
              : "bg-white text-gray-700 border border-gray-200 hover:bg-orange-50 hover:border-orange-200 hover:text-orange-700"
          }`}
          onClick={() => handleTabClick(t.value)}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}
