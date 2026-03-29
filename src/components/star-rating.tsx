"use client";

import { useState } from "react";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface StarRatingProps {
  rating: number;
  maxRating?: number;
  size?: "sm" | "md" | "lg";
  interactive?: boolean;
  onChange?: (rating: number) => void;
}

const sizeMap = { sm: "h-3 w-3", md: "h-5 w-5", lg: "h-6 w-6" };

export function StarRating({
  rating,
  maxRating = 5,
  size = "md",
  interactive = false,
  onChange,
}: StarRatingProps) {
  const [hovered, setHovered] = useState(0);
  const iconClass = sizeMap[size];
  const effective = interactive && hovered > 0 ? hovered : rating;

  return (
    <div
      className={cn("flex items-center gap-0.5", interactive && "cursor-pointer")}
      role={interactive ? "radiogroup" : undefined}
      aria-label={interactive ? "Star rating" : `${rating} out of ${maxRating} stars`}
    >
      {Array.from({ length: maxRating }, (_, i) => i + 1).map((star) => (
        <Star
          key={star}
          className={cn(
            iconClass,
            "transition-colors",
            star <= effective
              ? "fill-amber-400 text-amber-400"
              : "fill-muted text-muted-foreground",
            interactive && "hover:fill-amber-400 hover:text-amber-400",
          )}
          onClick={interactive ? () => onChange?.(star) : undefined}
          onMouseEnter={interactive ? () => setHovered(star) : undefined}
          onMouseLeave={interactive ? () => setHovered(0) : undefined}
          role={interactive ? "radio" : undefined}
          aria-checked={interactive ? star === rating : undefined}
          aria-label={interactive ? `${star} star${star !== 1 ? "s" : ""}` : undefined}
          tabIndex={interactive ? 0 : undefined}
          onKeyDown={
            interactive
              ? (e) => {
                  if (e.key === "Enter" || e.key === " ") onChange?.(star);
                }
              : undefined
          }
        />
      ))}
    </div>
  );
}
