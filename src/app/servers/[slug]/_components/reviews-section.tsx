import { ReviewCard } from "@/components/review-card";
import { ReviewForm } from "@/components/review-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ReviewWithUser, Review, Subscription } from "@/types";

interface ReviewsSectionProps {
  reviews: ReviewWithUser[];
  serverId: string;
  serverSlug: string;
  userSubscription: Subscription | null;
  existingReview: Review | null;
  isSignedIn: boolean;
}

export function ReviewsSection({
  reviews,
  serverId,
  serverSlug,
  userSubscription,
  existingReview,
  isSignedIn,
}: ReviewsSectionProps) {
  const canReview = !!userSubscription;
  return (
    <section aria-labelledby="reviews-heading">
      <h2 id="reviews-heading" className="text-xl font-semibold mb-4">
        Reviews
        {reviews.length > 0 && (
          <span className="ml-2 text-sm font-normal text-muted-foreground">
            ({reviews.length})
          </span>
        )}
      </h2>

      {isSignedIn && canReview && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-base">
              {existingReview ? "Edit Your Review" : "Leave a Review"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ReviewForm
              serverId={serverId}
              serverSlug={serverSlug}
              existingReview={existingReview}
            />
          </CardContent>
        </Card>
      )}

      {!isSignedIn && (
        <p className="text-sm text-muted-foreground mb-4">
          <a href="/auth/signin" className="underline">
            Sign in
          </a>{" "}
          and subscribe to leave a review.
        </p>
      )}

      {isSignedIn && !canReview && (
        <p className="text-sm text-muted-foreground mb-4">
          Subscribe to this server to leave a review.
        </p>
      )}

      {reviews.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No reviews yet. Be the first!
        </p>
      ) : (
        <div className="flex flex-col">
          {reviews.map((review) => (
            <ReviewCard key={review.id} review={review} />
          ))}
        </div>
      )}
    </section>
  );
}
