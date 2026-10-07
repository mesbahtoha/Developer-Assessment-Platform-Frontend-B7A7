import type { Metadata } from "next";
import { RequireRole } from "@/components/layout/require-role";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { ADMIN_NAV } from "@/lib/constants";

export const metadata: Metadata = { title: "Admin console" };

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <RequireRole roles={["ADMIN"]}>
      <DashboardShell title="Admin" items={ADMIN_NAV}>
        {children}
      </DashboardShell>
    </RequireRole>
  );
}
