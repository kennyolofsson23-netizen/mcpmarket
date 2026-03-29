import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "./globals.css";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Providers } from "@/components/providers";

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://mcpmarket.dev";

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: "MCPmarket — The Paid MCP Server Marketplace",
    template: "%s — MCPmarket",
  },
  description:
    "MCPmarket is the marketplace where developers list paid MCP servers and earn 80% of revenue. Stripe billing, managed hosting, instant config snippets.",
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
    title: "MCPmarket — The Paid MCP Server Marketplace",
    description:
      "List your MCP server, set a price, earn 80%. Stripe billing, managed hosting, one-click config for Claude, Cursor, and more.",
    images: [{ url: `${baseUrl}/og-image.jpg`, width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "MCPmarket — The Paid MCP Server Marketplace",
    description: "List your MCP server, set a price, earn 80%.",
    images: [`${baseUrl}/og-image.jpg`],
  },
  robots: { index: true, follow: true },
  alternates: { canonical: baseUrl },
};

// All JSON-LD schemas use hardcoded string literals — no user input, safe from XSS
const softwareAppSchema = JSON.stringify({
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "MCPmarket",
  description:
    "MCPmarket is the marketplace for paid MCP servers — developers list tools, set prices, and earn 80% of revenue with built-in Stripe billing and managed hosting.",
  applicationCategory: "DeveloperApplication",
  url: baseUrl,
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
});

const orgSchema = JSON.stringify({
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
});

const faqSchema = JSON.stringify({
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "What is MCPmarket?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "MCPmarket is the paid marketplace for MCP (Model Context Protocol) servers. Developers list MCP tools with a subscription or usage-based price, users subscribe with one click, and the platform handles billing, hosting, authentication, and monthly payouts.",
      },
    },
    {
      "@type": "Question",
      name: "How do I list my MCP server?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Sign in with GitHub or Google, upgrade to Developer status, and submit your listing. Basic tier is free with 20% revenue share.",
      },
    },
    {
      "@type": "Question",
      name: "What percentage does MCPmarket take?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "20% platform fee. Developers keep 80%. Payouts via Stripe Connect monthly, $25 minimum.",
      },
    },
  ],
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        {/* JSON-LD schemas — hardcoded literals, safe from XSS */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: softwareAppSchema }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: orgSchema }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: faqSchema }}
        />
      </head>
      <body className={`${GeistSans.variable} ${GeistMono.variable} font-sans`}>
        <Providers>
          <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:px-4 focus:py-2 focus:bg-cyan-500 focus:text-black focus:rounded"
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
