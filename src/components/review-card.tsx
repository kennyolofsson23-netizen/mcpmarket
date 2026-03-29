import { Avatar } from "@/components/ui/avatar";
import { StarRating } from "@/components/star-rating";
import type { ReviewWithUser } from "@/types";

interface ReviewCardProps {
  review: ReviewWithUser;
}

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(date));
}

export function ReviewCard({ review }: ReviewCardProps) {
  return (
    <div className="flex flex-col gap-2 py-4 border-b border-border last:border-0">
      <div className="flex items-center gap-3">
        <Avatar
          src={review.user.image}
          alt={review.user.name ?? "User"}
          fallback={review.user.name ?? "?"}
          size={36}
        />
        <div className="flex flex-col min-w-0">
          <span className="text-sm font-medium truncate">
            {review.user.name ?? "Anonymous"}
          </span>
          <span className="text-xs text-muted-foreground">
            {formatDate(review.createdAt)}
          </span>
        </div>
        <div className="ml-auto">
          <StarRating rating={review.rating} size="sm" />
        </div>
      </div>
      {review.comment && (
        <p className="text-sm text-foreground leading-relaxed pl-12">
          {review.comment}
        </p>
      )}
    </div>
  );
}
