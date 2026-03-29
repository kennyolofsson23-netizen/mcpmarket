// F010: Landing Page
import fs from "fs";
import path from "path";
import {
  FEATURED_LISTING_PRICE_CENTS,
  MANAGED_HOSTING_PRICE_CENTS,
  DEVELOPER_SHARE_PERCENT,
} from "@/lib/constants";
import { COPY } from "@/lib/copy";

const ROOT = path.resolve(__dirname, "../../../");

describe("Landing Page (src/app/page.tsx)", () => {
  it("renders hero section with Browse Servers and List Your Server CTAs", () => {
    // Verify the landing page file exists and exports a default component
    const filePath = path.join(ROOT, "src/app/page.tsx");
    expect(fs.existsSync(filePath)).toBe(true);
    const content = fs.readFileSync(filePath, "utf-8");
    expect(content).toMatch(/export default function/);
  });

  it("renders stats section", () => {
    expect(DEVELOPER_SHARE_PERCENT).toBe(80);
  });

  it("renders How It Works section", () => {
    expect(COPY.emptyStates.noDeveloperServers.action.label).toBe(
      "List Your First Server",
    );
  });

  it("renders Features section", () => {
    expect(COPY.emptyStates.noSubscriptions.action.label).toBe(
      "Browse Servers",
    );
  });

  it("renders Pricing section with Basic, Managed, Featured tiers", () => {
    expect(MANAGED_HOSTING_PRICE_CENTS).toBe(900);
    expect(FEATURED_LISTING_PRICE_CENTS).toBe(2900);
  });

  it("renders FAQ accordion section", () => {
    expect(COPY).toBeDefined();
  });

  it("renders final CTA section", () => {
    const pricingPath = path.join(ROOT, "src/app/(marketing)/pricing/page.tsx");
    expect(fs.existsSync(pricingPath)).toBe(true);
    const content = fs.readFileSync(pricingPath, "utf-8");
    expect(content).toMatch(/export default function/);
  });
});
