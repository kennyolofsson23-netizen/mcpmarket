import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { Providers } from '@/components/providers';

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://mcpmarket.dev';

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: 'MCPmarket | Paid MCP Server Marketplace & Billing',
    template: '%s | MCPmarket',
  },
  description:
    'MCPmarket is the Shopify for MCP servers — a paid marketplace for listing, discovering, and subscribing to MCP tools with built-in billing infrastructure.',
  keywords: ['MCP marketplace', 'MCP servers', 'paid MCP tools', 'Claude MCP', 'AI tools marketplace'],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: baseUrl,
    siteName: 'MCPmarket',
    title: 'MCPmarket | Paid MCP Server Marketplace & Billing',
    description: 'The Shopify for MCP servers. Manage, monetize, and scale your MCP tools.',
    images: [{ url: `${baseUrl}/og-image.jpg`, width: 1200, height: 630, alt: 'MCPmarket' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'MCPmarket | Paid MCP Server Marketplace',
    description: 'The Shopify for MCP servers. Monetize your MCP tools with one-click billing.',
    images: [`${baseUrl}/og-image.jpg`],
  },
  robots: { index: true, follow: true },
  alternates: { canonical: baseUrl },
};

const softwareAppSchema = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'MCPmarket',
  description: 'The Shopify for MCP servers. Paid MCP Server Marketplace + Billing Infrastructure.',
  applicationCategory: 'Business',
  url: baseUrl,
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
};

const orgSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'MCPmarket',
  url: baseUrl,
  logo: `${baseUrl}/logo.png`,
  contactPoint: { '@type': 'ContactPoint', contactType: 'Customer Support', email: 'support@mcpmarket.dev' },
};

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'What is MCPmarket?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'MCPmarket is the paid marketplace for MCP servers — a billing and discovery layer for AI tool creators and power users.',
      },
    },
    {
      '@type': 'Question',
      name: 'How does revenue sharing work?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'MCPmarket takes a 20% revenue share on all transactions. Developers keep 80% of their subscription revenue.',
      },
    },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareAppSchema) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(orgSchema) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      </head>
      <body className={inter.variable}>
        <Providers>
          <a href="#main-content" className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded">
            Skip to main content
          </a>
          <Navbar />
          <main id="main-content" className="min-h-[calc(100vh-8rem)]" tabIndex={-1}>
            {children}
          </main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
