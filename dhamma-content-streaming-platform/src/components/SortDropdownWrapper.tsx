"use client";
import SortDropdown from "@/components/SortDropdown";

interface SortDropdownWrapperProps {
  sort: string;
  search?: string;
  type?: string;
  page?: number;
}

export default function SortDropdownWrapper(props: SortDropdownWrapperProps) {
  return <SortDropdown {...props} />;
}
