"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/use-auth";
import { dashboardPathFor } from "@/lib/auth-store";
import type { Role } from "@/lib/types";

/** Client-side role gate: redirects unauthenticated / wrong-role users. */
export function RequireRole({
  roles,
  children,
}: {
  roles: Role[];
  children: React.ReactNode;
}) {
  const { user, hydrated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!hydrated) return;
    if (!user) {
      router.replace("/login");
      return;
    }
    if (!roles.includes(user.role)) {
      toast.error("You do not have access to this area.");
      router.replace(dashboardPathFor(user.role));
    }
  }, [hydrated, user, roles, router]);

  if (!hydrated || !user || !roles.includes(user.role)) {
    return (
      <div className="container py-10">
        <p className="text-sm text-muted-foreground">Checking access…</p>
      </div>
    );
  }
  return <>{children}</>;
}
