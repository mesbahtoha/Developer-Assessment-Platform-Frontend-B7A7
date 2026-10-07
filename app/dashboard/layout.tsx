import type { Metadata } from "next";
import { RequireRole } from "@/components/layout/require-role";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { CANDIDATE_NAV } from "@/lib/constants";

export const metadata: Metadata = { title: "Candidate dashboard" };

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <RequireRole roles={["CANDIDATE", "ADMIN"]}>
      <DashboardShell title="Candidate" items={CANDIDATE_NAV}>
        {children}
      </DashboardShell>
    </RequireRole>
  );
}
