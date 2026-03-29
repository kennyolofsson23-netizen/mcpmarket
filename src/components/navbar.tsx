"use client";

import { useState } from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { Avatar } from "./ui/avatar";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "./ui/dropdown-menu";
import { ChevronDown, Menu, X, Terminal } from "lucide-react";

export function Navbar() {
  const { data: session } = useSession();
  const user = session?.user;
  const role = (user as { role?: string })?.role;
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-zinc-800/50 bg-[#0a0a0f]/80 backdrop-blur-xl">
      <div className="flex h-14 items-center px-6 lg:px-8 max-w-[1400px] mx-auto">
        <Link href="/" className="mr-8 flex items-center gap-2 group">
          <div className="w-7 h-7 rounded bg-cyan-400/10 border border-cyan-400/20 flex items-center justify-center group-hover:border-cyan-400/40 transition-colors">
            <Terminal className="w-3.5 h-3.5 text-cyan-400" />
          </div>
          <span className="font-semibold text-zinc-100 tracking-tight">
            MCP<span className="text-cyan-400">market</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <nav
          aria-label="Main navigation"
          className="hidden sm:flex flex-1 gap-1 text-sm"
        >
          <Link
            href="/servers"
            className="px-3 py-1.5 rounded-md text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/50 transition-all"
          >
            Browse
          </Link>
          <Link
            href="/pricing"
            className="px-3 py-1.5 rounded-md text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/50 transition-all"
          >
            Pricing
          </Link>
        </nav>

        {/* Desktop auth */}
        <div className="hidden sm:flex gap-3 items-center">
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className="flex items-center gap-2 text-sm text-zinc-400 hover:text-zinc-100 transition-colors"
                  aria-label={`Account menu for ${user.name ?? "user"}`}
                >
                  <Avatar
                    src={user.image}
                    alt={user.name ?? ""}
                    fallback={user.name ?? "U"}
                    size={28}
                  />
                  <ChevronDown className="w-3 h-3" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem>
                  <Link href="/dashboard" className="block w-full">
                    Dashboard
                  </Link>
                </DropdownMenuItem>
                {(role === "DEVELOPER" || role === "ADMIN") && (
                  <DropdownMenuItem>
                    <Link href="/dashboard/developer" className="block w-full">
                      Developer
                    </Link>
                  </DropdownMenuItem>
                )}
                {role === "ADMIN" && (
                  <DropdownMenuItem>
                    <Link href="/admin" className="block w-full">
                      Admin
                    </Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <Link href="/dashboard/settings" className="block w-full">
                    Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => signOut({ callbackUrl: "/" })}>
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Link
                href="/auth/signin"
                className="text-sm text-zinc-400 hover:text-zinc-100 transition-colors px-3 py-1.5"
              >
                Sign in
              </Link>
              <Link
                href="/auth/signin"
                className="text-sm font-medium bg-cyan-400 text-[#0a0a0f] px-4 py-1.5 rounded-md hover:bg-cyan-300 transition-colors accent-glow"
              >
                List Your Server
              </Link>
            </>
          )}
        </div>

        {/* Mobile hamburger */}
        <div className="sm:hidden ml-auto">
          <button
            className="p-2 rounded-md text-zinc-400 hover:text-zinc-100"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </button>
        </div>

        {/* Mobile nav */}
        {mobileOpen && (
          <div className="sm:hidden absolute top-14 left-0 right-0 bg-[#0a0a0f] border-b border-zinc-800/50 p-4 z-50">
            <nav aria-label="Main navigation" className="flex flex-col gap-3">
              <Link
                href="/servers"
                onClick={() => setMobileOpen(false)}
                className="text-zinc-300 hover:text-cyan-400 transition-colors"
              >
                Browse Servers
              </Link>
              <Link
                href="/pricing"
                onClick={() => setMobileOpen(false)}
                className="text-zinc-300 hover:text-cyan-400 transition-colors"
              >
                Pricing
              </Link>
              {!user && (
                <Link
                  href="/auth/signin"
                  onClick={() => setMobileOpen(false)}
                  className="mt-2 text-center bg-cyan-400 text-[#0a0a0f] font-medium py-2 rounded-md"
                >
                  List Your Server
                </Link>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
