"use client";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem
} from "@/components/ui/select";

interface SortDropdownProps {
  sort: string;
  search?: string;
  type?: string;
  page?: number;
}

const sortOptions = [
  { value: "newest", label: "Newest" },
  { value: "oldest", label: "Oldest" },
  { value: "title-asc", label: "Title A-Z" },
  { value: "title-desc", label: "Title Z-A" }
];

export default function SortDropdown({
  sort,
  search = "",
  type = "all",
  page = 1
}: Readonly<SortDropdownProps>) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const handleChange = (newSort: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("sort", newSort);
    if (search) params.set("search", search);
    if (type) params.set("type", type);
    if (page) params.set("page", String(page));
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="flex items-center gap-2">
      <label htmlFor="sort" className="text-sm text-gray-600 font-medium">
        Sort by:
      </label>
      <Select value={sort} onValueChange={handleChange}>
        <SelectTrigger className="w-40 h-9 text-sm border-gray-200 focus:ring-2 focus:ring-orange-400">
          <SelectValue placeholder="Select sort" />
        </SelectTrigger>
        <SelectContent>
          {sortOptions.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
