"use client";

import { Suspense, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusBadge } from "@/components/shared/status-badge";
import { useAssessments, useAssessmentResults, useLeaderboard, usePublishResult } from "@/lib/queries";
import { formatDateTime } from "@/lib/utils";

function ResultsInner({ assessmentId }: { assessmentId: string }) {
  const { data, isLoading, refetch } = useAssessmentResults(assessmentId, { page: "1", limit: "20" });
  const { data: lb } = useLeaderboard(assessmentId, 10);
  const publish = usePublishResult();
  const results = data?.results ?? [];

  const act = async (id: string, action: "publish" | "unpublish") => {
    try {
      await publish.mutateAsync({ id, action });
      toast.success(action === "publish" ? "Result published." : "Result unpublished.");
      refetch();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Action failed");
    }
  };

  if (!assessmentId) return <EmptyState title="Select an assessment" hint="Choose one of your assessments to inspect its results and leaderboard." />;
  if (isLoading) return <Skeleton className="h-48 w-full" />;

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <Card className="lg:col-span-2">
        <CardHeader><CardTitle>Results ({data?.meta.total ?? results.length})</CardTitle></CardHeader>
        <CardContent>
          {results.length === 0 ? (
            <EmptyState title="No results yet" hint="Results appear once candidates submit attempts." />
          ) : (
            <ul className="space-y-2">
              {results.map((r) => (
                <li key={r.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border p-3 text-sm">
                  <div>
                    <p className="font-medium">{r.attempt?.candidate?.name ?? r.attempt?.candidate?.email}</p>
                    <p className="text-xs text-muted-foreground">{r.score}/{r.totalPoints} · {r.percentage}% · {formatDateTime(r.createdAt)}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusBadge status={r.isPassed ? "ACCEPTED" : "FAILED"} />
                    <Button size="sm" variant="outline" onClick={() => act(r.id, r.publishedAt ? "unpublish" : "publish")} disabled={publish.isPending}>
                      {r.publishedAt ? "Unpublish" : "Publish"}
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle>Leaderboard</CardTitle></CardHeader>
        <CardContent>
          {(lb?.leaderboard ?? []).length === 0 ? (
            <p className="text-sm text-muted-foreground">No ranked candidates yet.</p>
          ) : (
            <ol className="space-y-2 text-sm">
              {(lb?.leaderboard ?? []).map((r, i) => (
                <li key={r.id} className="flex items-center justify-between rounded-lg border p-2.5">
                  <span>#{i + 1} {r.attempt?.candidate?.name}</span>
                  <strong>{r.percentage}%</strong>
                </li>
              ))}
            </ol>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function RecruiterResultsPage() {
  const { data } = useAssessments({ page: "1", limit: "50" });
  const [selected, setSelected] = useState("");
  const assessments = data?.assessments ?? [];

  return (
    <div>
      <PageHeader title="Results & leaderboard" description="Per-assessment results with publish controls and ranked leaderboards." />
      <div className="mb-4">
        <select
          value={selected}
          onChange={(e) => setSelected(e.target.value)}
          className="flex h-10 w-full max-w-md rounded-lg border border-input bg-background px-3 text-sm"
          aria-label="Select assessment"
        >
          <option value="">Select an assessment…</option>
          {assessments.map((a) => (
            <option key={a.id} value={a.id}>{a.title} ({a.status})</option>
          ))}
        </select>
      </div>
      <Suspense fallback={<Skeleton className="h-48 w-full" />}>
        <ResultsInner assessmentId={selected} />
      </Suspense>
    </div>
  );
}
