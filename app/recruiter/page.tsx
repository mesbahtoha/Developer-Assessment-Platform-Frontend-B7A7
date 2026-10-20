"use client";

import Link from "next/link";
import { CheckSquare, Database, FileText, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatCard } from "@/components/shared/stat-card";
import { StatusBadge } from "@/components/shared/status-badge";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { useAuth } from "@/hooks/use-auth";
import { useAssessments, useInvitations, usePendingSubmissions, useProblems } from "@/lib/queries";

export default function RecruiterOverviewPage() {
  const { user } = useAuth();
  const { data: assessmentsData } = useAssessments({ page: "1", limit: "5" });
  const { data: problemsData } = useProblems({ page: "1", limit: "1" });
  const { data: pendingData } = usePendingSubmissions({ page: "1", limit: "1" });
  const { data: invitesData } = useInvitations({ page: "1", limit: "5" });

  const assessments = assessmentsData?.assessments ?? [];
  const pending = pendingData?.submissions ?? [];

  return (
    <div>
      <PageHeader
        title={`Welcome, ${user?.name?.split(" ")[0] ?? "recruiter"} 🏢`}
        description="Your problem bank, assessments, invitations and evaluation queue."
        action={<Button asChild><Link href="/recruiter/assessments/new">New assessment</Link></Button>}
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Assessments" value={assessmentsData?.meta.total ?? 0} hint="Across all statuses" icon={FileText} />
        <StatCard title="Problems" value={problemsData?.meta.total ?? 0} hint="In your bank" icon={Database} />
        <StatCard title="Pending reviews" value={pendingData?.meta.total ?? pending.length} hint="CODE submissions waiting" icon={CheckSquare} />
        <StatCard title="Invitations sent" value={invitesData?.meta.total ?? 0} hint="To candidates" icon={Mail} />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Recent assessments</CardTitle>
            <Button variant="ghost" size="sm" asChild><Link href="/recruiter/assessments">View all</Link></Button>
          </CardHeader>
          <CardContent>
            {assessments.length === 0 ? (
              <EmptyState title="No assessments yet" hint="Create your first assessment with the step-by-step wizard." action={<Button size="sm" asChild><Link href="/recruiter/assessments/new">Create assessment</Link></Button>} />
            ) : (
              <ul className="space-y-2">
                {assessments.slice(0, 4).map((a) => (
                  <li key={a.id}>
                    <Link href={`/recruiter/assessments/${a.id}`} className="flex items-center justify-between gap-3 rounded-lg border p-3 hover:bg-accent">
                      <span className="truncate text-sm font-medium">{a.title}</span>
                      <StatusBadge status={a.status} />
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Evaluation queue</CardTitle>
            <Button variant="ghost" size="sm" asChild><Link href="/recruiter/evaluation">Review</Link></Button>
          </CardHeader>
          <CardContent>
            {pending.length === 0 ? (
              <EmptyState title="Queue is clear" hint="CODE submissions from candidates will wait here for manual scoring." />
            ) : (
              <ul className="space-y-2 text-sm">
                {pending.slice(0, 4).map((s) => (
                  <li key={s.id} className="flex items-center justify-between gap-3 rounded-lg border p-3">
                    <span className="truncate">{s.problem?.title} · {s.attempt?.candidate?.name}</span>
                    <StatusBadge status={s.status} />
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
