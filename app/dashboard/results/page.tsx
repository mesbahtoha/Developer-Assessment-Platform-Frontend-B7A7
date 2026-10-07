"use client";

import Link from "next/link";
import { Suspense } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { Pagination } from "@/components/shared/pagination";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusBadge } from "@/components/shared/status-badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useURLFilters } from "@/hooks/use-url-filters";
import { useMyResults } from "@/lib/queries";

function ListInner() {
  const { filters, setFilters, setPage } = useURLFilters({ page: "1", isPassed: "" });
  const { data, isLoading, isError, refetch } = useMyResults({
    page: filters.page,
    limit: "10",
    isPassed: filters.isPassed || undefined,
  });
  const results = data?.results ?? [];

  return (
    <div>
      <div className="flex flex-col gap-3 sm:flex-row">
        <Select value={filters.isPassed || "all"} onValueChange={(v) => setFilters({ isPassed: v === "all" ? "" : v })}>
          <SelectTrigger className="w-full sm:w-48"><SelectValue placeholder="Outcome" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Passed + failed</SelectItem>
            <SelectItem value="true">Passed only</SelectItem>
            <SelectItem value="false">Failed only</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="mt-4 space-y-3">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24 w-full" />)}</div>
      ) : isError ? (
        <div className="mt-4 rounded-xl border p-8 text-center">
          <p className="font-medium">Could not load results.</p>
          <Button className="mt-3" variant="outline" onClick={() => refetch()}>Retry</Button>
        </div>
      ) : results.length === 0 ? (
        <div className="mt-4"><EmptyState title="No results yet" hint="Submit a timed attempt to generate your first scored result." /></div>
      ) : (
        <>
          <div className="mt-4 space-y-3">
            {results.map((r) => (
              <Card key={r.id}>
                <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <p className="font-medium">{r.attempt?.assessment?.title ?? "Assessment"}</p>
                    <p className="text-xs text-muted-foreground">{r.score}/{r.totalPoints} · {r.percentage}%{r.publishedAt ? " · Published" : " · Awaiting publish"}</p>
                    <div className="mt-1 flex gap-2"><StatusBadge status={r.isPassed ? "ACCEPTED" : "FAILED"} />{r.isPublished === false ? <StatusBadge status="PENDING" /> : null}</div>
                  </div>
                  <Button size="sm" className="shrink-0" asChild><Link href={`/dashboard/results/${r.id}`}>Breakdown</Link></Button>
                </CardContent>
              </Card>
            ))}
          </div>
          <Pagination page={Number(filters.page) || 1} totalPages={data?.meta.totalPages ?? 0} onChange={setPage} />
        </>
      )}
    </div>
  );
}

export default function CandidateResultsPage() {
  return (
    <div>
      <PageHeader title="Results" description="Scores, pass/fail and per-problem breakdowns for your attempts." />
      <Suspense fallback={<Skeleton className="h-48 w-full" />}>
        <ListInner />
      </Suspense>
    </div>
  );
}
