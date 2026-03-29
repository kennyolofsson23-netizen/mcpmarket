"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { SORT_OPTIONS } from "@/lib/constants";
import { Select } from "@/components/ui/select";

interface SortSelectProps {
  selected?: string;
}

export function SortSelect({ selected }: SortSelectProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const value = e.target.value;
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set("sort", value);
    } else {
      params.delete("sort");
    }
    params.delete("page");
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <Select
      options={SORT_OPTIONS.map((o) => ({ value: o.value, label: o.label }))}
      value={selected ?? "newest"}
      onChange={handleChange}
      aria-label="Sort servers"
    />
  );
}
