"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Award,
  Building,
  CheckSquare,
  CreditCard,
  Database,
  FileText,
  LayoutDashboard,
  LogOut,
  Mail,
  ScrollText,
  Timer,
  User,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { logoutRemote } from "@/lib/auth-store";
import { useAuth } from "@/hooks/use-auth";
import { initials } from "@/lib/utils";
import { cn } from "@/lib/utils";

const ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  "layout-dashboard": LayoutDashboard,
  "file-text": FileText,
  database: Database,
  mail: Mail,
  "check-square": CheckSquare,
  award: Award,
  user: User,
  building: Building,
  users: Users,
  "credit-card": CreditCard,
  "scroll-text": ScrollText,
  timer: Timer,
};

export function DashboardShell({
  title,
  items,
  children,
}: {
  title: string;
  items: Array<{ href: string; label: string; icon: string }>;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useAuth();

  const handleLogout = async () => {
    await logoutRemote();
    router.push("/login");
  };

  return (
    <div className="container flex flex-col gap-6 py-6 lg:flex-row">
      <aside className="w-full shrink-0 lg:w-64">
        <div className="lg:sticky lg:top-20">
          <div className="mb-4 hidden items-center gap-3 rounded-xl border bg-card p-4 lg:flex">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
              {user ? initials(user.name) : "?"}
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">{user?.name ?? "Loading…"}</p>
              <p className="truncate text-xs text-muted-foreground">
                {user ? `${user.role}` : ""}
              </p>
            </div>
          </div>
          <p className="mb-2 px-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {title}
          </p>
          <nav className="flex gap-1 overflow-x-auto pb-2 lg:flex-col lg:overflow-visible" aria-label="Dashboard">
            {items.map((item) => {
              const Icon = ICONS[item.icon] ?? FileText;
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                    active && "bg-accent text-accent-foreground"
                  )}
                >
                  <Icon className="h-4 w-4" aria-hidden />
                  {item.label}
                </Link>
              );
            })}
            <Button variant="ghost" className="justify-start text-muted-foreground" onClick={handleLogout}>
              <LogOut className="h-4 w-4" aria-hidden />
              Log out
            </Button>
          </nav>
        </div>
      </aside>
      <section className="min-w-0 flex-1">{children}</section>
    </div>
  );
}
