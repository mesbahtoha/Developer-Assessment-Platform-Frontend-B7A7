"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusBadge } from "@/components/shared/status-badge";
import { useResult } from "@/lib/queries";

export default function CandidateResultDetailPage({ params }: { params: { id: string } }) {
  const { data, isLoading, isError } = useResult(params.id);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-9 w-2/3" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }
  if (isError || !data?.result) {
    return (
      <div className="rounded-xl border p-8 text-center">
        <p className="font-medium">Result not found.</p>
        <Button className="mt-3" variant="outline" asChild><Link href="/dashboard/results">Back to results</Link></Button>
      </div>
    );
  }

  const r = data.result;
  const breakdown = data.breakdown ?? [];

  return (
    <div>
      <Button variant="ghost" size="sm" asChild className="mb-4">
        <Link href="/dashboard/results"><ArrowLeft className="h-4 w-4" aria-hidden /> All results</Link>
      </Button>
      <h1 className="text-2xl font-bold tracking-tight">{r.attempt?.assessment?.title ?? "Result"}</h1>
      <div className="mt-2 flex flex-wrap items-center gap-2 text-sm">
        <StatusBadge status={r.isPassed ? "ACCEPTED" : "FAILED"} />
        <span><strong>{r.score}/{r.totalPoints}</strong> · {r.percentage}%</span>
        <span className="text-muted-foreground">{r.publishedAt ? "Published by recruiter" : "Awaiting recruiter publish"}</span>
      </div>

      <Card className="mt-4">
        <CardHeader><CardTitle>Per-problem breakdown ({breakdown.length})</CardTitle></CardHeader>
        <CardContent>
          {breakdown.length === 0 ? (
            <p className="text-sm text-muted-foreground">No submissions recorded for this attempt.</p>
          ) : (
            <ul className="space-y-2">
              {breakdown.map((s) => (
                <li key={s.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border p-3 text-sm">
                  <span className="font-medium">{s.problem?.title ?? s.problemId}</span>
                  <span className="flex items-center gap-2">
                    <StatusBadge status={s.status} />
                    <span className="text-muted-foreground">{s.pointsAwarded ?? 0} pts</span>
                  </span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
