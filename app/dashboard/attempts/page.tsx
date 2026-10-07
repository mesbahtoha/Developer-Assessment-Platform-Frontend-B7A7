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
import { useMyAttempts } from "@/lib/queries";
import { formatDateTime } from "@/lib/utils";

function ListInner() {
  const { filters, setFilters, setPage } = useURLFilters({ page: "1", status: "" });
  const { data, isLoading, isError, refetch } = useMyAttempts({
    page: filters.page,
    limit: "10",
    status: filters.status || undefined,
  });
  const attempts = data?.attempts ?? [];

  return (
    <div>
      <div className="flex flex-col gap-3 sm:flex-row">
        <Select value={filters.status || "all"} onValueChange={(v) => setFilters({ status: v === "all" ? "" : v })}>
          <SelectTrigger className="w-full sm:w-48"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="IN_PROGRESS">In progress</SelectItem>
            <SelectItem value="SUBMITTED">Submitted</SelectItem>
            <SelectItem value="EVALUATED">Evaluated</SelectItem>
            <SelectItem value="EXPIRED">Expired</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="mt-4 space-y-3">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24 w-full" />)}</div>
      ) : isError ? (
        <div className="mt-4 rounded-xl border p-8 text-center">
          <p className="font-medium">Could not load attempts.</p>
          <Button className="mt-3" variant="outline" onClick={() => refetch()}>Retry</Button>
        </div>
      ) : attempts.length === 0 ? (
        <div className="mt-4"><EmptyState title="No attempts yet" hint="Start a timed attempt from an accepted invitation to see it here." action={<Button size="sm" asChild><Link href="/dashboard/assessments">Browse assessments</Link></Button>} /></div>
      ) : (
        <>
          <div className="mt-4 space-y-3">
            {attempts.map((a) => (
              <Card key={a.id}>
                <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <p className="font-medium">{a.assessment?.title}</p>
                    <p className="text-xs text-muted-foreground">
                      Started {formatDateTime(a.startedAt)}
                      {a.result ? ` · ${a.result.score}/${a.result.totalPoints} (${a.result.percentage}%)` : a.deadlineAt ? ` · Deadline ${formatDateTime(a.deadlineAt)}` : ""}
                    </p>
                    <div className="mt-1"><StatusBadge status={a.status} /></div>
                  </div>
                  <Button size="sm" className="shrink-0" asChild>
                    <Link href={`/dashboard/attempts/${a.id}`}>{a.status === "IN_PROGRESS" ? "Resume" : "View"}</Link>
                  </Button>
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

export default function CandidateAttemptsPage() {
  return (
    <div>
      <PageHeader title="My attempts" description="Timed attempts with server-enforced deadlines and auto-graded MCQs." />
      <Suspense fallback={<Skeleton className="h-48 w-full" />}>
        <ListInner />
      </Suspense>
    </div>
  );
}
