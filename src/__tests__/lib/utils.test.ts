import { cn, formatPrice, formatDate } from "@/lib/utils";

describe("cn", () => {
  it("merges simple class names", () => {
    expect(cn("foo", "bar")).toBe("foo bar");
  });

  it("handles a single class name", () => {
    expect(cn("foo")).toBe("foo");
  });

  it("handles no arguments", () => {
    expect(cn()).toBe("");
  });

  it("filters out falsy conditional values", () => {
    expect(cn("foo", false && "bar", null, undefined, "baz")).toBe("foo baz");
  });

  it("handles object syntax for conditional classes", () => {
    expect(cn({ foo: true, bar: false, baz: true })).toBe("foo baz");
  });

  it("resolves Tailwind conflicts — last class wins", () => {
    // tailwind-merge resolves p-2 vs p-4; the last one should win
    expect(cn("p-2", "p-4")).toBe("p-4");
  });

  it("resolves conflicting text-color classes", () => {
    expect(cn("text-red-500", "text-blue-500")).toBe("text-blue-500");
  });

  it("handles array inputs", () => {
    expect(cn(["foo", "bar"], "baz")).toBe("foo bar baz");
  });
});

describe("formatPrice", () => {
  it("formats 0 cents as $0.00", () => {
    expect(formatPrice(0)).toBe("$0.00");
  });

  it("formats 100 cents as $1.00", () => {
    expect(formatPrice(100)).toBe("$1.00");
  });

  it("formats 1999 cents as $19.99", () => {
    expect(formatPrice(1999)).toBe("$19.99");
  });

  it("formats 2900 cents as $29.00", () => {
    expect(formatPrice(2900)).toBe("$29.00");
  });

  it("formats large amounts correctly", () => {
    expect(formatPrice(100000)).toBe("$1,000.00");
  });

  it("formats negative amounts", () => {
    // Intl.NumberFormat outputs −$1.00 or -$1.00 depending on locale impl
    const result = formatPrice(-100);
    expect(result).toMatch(/\$1\.00/);
  });

  it("formats 1 cent as $0.01", () => {
    expect(formatPrice(1)).toBe("$0.01");
  });
});

describe("formatDate", () => {
  it("formats a Date object", () => {
    // Use a fixed date to avoid timezone flakiness — UTC noon
    const date = new Date("2024-06-15T12:00:00.000Z");
    const result = formatDate(date);
    // Should contain the year and month name
    expect(result).toMatch(/2024/);
    expect(result).toMatch(/June|Jun/);
  });

  it("formats a date string", () => {
    const result = formatDate("2024-01-01T12:00:00.000Z");
    expect(result).toMatch(/2024/);
    expect(result).toMatch(/January|Jan/);
  });

  it("includes day, month, and year components", () => {
    const result = formatDate(new Date("2023-03-25T12:00:00.000Z"));
    expect(result).toMatch(/2023/);
    expect(result).toMatch(/March|Mar/);
    expect(result).toMatch(/25/);
  });

  it("formats different years correctly", () => {
    const result2020 = formatDate("2020-07-04T12:00:00.000Z");
    const result2025 = formatDate("2025-07-04T12:00:00.000Z");
    expect(result2020).toMatch(/2020/);
    expect(result2025).toMatch(/2025/);
  });

  it("returns a non-empty string for any valid input", () => {
    expect(formatDate(new Date()).length).toBeGreaterThan(0);
  });
});
