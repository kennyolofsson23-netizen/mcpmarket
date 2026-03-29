"use client";

import { useState } from "react";
import { StarRating } from "@/components/star-rating";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import type { Review } from "@/types";

interface ReviewFormProps {
  serverId: string;
  serverSlug: string;
  existingReview?: Review | null;
}

function buildInitialState(existing?: Review | null) {
  return {
    rating: existing?.rating ?? 0,
    comment: existing?.comment ?? "",
  };
}

export function ReviewForm({ serverSlug, existingReview }: ReviewFormProps) {
  const initial = buildInitialState(existingReview);
  const [rating, setRating] = useState(initial.rating);
  const [comment, setComment] = useState(initial.comment);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (rating === 0) {
      setError("Please select a star rating.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/servers/${serverSlug}/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating, comment }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error((data as { error?: string }).error ?? "Failed to submit review");
      }
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="rounded-md bg-green-50 border border-green-200 p-4 text-sm text-green-800">
        {existingReview ? "Review updated successfully." : "Review submitted successfully. Thank you!"}
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div>
        <p className="text-sm font-medium mb-2">Your Rating</p>
        <StarRating
          rating={rating}
          size="lg"
          interactive
          onChange={setRating}
        />
      </div>
      <Textarea
        label="Your Review (optional)"
        placeholder="Share your experience with this server..."
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        rows={4}
      />
      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}
      <Button type="submit" loading={loading} disabled={loading}>
        {existingReview ? "Update Review" : "Submit Review"}
      </Button>
    </form>
  );
}
