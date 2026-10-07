"use client";

import Link from "next/link";
import { ArrowLeft, Clock, ListChecks } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusBadge } from "@/components/shared/status-badge";
import { useAuth } from "@/hooks/use-auth";
import { useAssessment } from "@/lib/queries";
import { dashboardPathFor } from "@/lib/auth-store";
import { formatCents, formatDate } from "@/lib/utils";

export function AssessmentDetail({ id, backHref }: { id: string; backHref: string }) {
  const { user } = useAuth();
  const { data, isLoading, isError } = useAssessment(id);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-9 w-2/3" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  if (isError || !data?.assessment) {
    return (
      <div className="rounded-xl border p-8 text-center">
        <p className="font-medium">Assessment not found or you do not have access.</p>
        <Button className="mt-3" variant="outline" asChild>
          <Link href={backHref}>Go back</Link>
        </Button>
      </div>
    );
  }

  const a = data.assessment;
  const problems = a.problems ?? [];

  return (
    <div className="space-y-6">
      <Button variant="ghost" size="sm" asChild>
        <Link href={backHref}><ArrowLeft className="h-4 w-4" aria-hidden /> Back</Link>
      </Button>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{a.title}</h1>
            <StatusBadge status={a.status} />
          </div>
          <p className="mt-2 max-w-3xl text-sm text-muted-foreground">{a.description}</p>
          <div className="mt-3 flex flex-wrap gap-3 text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-1"><Clock className="h-4 w-4" aria-hidden />{a.durationMin} minutes</span>
            <span className="inline-flex items-center gap-1"><ListChecks className="h-4 w-4" aria-hidden />{problems.length || a._count?.problems || 0} problems</span>
            <span className="font-semibold text-foreground">
              {a.price > 0 ? formatCents(a.price, a.currency) : "Free"}
            </span>
            <span>Pass mark {a.passScorePercent}%</span>
            <span>Created {formatDate(a.createdAt)}</span>
          </div>
        </div>
        {user ? (
          <Button asChild>
            <Link href={dashboardPathFor(user.role)}>Open in dashboard</Link>
          </Button>
        ) : (
          <Button asChild>
            <Link href="/login">Log in to continue</Link>
          </Button>
        )}
      </div>

      <Card>
        <CardHeader><CardTitle>Problems ({problems.length})</CardTitle></CardHeader>
        <CardContent>
          {problems.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Problem details are available inside your role dashboard after access checks.
            </p>
          ) : (
            <ul className="space-y-3">
              {problems.map((link, i) => (
                <li key={link.problemId} className="rounded-lg border p-3">
                  <div className="flex flex-wrap items-center gap-2 text-sm">
                    <span className="font-semibold">Q{i + 1}.</span>
                    <span className="font-medium">{link.problem?.title ?? link.problemId}</span>
                    {link.problem ? (
                      <>
                        <StatusBadge status={link.problem.type} />
                        <StatusBadge status={link.problem.difficulty} />
                        <span className="text-muted-foreground">{link.points ?? link.problem.points} pts</span>
                      </>
                    ) : null}
                  </div>
                  {link.problem?.prompt ? (
                    <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{link.problem.prompt}</p>
                  ) : null}
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
