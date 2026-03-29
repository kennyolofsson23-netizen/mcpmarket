"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { Button } from "./ui/button";
import { Avatar } from "./ui/avatar";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "./ui/dropdown-menu";
import { ChevronDown } from "lucide-react";

export function Navbar() {
  const { data: session } = useSession();
  const user = session?.user;
  const role = (user as { role?: string })?.role;

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 max-w-6xl items-center mx-auto px-4">
        <Link href="/" className="mr-8 flex items-center space-x-2">
          <div className="font-bold text-xl">MCPmarket</div>
        </Link>
        <nav className="flex-1 flex gap-6 text-sm">
          <Link
            href="/servers"
            className="transition-colors hover:text-foreground/80"
          >
            Browse Servers
          </Link>
          <Link
            href="/pricing"
            className="transition-colors hover:text-foreground/80"
          >
            Pricing
          </Link>
        </nav>
        <div className="flex gap-3 items-center">
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 text-sm hover:opacity-80">
                  <Avatar
                    src={user.image}
                    alt={user.name ?? ""}
                    fallback={user.name ?? "U"}
                    size={32}
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
              <Button variant="outline" size="sm" asChild>
                <Link href="/auth/signin">Sign In</Link>
              </Button>
              <Button size="sm" asChild>
                <Link href="/auth/signin">List Your Server</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
