"use client";

import { Suspense } from "react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { Pagination } from "@/components/shared/pagination";
import { SearchInput } from "@/components/shared/search-input";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusBadge } from "@/components/shared/status-badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useURLFilters } from "@/hooks/use-url-filters";
import { useAdminAssessments } from "@/lib/queries";
import { formatCents, formatDate } from "@/lib/utils";

function ListInner() {
  const { filters, setFilters, setPage } = useURLFilters({ page: "1", search: "", status: "" });
  const { data, isLoading, isError, refetch } = useAdminAssessments({
    page: filters.page,
    limit: "10",
    search: filters.search || undefined,
    status: filters.status || undefined,
  });
  const assessments = data?.assessments ?? [];

  return (
    <div>
      <div className="flex flex-col gap-3 sm:flex-row">
        <SearchInput className="flex-1" value={filters.search} onChange={(v) => setFilters({ search: v })} placeholder="Search assessments…" />
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
        <Skeleton className="mt-4 h-72 w-full" />
      ) : isError ? (
        <div className="mt-4 rounded-xl border p-8 text-center">
          <p className="font-medium">Could not load the register.</p>
          <Button className="mt-3" variant="outline" onClick={() => refetch()}>Retry</Button>
        </div>
      ) : assessments.length === 0 ? (
        <div className="mt-4"><EmptyState title="No assessments found" hint="The platform register is empty for these filters." /></div>
      ) : (
        <>
          <div className="mt-4 hidden md:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Assessment</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Recruiter</TableHead>
                  <TableHead>Created</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {assessments.map((a) => (
                  <TableRow key={a.id}>
                    <TableCell className="font-medium">{a.title}</TableCell>
                    <TableCell><StatusBadge status={a.status} /></TableCell>
                    <TableCell>{a.price > 0 ? formatCents(a.price, a.currency) : "Free"}</TableCell>
                    <TableCell className="text-muted-foreground">{a.recruiter?.name ?? a.recruiterId}</TableCell>
                    <TableCell className="text-muted-foreground">{formatDate(a.createdAt)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <div className="mt-4 space-y-2 md:hidden">
            {assessments.map((a) => (
              <div key={a.id} className="rounded-xl border p-3 text-sm">
                <p className="font-medium">{a.title}</p>
                <p className="text-xs text-muted-foreground">{a.recruiter?.name} · {formatDate(a.createdAt)}</p>
                <div className="mt-1 flex gap-2"><StatusBadge status={a.status} /></div>
              </div>
            ))}
          </div>
          <Pagination page={Number(filters.page) || 1} totalPages={data?.meta.totalPages ?? 0} onChange={setPage} />
        </>
      )}
    </div>
  );
}

export default function AdminAssessmentsPage() {
  return (
    <div>
      <PageHeader title="Assessment register" description="Every assessment on the platform with recruiter and lifecycle filters." />
      <Suspense fallback={<Skeleton className="h-64 w-full" />}>
        <ListInner />
      </Suspense>
    </div>
  );
}
