"use client";

import Link from "next/link";
import { Suspense } from "react";
import { FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { AssessmentCard } from "@/components/assessments/assessment-card";
import { EmptyState } from "@/components/shared/empty-state";
import { Pagination } from "@/components/shared/pagination";
import { SearchInput } from "@/components/shared/search-input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useURLFilters } from "@/hooks/use-url-filters";
import { useAuth } from "@/hooks/use-auth";
import { useAssessments } from "@/lib/queries";

function ExplorerInner() {
  const { user, hydrated } = useAuth();
  const { filters, setFilters, setPage } = useURLFilters({
    page: "1",
    search: "",
    status: "",
  });

  const { data, isLoading, isError, refetch } = useAssessments(
    user ? { page: filters.page, limit: "9", search: filters.search || undefined, status: filters.status || undefined } : { page: "1", limit: "1" }
  );

  if (!hydrated) return <Skeleton className="mt-6 h-64 w-full" />;

  if (!user) {
    return (
      <div className="mt-6 rounded-xl border bg-muted/20 p-8 text-center">
        <FileText className="mx-auto h-10 w-10 text-muted-foreground" aria-hidden />
        <h2 className="mt-3 text-lg font-semibold">Log in to browse the live catalog</h2>
        <p className="mx-auto mt-1 max-w-md text-sm text-muted-foreground">
          The assessment list is role-scoped by the API and requires authentication. Use a one-click
          demo account to explore instantly.
        </p>
        <div className="mt-4 flex justify-center gap-2">
          <Button asChild><Link href="/login">Log in / demo access</Link></Button>
          <Button variant="outline" asChild><Link href="/pricing">See pricing</Link></Button>
        </div>
      </div>
    );
  }

  const assessments = data?.assessments ?? [];
  const meta = data?.meta;

  return (
    <div className="mt-6">
      <div className="flex flex-col gap-3 sm:flex-row">
        <SearchInput
          className="flex-1"
          value={filters.search}
          onChange={(v) => setFilters({ search: v })}
          placeholder="Search assessments…"
        />
        <Select value={filters.status || "all"} onValueChange={(v) => setFilters({ status: v === "all" ? "" : v })}>
          <SelectTrigger className="w-full sm:w-44"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="PUBLISHED">Published</SelectItem>
            <SelectItem value="DRAFT">Draft</SelectItem>
            <SelectItem value="CLOSED">Closed</SelectItem>
            <SelectItem value="ARCHIVED">Archived</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-52 w-full" />
          ))}
        </div>
      ) : isError ? (
        <div className="mt-6 rounded-xl border p-8 text-center">
          <p className="font-medium">Could not load assessments.</p>
          <Button className="mt-3" variant="outline" onClick={() => refetch()}>Retry</Button>
        </div>
      ) : assessments.length === 0 ? (
        <div className="mt-6">
          <EmptyState title="No assessments found" hint="Try a different search or status filter." />
        </div>
      ) : (
        <>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {assessments.map((a) => (
              <AssessmentCard
                key={a.id}
                assessment={a}
                href={user.role === "CANDIDATE" ? `/dashboard/assessments/${a.id}` : user.role === "RECRUITER" ? `/recruiter/assessments/${a.id}` : `/assessments/${a.id}`}
              />
            ))}
          </div>
          <Pagination page={Number(filters.page) || 1} totalPages={meta?.totalPages ?? 0} onChange={setPage} />
        </>
      )}
    </div>
  );
}

export function AssessmentsExplorer() {
  return (
    <Suspense fallback={<Skeleton className="mt-6 h-64 w-full" />}>
      <ExplorerInner />
    </Suspense>
  );
}
