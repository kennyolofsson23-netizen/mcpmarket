import { createReviewSchema } from "@/lib/validations/review";

describe("createReviewSchema", () => {
  describe("rating validation", () => {
    it("accepts rating of 1", () => {
      expect(createReviewSchema.safeParse({ rating: 1 }).success).toBe(true);
    });

    it("accepts rating of 2", () => {
      expect(createReviewSchema.safeParse({ rating: 2 }).success).toBe(true);
    });

    it("accepts rating of 3", () => {
      expect(createReviewSchema.safeParse({ rating: 3 }).success).toBe(true);
    });

    it("accepts rating of 4", () => {
      expect(createReviewSchema.safeParse({ rating: 4 }).success).toBe(true);
    });

    it("accepts rating of 5", () => {
      expect(createReviewSchema.safeParse({ rating: 5 }).success).toBe(true);
    });

    it("rejects rating of 0", () => {
      const result = createReviewSchema.safeParse({ rating: 0 });
      expect(result.success).toBe(false);
    });

    it("rejects rating of 6", () => {
      const result = createReviewSchema.safeParse({ rating: 6 });
      expect(result.success).toBe(false);
    });

    it("rejects negative rating", () => {
      const result = createReviewSchema.safeParse({ rating: -1 });
      expect(result.success).toBe(false);
    });

    it("rejects non-integer rating (2.5)", () => {
      const result = createReviewSchema.safeParse({ rating: 2.5 });
      expect(result.success).toBe(false);
    });

    it("rejects a string rating", () => {
      const result = createReviewSchema.safeParse({ rating: "5" });
      expect(result.success).toBe(false);
    });
  });

  describe("comment validation", () => {
    it("accepts a review without comment (comment is optional)", () => {
      const result = createReviewSchema.safeParse({ rating: 5 });
      expect(result.success).toBe(true);
    });

    it("accepts a review with comment undefined", () => {
      const result = createReviewSchema.safeParse({
        rating: 3,
        comment: undefined,
      });
      expect(result.success).toBe(true);
    });

    it("accepts a comment at exactly 2000 characters", () => {
      const result = createReviewSchema.safeParse({
        rating: 4,
        comment: "A".repeat(2000),
      });
      expect(result.success).toBe(true);
    });

    it("rejects a comment at 2001 characters", () => {
      const result = createReviewSchema.safeParse({
        rating: 4,
        comment: "A".repeat(2001),
      });
      expect(result.success).toBe(false);
    });

    it("accepts a comment with an empty string", () => {
      const result = createReviewSchema.safeParse({ rating: 3, comment: "" });
      expect(result.success).toBe(true);
    });

    it("accepts a short comment", () => {
      const result = createReviewSchema.safeParse({
        rating: 5,
        comment: "Great server!",
      });
      expect(result.success).toBe(true);
    });
  });
});
