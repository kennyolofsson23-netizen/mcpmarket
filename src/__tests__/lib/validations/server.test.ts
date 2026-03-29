import {
  createServerSchema,
  updateServerSchema,
} from "@/lib/validations/server";

const validFreeServer = {
  name: "My MCP Server",
  description: "A useful MCP server for developers",
  endpointUrl: "https://api.example.com/mcp",
  pricingModel: "FREE" as const,
};

const validSubscriptionServer = {
  name: "Pro MCP Server",
  description: "A premium MCP server for professionals",
  endpointUrl: "https://api.example.com/mcp",
  pricingModel: "SUBSCRIPTION" as const,
  price: 999,
};

const validUsageServer = {
  name: "Usage MCP Server",
  description: "A pay-per-use MCP server for developers",
  endpointUrl: "https://api.example.com/mcp",
  pricingModel: "USAGE" as const,
  usagePrice: 0.01,
  freeCallLimit: 100,
};

describe("createServerSchema", () => {
  describe("valid inputs", () => {
    it("accepts a valid FREE server with endpointUrl", () => {
      const result = createServerSchema.safeParse(validFreeServer);
      expect(result.success).toBe(true);
    });

    it("accepts a valid SUBSCRIPTION server with price", () => {
      const result = createServerSchema.safeParse(validSubscriptionServer);
      expect(result.success).toBe(true);
    });

    it("accepts a valid USAGE server with usagePrice and freeCallLimit", () => {
      const result = createServerSchema.safeParse(validUsageServer);
      expect(result.success).toBe(true);
    });

    it("accepts managedHosting=true without endpointUrl", () => {
      const result = createServerSchema.safeParse({
        name: "Managed Server",
        description: "A managed MCP server hosted on our platform",
        managedHosting: true,
        pricingModel: "FREE",
      });
      expect(result.success).toBe(true);
    });

    it("defaults category to 'general'", () => {
      const result = createServerSchema.safeParse(validFreeServer);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.category).toBe("general");
      }
    });

    it("defaults tags to []", () => {
      const result = createServerSchema.safeParse(validFreeServer);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.tags).toEqual([]);
      }
    });

    it("defaults pricingModel to 'FREE'", () => {
      const result = createServerSchema.safeParse({
        name: "Simple Server",
        description: "A simple MCP server for testing purposes",
        endpointUrl: "https://api.example.com/mcp",
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.pricingModel).toBe("FREE");
      }
    });

    it("accepts a server with all optional fields populated", () => {
      const result = createServerSchema.safeParse({
        ...validFreeServer,
        longDescription: "A very detailed description of this MCP server.",
        category: "developer-tools",
        tags: ["api", "tools"],
        logoUrl: "https://example.com/logo.png",
        repoUrl: "https://github.com/example/repo",
        websiteUrl: "https://example.com",
        dockerImage: "example/mcp-server:latest",
        githubRepoUrl: "https://github.com/example/repo",
      });
      expect(result.success).toBe(true);
    });

    it("accepts empty string for optional URL fields", () => {
      const result = createServerSchema.safeParse({
        ...validFreeServer,
        logoUrl: "",
        repoUrl: "",
        websiteUrl: "",
      });
      expect(result.success).toBe(true);
    });
  });

  describe("name validation", () => {
    it("rejects a name that is too short (< 2 chars)", () => {
      const result = createServerSchema.safeParse({
        ...validFreeServer,
        name: "A",
      });
      expect(result.success).toBe(false);
    });

    it("rejects a name that is too long (> 100 chars)", () => {
      const result = createServerSchema.safeParse({
        ...validFreeServer,
        name: "A".repeat(101),
      });
      expect(result.success).toBe(false);
    });

    it("accepts a name at the minimum length (2 chars)", () => {
      const result = createServerSchema.safeParse({
        ...validFreeServer,
        name: "AB",
      });
      expect(result.success).toBe(true);
    });
  });

  describe("description validation", () => {
    it("rejects a description that is too short (< 10 chars)", () => {
      const result = createServerSchema.safeParse({
        ...validFreeServer,
        description: "Too short",
      });
      expect(result.success).toBe(false);
    });

    it("rejects a description that is too long (> 200 chars)", () => {
      const result = createServerSchema.safeParse({
        ...validFreeServer,
        description: "A".repeat(201),
      });
      expect(result.success).toBe(false);
    });

    it("accepts a description at the minimum length (10 chars)", () => {
      const result = createServerSchema.safeParse({
        ...validFreeServer,
        description: "1234567890",
      });
      expect(result.success).toBe(true);
    });
  });

  describe("SUBSCRIPTION pricing validation", () => {
    it("rejects SUBSCRIPTION without price", () => {
      const result = createServerSchema.safeParse({
        ...validFreeServer,
        pricingModel: "SUBSCRIPTION",
        price: undefined,
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        const priceError = result.error.issues.find((i) =>
          i.path.includes("price"),
        );
        expect(priceError?.message).toBe(
          "Price is required for subscription pricing",
        );
      }
    });

    it("rejects SUBSCRIPTION with price = 0", () => {
      const result = createServerSchema.safeParse({
        ...validFreeServer,
        pricingModel: "SUBSCRIPTION",
        price: 0,
      });
      expect(result.success).toBe(false);
    });

    it("rejects SUBSCRIPTION with negative price", () => {
      const result = createServerSchema.safeParse({
        ...validFreeServer,
        pricingModel: "SUBSCRIPTION",
        price: -1,
      });
      expect(result.success).toBe(false);
    });
  });

  describe("USAGE pricing validation", () => {
    it("rejects USAGE without usagePrice", () => {
      const result = createServerSchema.safeParse({
        ...validFreeServer,
        pricingModel: "USAGE",
        freeCallLimit: 100,
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        const err = result.error.issues.find((i) =>
          i.path.includes("usagePrice"),
        );
        expect(err?.message).toBe(
          "Usage price is required for usage-based pricing",
        );
      }
    });

    it("rejects USAGE with usagePrice = 0", () => {
      const result = createServerSchema.safeParse({
        ...validFreeServer,
        pricingModel: "USAGE",
        usagePrice: 0,
        freeCallLimit: 100,
      });
      expect(result.success).toBe(false);
    });

    it("rejects USAGE without freeCallLimit", () => {
      const result = createServerSchema.safeParse({
        ...validFreeServer,
        pricingModel: "USAGE",
        usagePrice: 0.01,
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        const err = result.error.issues.find((i) =>
          i.path.includes("freeCallLimit"),
        );
        expect(err?.message).toBe(
          "Free call limit is required for usage-based pricing",
        );
      }
    });

    it("rejects USAGE without both usagePrice and freeCallLimit", () => {
      const result = createServerSchema.safeParse({
        ...validFreeServer,
        pricingModel: "USAGE",
      });
      expect(result.success).toBe(false);
    });
  });

  describe("endpoint URL validation", () => {
    it("rejects when managedHosting=false and no endpointUrl", () => {
      const result = createServerSchema.safeParse({
        name: "My Server",
        description: "A description that is long enough",
        managedHosting: false,
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        const err = result.error.issues.find((i) =>
          i.path.includes("endpointUrl"),
        );
        expect(err?.message).toBe(
          "Endpoint URL is required unless using managed hosting",
        );
      }
    });

    it("rejects an invalid endpointUrl (not a URL)", () => {
      const result = createServerSchema.safeParse({
        ...validFreeServer,
        endpointUrl: "not-a-url",
      });
      expect(result.success).toBe(false);
    });

    it("accepts endpointUrl as empty string (treated as falsy → triggers managed hosting check)", () => {
      // empty string is allowed by the union, but managedHosting=false + endpointUrl=""
      // endpointUrl="" is falsy → triggers the custom issue
      const result = createServerSchema.safeParse({
        name: "My Server",
        description: "A description that is long enough",
        managedHosting: false,
        endpointUrl: "",
      });
      expect(result.success).toBe(false);
    });
  });
});

describe("updateServerSchema", () => {
  it("accepts an empty object (all fields optional)", () => {
    const result = updateServerSchema.safeParse({});
    expect(result.success).toBe(true);
  });

  it("accepts a partial update with only name", () => {
    const result = updateServerSchema.safeParse({ name: "New Name" });
    expect(result.success).toBe(true);
  });

  it("accepts a partial update with only description", () => {
    const result = updateServerSchema.safeParse({
      description: "Updated description text",
    });
    expect(result.success).toBe(true);
  });

  it("accepts a partial update with only pricingModel", () => {
    const result = updateServerSchema.safeParse({ pricingModel: "FREE" });
    expect(result.success).toBe(true);
  });

  it("still validates types when fields are provided", () => {
    const result = updateServerSchema.safeParse({ name: 123 });
    expect(result.success).toBe(false);
  });
});
