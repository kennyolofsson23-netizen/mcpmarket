'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  CreditCard,
  Key,
  Settings,
  Code2,
  BarChart3,
  Webhook,
  Users,
  Shield,
  Server,
  DollarSign,
} from 'lucide-react';

interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
}

const userNavItems: NavItem[] = [
  { href: '/dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
  { href: '/dashboard/subscriptions', label: 'Subscriptions', icon: <CreditCard className="w-4 h-4" /> },
  { href: '/dashboard/api-keys', label: 'API Keys', icon: <Key className="w-4 h-4" /> },
  { href: '/dashboard/team', label: 'Team', icon: <Users className="w-4 h-4" /> },
  { href: '/dashboard/settings', label: 'Settings', icon: <Settings className="w-4 h-4" /> },
];

const developerNavItems: NavItem[] = [
  { href: '/dashboard/developer', label: 'Overview', icon: <BarChart3 className="w-4 h-4" /> },
  { href: '/dashboard/developer/servers/new', label: 'New Server', icon: <Server className="w-4 h-4" /> },
  { href: '/dashboard/developer/payouts', label: 'Payouts', icon: <DollarSign className="w-4 h-4" /> },
  { href: '/dashboard/developer/webhooks', label: 'Webhooks', icon: <Webhook className="w-4 h-4" /> },
];

const adminNavItems: NavItem[] = [
  { href: '/admin', label: 'Overview', icon: <Shield className="w-4 h-4" /> },
  { href: '/admin/servers', label: 'Servers', icon: <Server className="w-4 h-4" /> },
  { href: '/admin/users', label: 'Users', icon: <Users className="w-4 h-4" /> },
];

interface SidebarProps {
  role?: string;
  type?: 'user' | 'developer' | 'admin';
}

export function Sidebar({ role, type = 'user' }: SidebarProps) {
  const pathname = usePathname();
  const items = type === 'admin' ? adminNavItems : type === 'developer' ? developerNavItems : userNavItems;

  return (
    <aside className="w-56 shrink-0">
      <nav aria-label={`${type} navigation`}>
        <ul className="space-y-0.5">
          {items.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    'flex items-center gap-2.5 px-3 py-2 rounded-md text-sm transition-colors',
                    isActive
                      ? 'bg-secondary text-foreground font-medium'
                      : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
                  )}
                  aria-current={isActive ? 'page' : undefined}
                >
                  {item.icon}
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
        {type === 'user' && (role === 'DEVELOPER' || role === 'ADMIN') && (
          <div className="mt-4 pt-4 border-t border-border">
            <p className="px-3 mb-1 text-xs font-medium text-muted-foreground uppercase tracking-wide">Developer</p>
            <ul className="space-y-0.5">
              {developerNavItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={cn(
                        'flex items-center gap-2.5 px-3 py-2 rounded-md text-sm transition-colors',
                        isActive ? 'bg-secondary font-medium' : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
                      )}
                    >
                      <Code2 className="w-4 h-4" />
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </nav>
    </aside>
  );
}
