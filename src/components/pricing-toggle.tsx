"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

interface PricingToggleProps {
  selected?: string;
}

const OPTIONS = [
  { value: "", label: "All" },
  { value: "FREE", label: "Free" },
  { value: "SUBSCRIPTION", label: "Paid" },
];

export function PricingToggle({ selected }: PricingToggleProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  function handleSelect(value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set("pricingModel", value);
    } else {
      params.delete("pricingModel");
    }
    params.delete("page");
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <div className="flex rounded-md border border-border overflow-hidden">
      {OPTIONS.map((opt) => {
        const isActive = (selected ?? "") === opt.value;
        return (
          <button
            key={opt.value}
            onClick={() => handleSelect(opt.value)}
            className={cn(
              "px-4 py-2 text-sm font-medium transition-colors",
              isActive
                ? "bg-primary text-primary-foreground"
                : "bg-background text-foreground hover:bg-accent",
              "border-r border-border last:border-r-0",
            )}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
