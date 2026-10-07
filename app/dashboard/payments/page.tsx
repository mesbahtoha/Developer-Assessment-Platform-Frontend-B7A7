"use client";

import { Suspense } from "react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { Pagination } from "@/components/shared/pagination";
import { StatusBadge } from "@/components/shared/status-badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useURLFilters } from "@/hooks/use-url-filters";
import { useMyPayments } from "@/lib/queries";
import { formatCents, formatDateTime } from "@/lib/utils";

function ListInner() {
  const { filters, setFilters, setPage } = useURLFilters({ page: "1", status: "" });
  const { data, isLoading, isError, refetch } = useMyPayments({
    page: filters.page,
    limit: "10",
    status: filters.status || undefined,
  });
  const payments = data?.payments ?? [];

  return (
    <div>
      <div className="flex flex-col gap-3 sm:flex-row">
        <Select value={filters.status || "all"} onValueChange={(v) => setFilters({ status: v === "all" ? "" : v })}>
          <SelectTrigger className="w-full sm:w-48"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="PENDING">Pending</SelectItem>
            <SelectItem value="PROCESSING">Processing</SelectItem>
            <SelectItem value="PAID">Paid</SelectItem>
            <SelectItem value="FAILED">Failed</SelectItem>
            <SelectItem value="REFUNDED">Refunded</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <Skeleton className="mt-4 h-64 w-full" />
      ) : isError ? (
        <div className="mt-4 rounded-xl border p-8 text-center">
          <p className="font-medium">Could not load payments.</p>
          <Button className="mt-3" variant="outline" onClick={() => refetch()}>Retry</Button>
        </div>
      ) : payments.length === 0 ? (
        <div className="mt-4"><EmptyState title="No payments yet" hint="Free assessments need no payment. Paid assessments create Stripe sessions here." /></div>
      ) : (
        <>
          <div className="mt-4 hidden md:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Assessment</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payments.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell className="font-medium">{p.assessment?.title ?? p.assessmentId}</TableCell>
                    <TableCell>{formatCents(p.amount, p.currency)}</TableCell>
                    <TableCell><StatusBadge status={p.status} /></TableCell>
                    <TableCell className="text-muted-foreground">{formatDateTime(p.createdAt)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <div className="mt-4 space-y-2 md:hidden">
            {payments.map((p) => (
              <div key={p.id} className="rounded-xl border p-3 text-sm">
                <p className="font-medium">{p.assessment?.title}</p>
                <p className="text-muted-foreground">{formatCents(p.amount, p.currency)} · {formatDateTime(p.createdAt)}</p>
                <div className="mt-1"><StatusBadge status={p.status} /></div>
              </div>
            ))}
          </div>
          <Pagination page={Number(filters.page) || 1} totalPages={data?.meta.totalPages ?? 0} onChange={setPage} />
        </>
      )}
    </div>
  );
}

export default function CandidatePaymentsPage() {
  return (
    <div>
      <PageHeader title="Payments" description="Your Stripe payment history across paid assessments." />
      <Suspense fallback={<Skeleton className="h-48 w-full" />}>
        <ListInner />
      </Suspense>
    </div>
  );
}
