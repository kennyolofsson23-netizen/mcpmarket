import * as React from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  src?: string | null;
  alt?: string;
  fallback?: string;
  size?: number;
}

function Avatar({
  className,
  src,
  alt,
  fallback,
  size = 40,
  ...props
}: AvatarProps) {
  const initials = fallback
    ? fallback
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "?";

  return (
    <div
      className={cn(
        "relative flex shrink-0 overflow-hidden rounded-full bg-muted",
        className,
      )}
      style={{ width: size, height: size }}
      {...props}
    >
      {src ? (
        <Image
          src={src}
          alt={alt ?? "Avatar"}
          fill
          sizes={`${size}px`}
          className="object-cover"
        />
      ) : (
        <span
          className="flex h-full w-full items-center justify-center text-xs font-medium text-muted-foreground"
          aria-label={alt ?? "Avatar"}
        >
          {initials}
        </span>
      )}
    </div>
  );
}

export { Avatar };
