import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Providers } from "@/components/providers";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://mcpmarket.dev";

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: "MCPmarket — Free MCP Server Marketplace with Billing",
    template: "%s — MCPmarket",
  },
  description:
    "MCPmarket is a free MCP server marketplace where developers list paid tools and earn 80% of revenue. Discover and subscribe to premium MCP servers now.",
  keywords: [
    "MCP marketplace",
    "MCP servers",
    "paid MCP tools",
    "Claude MCP",
    "AI tools marketplace",
    "monetize MCP server",
    "MCP billing",
  ],
  openGraph: {
    type: "website",
    locale: "en_US",
    url: baseUrl,
    siteName: "MCPmarket",
    title: "MCPmarket — Free MCP Server Marketplace with Billing",
    description:
      "The paid marketplace for MCP servers. Developers list tools, set prices, and earn 80% of revenue. Users subscribe and connect in one click.",
    images: [
      {
        url: `${baseUrl}/og-image.jpg`,
        width: 1200,
        height: 630,
        alt: "MCPmarket — Free MCP Server Marketplace with Billing",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "MCPmarket — Free MCP Server Marketplace",
    description:
      "List your MCP server, set a price, and earn 80% of every subscription. MCPmarket handles billing, hosting, and payouts.",
    images: [`${baseUrl}/og-image.jpg`],
  },
  robots: { index: true, follow: true },
  alternates: { canonical: baseUrl },
};

const softwareAppSchema = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "MCPmarket",
  description:
    "MCPmarket is a free MCP server marketplace for listing, discovering, and subscribing to paid MCP tools, with built-in Stripe billing, managed hosting, and developer payouts.",
  applicationCategory: "DeveloperApplication",
  url: baseUrl,
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
};

const orgSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "MCPmarket",
  url: baseUrl,
  logo: `${baseUrl}/logo.png`,
  contactPoint: {
    "@type": "ContactPoint",
    contactType: "Customer Support",
    email: "support@mcpmarket.dev",
  },
};

// FAQ text must match the visible <h3> and <p> content in src/app/page.tsx exactly.
const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "What is MCPmarket?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "MCPmarket is the paid marketplace for MCP (Model Context Protocol) servers. Developers list MCP tools with a subscription or usage-based price, users subscribe with one click, and the platform handles billing, hosting, authentication, and monthly payouts. It is the only MCP marketplace that combines discovery, managed hosting, and developer monetization in one platform.",
      },
    },
    {
      "@type": "Question",
      name: "How do I list my MCP server on MCPmarket?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Sign in with GitHub or Google, upgrade your account to Developer status, and submit your server listing with a name, description, category, pricing model, and endpoint URL. Listings are reviewed within 24 hours. The Basic listing tier is free with a 20% revenue share. Managed hosting ($9/mo per server) and Featured placement ($29/mo per server) are optional add-ons.",
      },
    },
    {
      "@type": "Question",
      name: "What percentage does MCPmarket take from developer revenue?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "MCPmarket takes a 20% platform fee on all subscription and usage-based transactions. Developers keep 80% of gross revenue. Payouts are processed via Stripe Connect on the 1st of each month for the prior month's earnings, with a $25 minimum payout threshold.",
      },
    },
    {
      "@type": "Question",
      name: "Which AI clients can connect to MCP servers listed on MCPmarket?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Any client that supports the Model Context Protocol can connect, including Claude Desktop, Cursor, Windsurf, and other MCP-compatible AI assistants. After subscribing, users receive a ready-to-paste JSON configuration snippet for their MCP client settings file — no manual setup required.",
      },
    },
    {
      "@type": "Question",
      name: "How does MCPmarket compare to free MCP directories like mcp.so?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Free directories like mcp.so and mcpservers.org provide listings only — no billing infrastructure, no hosted endpoints, and no developer payouts. MCPmarket adds Stripe subscription billing, optional managed server hosting, API key authentication, usage metering, and monthly revenue payouts. Developers on MCPmarket earn revenue; developers on free directories do not.",
      },
    },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(softwareAppSchema),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(orgSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
      </head>
      <body className={`${inter.variable} font-sans`}>
        <Providers>
          <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded"
          >
            Skip to main content
          </a>
          <Navbar />
          <main
            id="main-content"
            className="min-h-[calc(100vh-8rem)]"
            tabIndex={-1}
          >
            {children}
          </main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
