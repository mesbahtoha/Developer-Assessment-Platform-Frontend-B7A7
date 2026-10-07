"use client";

import { Suspense } from "react";
import { AssessmentCard } from "@/components/assessments/assessment-card";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { Pagination } from "@/components/shared/pagination";
import { SearchInput } from "@/components/shared/search-input";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { useURLFilters } from "@/hooks/use-url-filters";
import { useAssessments } from "@/lib/queries";

function ListInner() {
  const { filters, setFilters, setPage } = useURLFilters({ page: "1", search: "" });
  const { data, isLoading, isError, refetch } = useAssessments({
    page: filters.page,
    limit: "9",
    search: filters.search || undefined,
  });
  const assessments = data?.assessments ?? [];

  return (
    <div>
      <SearchInput value={filters.search} onChange={(v) => setFilters({ search: v })} placeholder="Search published assessments…" />
      {isLoading ? (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-52 w-full" />)}
        </div>
      ) : isError ? (
        <div className="mt-6 rounded-xl border p-8 text-center">
          <p className="font-medium">Could not load assessments.</p>
          <Button className="mt-3" variant="outline" onClick={() => refetch()}>Retry</Button>
        </div>
      ) : assessments.length === 0 ? (
        <div className="mt-6"><EmptyState title="No assessments available" hint="Published assessments will appear here once a recruiter invites you or publishes new ones." /></div>
      ) : (
        <>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {assessments.map((a) => (
              <AssessmentCard key={a.id} assessment={a} href={`/dashboard/assessments/${a.id}`} />
            ))}
          </div>
          <Pagination page={Number(filters.page) || 1} totalPages={data?.meta.totalPages ?? 0} onChange={setPage} />
        </>
      )}
    </div>
  );
}

export default function CandidateAssessmentsPage() {
  return (
    <div>
      <PageHeader title="Assessments" description="Published assessments visible to you. Paid tiers require Stripe checkout before attempts unlock." />
      <Suspense fallback={<Skeleton className="h-64 w-full" />}>
        <ListInner />
      </Suspense>
    </div>
  );
}
