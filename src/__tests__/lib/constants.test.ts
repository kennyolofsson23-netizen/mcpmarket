import {
  CATEGORIES,
  PRICING_MODELS,
  SERVER_STATUSES,
  SUBSCRIPTION_STATUSES,
  USER_ROLES,
  PLATFORM_FEE_PERCENT,
  DEVELOPER_SHARE_PERCENT,
  MANAGED_HOSTING_PRICE_CENTS,
  FEATURED_LISTING_PRICE_CENTS,
  MIN_PAYOUT_CENTS,
  SORT_OPTIONS,
  WEBHOOK_EVENTS,
} from "@/lib/constants";

describe("Fee percentages", () => {
  it("PLATFORM_FEE_PERCENT + DEVELOPER_SHARE_PERCENT equals 100", () => {
    expect(PLATFORM_FEE_PERCENT + DEVELOPER_SHARE_PERCENT).toBe(100);
  });

  it("PLATFORM_FEE_PERCENT is 20", () => {
    expect(PLATFORM_FEE_PERCENT).toBe(20);
  });

  it("DEVELOPER_SHARE_PERCENT is 80", () => {
    expect(DEVELOPER_SHARE_PERCENT).toBe(80);
  });
});

describe("CATEGORIES", () => {
  it("all categories have a unique value", () => {
    const values = CATEGORIES.map((c) => c.value);
    const unique = new Set(values);
    expect(unique.size).toBe(CATEGORIES.length);
  });

  it("all categories have a non-empty label", () => {
    CATEGORIES.forEach((c) => {
      expect(c.label.trim().length).toBeGreaterThan(0);
    });
  });

  it("all categories have a non-empty value", () => {
    CATEGORIES.forEach((c) => {
      expect(c.value.trim().length).toBeGreaterThan(0);
    });
  });

  it("contains the 'general' category", () => {
    const values = CATEGORIES.map((c) => c.value);
    expect(values).toContain("general");
  });

  it("contains expected category values", () => {
    const values = CATEGORIES.map((c) => c.value);
    expect(values).toContain("developer-tools");
    expect(values).toContain("data");
    expect(values).toContain("productivity");
    expect(values).toContain("security");
    expect(values).toContain("devops");
    expect(values).toContain("ai-ml");
  });
});

describe("PRICING_MODELS", () => {
  it("contains FREE, SUBSCRIPTION, and USAGE", () => {
    const values = PRICING_MODELS.map((p) => p.value);
    expect(values).toContain("FREE");
    expect(values).toContain("SUBSCRIPTION");
    expect(values).toContain("USAGE");
  });

  it("all pricing models have a non-empty label", () => {
    PRICING_MODELS.forEach((p) => {
      expect(p.label.trim().length).toBeGreaterThan(0);
    });
  });

  it("all pricing models have a unique value", () => {
    const values = PRICING_MODELS.map((p) => p.value);
    const unique = new Set(values);
    expect(unique.size).toBe(PRICING_MODELS.length);
  });
});

describe("SERVER_STATUSES", () => {
  it("contains PENDING, APPROVED, REJECTED, SUSPENDED", () => {
    expect(SERVER_STATUSES.PENDING).toBe("PENDING");
    expect(SERVER_STATUSES.APPROVED).toBe("APPROVED");
    expect(SERVER_STATUSES.REJECTED).toBe("REJECTED");
    expect(SERVER_STATUSES.SUSPENDED).toBe("SUSPENDED");
  });

  it("all values are non-empty strings", () => {
    Object.values(SERVER_STATUSES).forEach((v) => {
      expect(typeof v).toBe("string");
      expect(v.length).toBeGreaterThan(0);
    });
  });
});

describe("SUBSCRIPTION_STATUSES", () => {
  it("contains ACTIVE, CANCELED, PAST_DUE", () => {
    expect(SUBSCRIPTION_STATUSES.ACTIVE).toBe("ACTIVE");
    expect(SUBSCRIPTION_STATUSES.CANCELED).toBe("CANCELED");
    expect(SUBSCRIPTION_STATUSES.PAST_DUE).toBe("PAST_DUE");
  });

  it("all values are non-empty strings", () => {
    Object.values(SUBSCRIPTION_STATUSES).forEach((v) => {
      expect(typeof v).toBe("string");
      expect(v.length).toBeGreaterThan(0);
    });
  });
});

describe("USER_ROLES", () => {
  it("contains USER, DEVELOPER, ADMIN", () => {
    expect(USER_ROLES.USER).toBe("USER");
    expect(USER_ROLES.DEVELOPER).toBe("DEVELOPER");
    expect(USER_ROLES.ADMIN).toBe("ADMIN");
  });

  it("all values are non-empty strings", () => {
    Object.values(USER_ROLES).forEach((v) => {
      expect(typeof v).toBe("string");
      expect(v.length).toBeGreaterThan(0);
    });
  });
});

describe("Price constants", () => {
  it("MANAGED_HOSTING_PRICE_CENTS is 900", () => {
    expect(MANAGED_HOSTING_PRICE_CENTS).toBe(900);
  });

  it("FEATURED_LISTING_PRICE_CENTS is 2900", () => {
    expect(FEATURED_LISTING_PRICE_CENTS).toBe(2900);
  });

  it("MIN_PAYOUT_CENTS is 2500", () => {
    expect(MIN_PAYOUT_CENTS).toBe(2500);
  });
});

describe("SORT_OPTIONS", () => {
  it("contains popular, newest, and rating", () => {
    const values = SORT_OPTIONS.map((s) => s.value);
    expect(values).toContain("popular");
    expect(values).toContain("newest");
    expect(values).toContain("rating");
  });

  it("all sort options have a non-empty label", () => {
    SORT_OPTIONS.forEach((s) => {
      expect(s.label.trim().length).toBeGreaterThan(0);
    });
  });

  it("has exactly 3 sort options", () => {
    expect(SORT_OPTIONS.length).toBe(3);
  });
});

describe("WEBHOOK_EVENTS", () => {
  it("contains exactly 3 events", () => {
    expect(WEBHOOK_EVENTS.length).toBe(3);
  });

  it("contains subscription.created", () => {
    expect(WEBHOOK_EVENTS).toContain("subscription.created");
  });

  it("contains subscription.canceled", () => {
    expect(WEBHOOK_EVENTS).toContain("subscription.canceled");
  });

  it("contains subscription.payment_failed", () => {
    expect(WEBHOOK_EVENTS).toContain("subscription.payment_failed");
  });
});
