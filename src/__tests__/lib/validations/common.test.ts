import {
  paginationSchema,
  searchSchema,
  idSchema,
  slugSchema,
  emailSchema,
} from "@/lib/validations/common";

describe("paginationSchema", () => {
  it("applies default page=1 and limit=20", () => {
    const result = paginationSchema.safeParse({});
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(1);
      expect(result.data.limit).toBe(20);
    }
  });

  it("coerces string page to number", () => {
    const result = paginationSchema.safeParse({ page: "3" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(3);
    }
  });

  it("coerces string limit to number", () => {
    const result = paginationSchema.safeParse({ limit: "50" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.limit).toBe(50);
    }
  });

  it("rejects page < 1", () => {
    expect(paginationSchema.safeParse({ page: 0 }).success).toBe(false);
    expect(paginationSchema.safeParse({ page: -1 }).success).toBe(false);
  });

  it("rejects limit > 100", () => {
    expect(paginationSchema.safeParse({ limit: 101 }).success).toBe(false);
  });

  it("accepts limit = 100 (boundary)", () => {
    const result = paginationSchema.safeParse({ limit: 100 });
    expect(result.success).toBe(true);
  });

  it("accepts limit = 1 (boundary)", () => {
    const result = paginationSchema.safeParse({ limit: 1 });
    expect(result.success).toBe(true);
  });

  it("rejects limit < 1", () => {
    expect(paginationSchema.safeParse({ limit: 0 }).success).toBe(false);
  });
});

describe("searchSchema", () => {
  it("all fields are optional — accepts empty object", () => {
    const result = searchSchema.safeParse({});
    expect(result.success).toBe(true);
  });

  it("sort defaults to 'popular'", () => {
    const result = searchSchema.safeParse({});
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.sort).toBe("popular");
    }
  });

  it("accepts valid sort values", () => {
    for (const sort of ["popular", "newest", "rating"] as const) {
      const result = searchSchema.safeParse({ sort });
      expect(result.success).toBe(true);
    }
  });

  it("rejects an invalid sort value", () => {
    expect(searchSchema.safeParse({ sort: "alphabetical" }).success).toBe(
      false,
    );
  });

  it("accepts valid pricing values", () => {
    for (const pricing of ["FREE", "SUBSCRIPTION", "USAGE", "all"] as const) {
      const result = searchSchema.safeParse({ pricing });
      expect(result.success).toBe(true);
    }
  });

  it("rejects an invalid pricing value", () => {
    expect(searchSchema.safeParse({ pricing: "ENTERPRISE" }).success).toBe(
      false,
    );
  });

  it("accepts a search query string", () => {
    const result = searchSchema.safeParse({ q: "my search" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.q).toBe("my search");
    }
  });

  it("accepts a category string", () => {
    const result = searchSchema.safeParse({ category: "developer-tools" });
    expect(result.success).toBe(true);
  });

  it("coerces page and limit from strings", () => {
    const result = searchSchema.safeParse({ page: "2", limit: "10" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(2);
      expect(result.data.limit).toBe(10);
    }
  });

  it("rejects page < 1", () => {
    expect(searchSchema.safeParse({ page: 0 }).success).toBe(false);
  });

  it("rejects limit > 100", () => {
    expect(searchSchema.safeParse({ limit: 101 }).success).toBe(false);
  });
});

describe("idSchema", () => {
  it("accepts a valid cuid", () => {
    // A well-formed cuid starts with 'c' and is 25 chars long
    const result = idSchema.safeParse({ id: "clh3pxz0o0000qxrmgv5eabc1" });
    expect(result.success).toBe(true);
  });

  it("rejects an empty string", () => {
    expect(idSchema.safeParse({ id: "" }).success).toBe(false);
  });

  it("rejects a non-cuid string like a UUID", () => {
    const result = idSchema.safeParse({
      id: "550e8400-e29b-41d4-a716-446655440000",
    });
    expect(result.success).toBe(false);
  });

  it("rejects a plain non-cuid string", () => {
    expect(idSchema.safeParse({ id: "not-a-cuid" }).success).toBe(false);
  });

  it("rejects missing id", () => {
    expect(idSchema.safeParse({}).success).toBe(false);
  });
});

describe("slugSchema", () => {
  it("accepts a non-empty slug string", () => {
    expect(slugSchema.safeParse({ slug: "my-server" }).success).toBe(true);
  });

  it("accepts a single-character slug", () => {
    expect(slugSchema.safeParse({ slug: "a" }).success).toBe(true);
  });

  it("rejects an empty string slug", () => {
    expect(slugSchema.safeParse({ slug: "" }).success).toBe(false);
  });

  it("rejects missing slug", () => {
    expect(slugSchema.safeParse({}).success).toBe(false);
  });

  it("accepts slugs with hyphens", () => {
    expect(slugSchema.safeParse({ slug: "my-awesome-server-v2" }).success).toBe(
      true,
    );
  });
});

describe("emailSchema", () => {
  it("accepts a valid email address", () => {
    expect(emailSchema.safeParse({ email: "user@example.com" }).success).toBe(
      true,
    );
  });

  it("rejects an invalid email (no @)", () => {
    expect(emailSchema.safeParse({ email: "notanemail" }).success).toBe(false);
  });

  it("rejects an invalid email (no domain)", () => {
    expect(emailSchema.safeParse({ email: "user@" }).success).toBe(false);
  });

  it("rejects an empty string email", () => {
    expect(emailSchema.safeParse({ email: "" }).success).toBe(false);
  });

  it("rejects missing email", () => {
    expect(emailSchema.safeParse({}).success).toBe(false);
  });

  it("accepts email with subdomain", () => {
    expect(
      emailSchema.safeParse({ email: "admin@mail.example.co.uk" }).success,
    ).toBe(true);
  });
});
