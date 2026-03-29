import Link from "next/link";
import { Github, Twitter, Mail } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-border bg-background">
      <div className="container max-w-6xl mx-auto px-4 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
          <div>
            <h2 className="font-bold mb-4">Product</h2>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/servers" className="hover:underline">
                  Browse Servers
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="hover:underline">
                  Pricing
                </Link>
              </li>
              <li>
                <Link href="/changelog" className="hover:underline">
                  Changelog
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h2 className="font-bold mb-4">Developers</h2>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/docs" className="hover:underline">
                  Documentation
                </Link>
              </li>
              <li>
                <Link href="/api-docs" className="hover:underline">
                  API Reference
                </Link>
              </li>
              <li>
                <Link href="/guides" className="hover:underline">
                  Getting Started
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h2 className="font-bold mb-4">Company</h2>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/about" className="hover:underline">
                  About
                </Link>
              </li>
              <li>
                <Link href="/blog" className="hover:underline">
                  Blog
                </Link>
              </li>
              <li>
                <Link href="/status" className="hover:underline">
                  Status
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h2 className="font-bold mb-4">Legal</h2>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/privacy" className="hover:underline">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:underline">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:underline">
                  Contact
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border pt-8 flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} MCPmarket. All rights reserved.
          </p>
          <div className="flex gap-4">
            <a
              href="https://twitter.com/mcpmarket"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-foreground"
              aria-label="MCPmarket on Twitter"
            >
              <Twitter className="w-5 h-5" />
            </a>
            <a
              href="https://github.com/mcpmarket"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-foreground"
              aria-label="MCPmarket on GitHub"
            >
              <Github className="w-5 h-5" />
            </a>
            <a
              href="mailto:support@mcpmarket.dev"
              className="hover:text-foreground"
              aria-label="Contact MCPmarket support"
            >
              <Mail className="w-5 h-5" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
