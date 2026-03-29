import Link from "next/link";
import { Github, Twitter, Mail, Terminal } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-zinc-800/50 bg-[#070710]">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-10">
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="w-6 h-6 rounded bg-cyan-400/10 border border-cyan-400/20 flex items-center justify-center">
                <Terminal className="w-3 h-3 text-cyan-400" />
              </div>
              <span className="font-semibold text-zinc-300 text-sm">
                MCP<span className="text-cyan-400">market</span>
              </span>
            </Link>
            <p className="text-xs text-zinc-600 leading-relaxed">
              The paid marketplace for MCP servers.
            </p>
          </div>
          <div>
            <h2 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3">
              Product
            </h2>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/servers"
                  className="text-zinc-500 hover:text-cyan-400 transition-colors"
                >
                  Browse
                </Link>
              </li>
              <li>
                <Link
                  href="/pricing"
                  className="text-zinc-500 hover:text-cyan-400 transition-colors"
                >
                  Pricing
                </Link>
              </li>
              <li>
                <Link
                  href="/changelog"
                  className="text-zinc-500 hover:text-cyan-400 transition-colors"
                >
                  Changelog
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h2 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3">
              Developers
            </h2>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/docs"
                  className="text-zinc-500 hover:text-cyan-400 transition-colors"
                >
                  Docs
                </Link>
              </li>
              <li>
                <Link
                  href="/api-docs"
                  className="text-zinc-500 hover:text-cyan-400 transition-colors"
                >
                  API
                </Link>
              </li>
              <li>
                <Link
                  href="/guides"
                  className="text-zinc-500 hover:text-cyan-400 transition-colors"
                >
                  Guides
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h2 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3">
              Company
            </h2>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/about"
                  className="text-zinc-500 hover:text-cyan-400 transition-colors"
                >
                  About
                </Link>
              </li>
              <li>
                <Link
                  href="/blog"
                  className="text-zinc-500 hover:text-cyan-400 transition-colors"
                >
                  Blog
                </Link>
              </li>
              <li>
                <Link
                  href="/status"
                  className="text-zinc-500 hover:text-cyan-400 transition-colors"
                >
                  Status
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h2 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3">
              Legal
            </h2>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/privacy"
                  className="text-zinc-500 hover:text-cyan-400 transition-colors"
                >
                  Privacy
                </Link>
              </li>
              <li>
                <Link
                  href="/terms"
                  className="text-zinc-500 hover:text-cyan-400 transition-colors"
                >
                  Terms
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="text-zinc-500 hover:text-cyan-400 transition-colors"
                >
                  Contact
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-zinc-800/50 pt-6 flex items-center justify-between">
          <p className="text-xs text-zinc-700">
            &copy; {new Date().getFullYear()} MCPmarket
          </p>
          <div className="flex gap-3">
            <a
              href="https://twitter.com/mcpmarket"
              target="_blank"
              rel="noopener noreferrer"
              className="text-zinc-700 hover:text-cyan-400 transition-colors"
              aria-label="MCPmarket on Twitter"
            >
              <Twitter className="w-4 h-4" />
            </a>
            <a
              href="https://github.com/mcpmarket"
              target="_blank"
              rel="noopener noreferrer"
              className="text-zinc-700 hover:text-cyan-400 transition-colors"
              aria-label="MCPmarket on GitHub"
            >
              <Github className="w-4 h-4" />
            </a>
            <a
              href="mailto:support@mcpmarket.dev"
              className="text-zinc-700 hover:text-cyan-400 transition-colors"
              aria-label="Contact support"
            >
              <Mail className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
