"use client";

import Link from "next/link";
import { Award, Clock, CreditCard, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { StatCard } from "@/components/shared/stat-card";
import { StatusBadge } from "@/components/shared/status-badge";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { useAuth } from "@/hooks/use-auth";
import { useInvitations, useMyAttempts, useMyPayments, useResultsSummary } from "@/lib/queries";
import { formatCents, formatDateTime } from "@/lib/utils";

export default function CandidateOverviewPage() {
  const { user } = useAuth();
  const { data: attemptsData, isLoading: attemptsLoading } = useMyAttempts({ page: "1", limit: "5" });
  const { data: invitesData } = useInvitations({ page: "1", limit: "5", status: "PENDING" });
  const { data: summary } = useResultsSummary();
  const { data: paymentsData } = useMyPayments({ page: "1", limit: "5" });

  const attempts = attemptsData?.attempts ?? [];
  const invites = invitesData?.invitations ?? [];
  const payments = paymentsData?.payments ?? [];

  return (
    <div>
      <PageHeader
        title={`Welcome, ${user?.name?.split(" ")[0] ?? "candidate"} 👋`}
        description="Your invitations, timed attempts, results and payments at a glance."
        action={<Button asChild><Link href="/dashboard/assessments">Find assessments</Link></Button>}
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Attempts" value={attemptsData?.meta.total ?? 0} hint="Timed attempts started" icon={Clock} />
        <StatCard title="Pending invites" value={invitesData?.meta.total ?? invites.length} hint="Awaiting your response" icon={Mail} />
        <StatCard title="Pass rate" value={summary ? `${Math.round((summary.passed / Math.max(1, summary.total)) * 100)}%` : "N/A"} hint={`${summary?.passed ?? 0} passed of ${summary?.total ?? 0}`} icon={Award} />
        <StatCard title="Payments" value={paymentsData?.meta.total ?? payments.length} hint="Stripe transactions" icon={CreditCard} />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Pending invitations</CardTitle>
            <Button variant="ghost" size="sm" asChild><Link href="/dashboard/invitations">View all</Link></Button>
          </CardHeader>
          <CardContent>
            {invites.length === 0 ? (
              <EmptyState title="No pending invitations" hint="Recruiters invite you by email, accepted invites unlock timed attempts." />
            ) : (
              <ul className="space-y-3">
                {invites.slice(0, 3).map((inv) => (
                  <li key={inv.id} className="flex items-center justify-between gap-3 rounded-lg border p-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{inv.assessment?.title ?? inv.assessmentId}</p>
                      <p className="text-xs text-muted-foreground">Expires {formatDateTime(inv.expiresAt)}</p>
                    </div>
                    <StatusBadge status={inv.status} />
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Recent attempts</CardTitle>
            <Button variant="ghost" size="sm" asChild><Link href="/dashboard/attempts">View all</Link></Button>
          </CardHeader>
          <CardContent>
            {attemptsLoading ? (
              <Skeleton className="h-24 w-full" />
            ) : attempts.length === 0 ? (
              <EmptyState title="No attempts yet" hint="Accept an invitation, then start your first timed attempt." action={<Button size="sm" asChild><Link href="/dashboard/assessments">Browse assessments</Link></Button>} />
            ) : (
              <ul className="space-y-3">
                {attempts.slice(0, 3).map((a) => (
                  <li key={a.id} className="flex items-center justify-between gap-3 rounded-lg border p-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{a.assessment?.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {a.result ? `${a.result.score}/${a.result.totalPoints} · ${a.result.percentage}%` : formatDateTime(a.startedAt)}
                      </p>
                    </div>
                    <StatusBadge status={a.status} />
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>

      {summary && summary.total > 0 ? (
        <Card className="mt-4">
          <CardHeader><CardTitle className="text-base">Career summary</CardTitle></CardHeader>
          <CardContent className="flex flex-wrap gap-6 text-sm">
            <span><strong>{summary.total}</strong> results</span>
            <span><strong>{summary.passed}</strong> passed</span>
            <span><strong>{summary.failed}</strong> failed</span>
            <span>Avg <strong>{summary.averagePercentage}%</strong></span>
            <span>Best <strong>{summary.bestPercentage}%</strong></span>
          </CardContent>
        </Card>
      ) : null}

      {payments.length > 0 ? (
        <Card className="mt-4">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Recent payments</CardTitle>
            <Button variant="ghost" size="sm" asChild><Link href="/dashboard/payments">View all</Link></Button>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              {payments.slice(0, 3).map((p) => (
                <li key={p.id} className="flex items-center justify-between gap-3 rounded-lg border p-3">
                  <span className="truncate">{p.assessment?.title} · {formatCents(p.amount, p.currency)}</span>
                  <StatusBadge status={p.status} />
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
