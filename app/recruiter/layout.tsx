import type { Metadata } from "next";
import { RequireRole } from "@/components/layout/require-role";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { RECRUITER_NAV } from "@/lib/constants";

export const metadata: Metadata = { title: "Recruiter dashboard" };

export default function RecruiterLayout({ children }: { children: React.ReactNode }) {
  return (
    <RequireRole roles={["RECRUITER", "ADMIN"]}>
      <DashboardShell title="Recruiter" items={RECRUITER_NAV}>
        {children}
      </DashboardShell>
    </RequireRole>
  );
}
