"use client";

import Link from "next/link";
import { Suspense } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AssessmentCard } from "@/components/assessments/assessment-card";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { Pagination } from "@/components/shared/pagination";
import { SearchInput } from "@/components/shared/search-input";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useURLFilters } from "@/hooks/use-url-filters";
import { useAssessments } from "@/lib/queries";

function ListInner() {
  const { filters, setFilters, setPage } = useURLFilters({ page: "1", search: "", status: "" });
  const { data, isLoading, isError, refetch } = useAssessments({
    page: filters.page,
    limit: "9",
    search: filters.search || undefined,
    status: filters.status || undefined,
  });
  const assessments = data?.assessments ?? [];

  return (
    <div>
      <div className="flex flex-col gap-3 sm:flex-row">
        <SearchInput className="flex-1" value={filters.search} onChange={(v) => setFilters({ search: v })} placeholder="Search your assessments…" />
        <Select value={filters.status || "all"} onValueChange={(v) => setFilters({ status: v === "all" ? "" : v })}>
          <SelectTrigger className="w-full sm:w-44"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="DRAFT">Draft</SelectItem>
            <SelectItem value="PUBLISHED">Published</SelectItem>
            <SelectItem value="CLOSED">Closed</SelectItem>
            <SelectItem value="ARCHIVED">Archived</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-52 w-full" />)}
        </div>
      ) : isError ? (
        <div className="mt-4 rounded-xl border p-8 text-center">
          <p className="font-medium">Could not load assessments.</p>
          <Button className="mt-3" variant="outline" onClick={() => refetch()}>Retry</Button>
        </div>
      ) : assessments.length === 0 ? (
        <div className="mt-4"><EmptyState title="No assessments yet" hint="Use the wizard to create a DRAFT, attach problems, then publish." action={<Button size="sm" asChild><Link href="/recruiter/assessments/new">Create assessment</Link></Button>} /></div>
      ) : (
        <>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {assessments.map((a) => (
              <AssessmentCard key={a.id} assessment={a} href={`/recruiter/assessments/${a.id}`} />
            ))}
          </div>
          <Pagination page={Number(filters.page) || 1} totalPages={data?.meta.totalPages ?? 0} onChange={setPage} />
        </>
      )}
    </div>
  );
}

export default function RecruiterAssessmentsPage() {
  return (
    <div>
      <PageHeader
        title="Assessments"
        description="Your assessments across the DRAFT → PUBLISHED → CLOSED → ARCHIVED lifecycle."
        action={<Button asChild><Link href="/recruiter/assessments/new"><Plus className="h-4 w-4" aria-hidden /> New assessment</Link></Button>}
      />
      <Suspense fallback={<Skeleton className="h-64 w-full" />}>
        <ListInner />
      </Suspense>
    </div>
  );
}
