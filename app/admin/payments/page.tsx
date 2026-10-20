"use client";

import { Suspense, useState } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { Pagination } from "@/components/shared/pagination";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusBadge } from "@/components/shared/status-badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useURLFilters } from "@/hooks/use-url-filters";
import { useAdminPayments, useRefundPayment } from "@/lib/queries";
import { formatCents, formatDateTime } from "@/lib/utils";

function RefundDialog({ paymentId, amount, currency, onDone }: { paymentId: string; amount: number; currency: string; onDone: () => void }) {
  const [open, setOpen] = useState(false);
  const refund = useRefundPayment();

  const confirm = async () => {
    try {
      await refund.mutateAsync(paymentId);
      toast.success(`Refunded ${formatCents(amount, currency)} via Stripe.`);
      setOpen(false);
      onDone();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Refund failed");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">Refund</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Issue Stripe refund?</DialogTitle>
          <DialogDescription>
            This calls the real Stripe Refunds API for {formatCents(amount, currency)}. Only PAID payments can be refunded.
          </DialogDescription>
        </DialogHeader>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="destructive" onClick={confirm} disabled={refund.isPending}>
            {refund.isPending ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : null} Confirm refund
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function ListInner() {
  const { filters, setFilters, setPage } = useURLFilters({ page: "1", status: "" });
  const { data, isLoading, isError, refetch } = useAdminPayments({
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
        <Skeleton className="mt-4 h-72 w-full" />
      ) : isError ? (
        <div className="mt-4 rounded-xl border p-8 text-center">
          <p className="font-medium">Could not load payments.</p>
          <Button className="mt-3" variant="outline" onClick={() => refetch()}>Retry</Button>
        </div>
      ) : payments.length === 0 ? (
        <div className="mt-4"><EmptyState title="No payments found" hint="Stripe transactions across the platform will appear here." /></div>
      ) : (
        <>
          <div className="mt-4 hidden md:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Assessment</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payments.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell>
                      <p className="font-medium">{p.user?.name}</p>
                      <p className="text-xs text-muted-foreground">{p.user?.email}</p>
                    </TableCell>
                    <TableCell>{p.assessment?.title}</TableCell>
                    <TableCell>{formatCents(p.amount, p.currency)}</TableCell>
                    <TableCell><StatusBadge status={p.status} /></TableCell>
                    <TableCell className="text-muted-foreground">{formatDateTime(p.createdAt)}</TableCell>
                    <TableCell className="text-right">
                      {p.status === "PAID" ? (
                        <RefundDialog paymentId={p.id} amount={p.amount} currency={p.currency} onDone={() => refetch()} />
                      ) : (
                        <span className="text-xs text-muted-foreground">N/A</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <div className="mt-4 space-y-2 md:hidden">
            {payments.map((p) => (
              <div key={p.id} className="rounded-xl border p-3 text-sm">
                <p className="font-medium">{p.assessment?.title}</p>
                <p className="text-xs text-muted-foreground">{p.user?.email} · {formatCents(p.amount, p.currency)}</p>
                <div className="mt-1 flex items-center justify-between">
                  <StatusBadge status={p.status} />
                  {p.status === "PAID" ? <RefundDialog paymentId={p.id} amount={p.amount} currency={p.currency} onDone={() => refetch()} /> : null}
                </div>
              </div>
            ))}
          </div>
          <Pagination page={Number(filters.page) || 1} totalPages={data?.meta.totalPages ?? 0} onChange={setPage} />
        </>
      )}
    </div>
  );
}

export default function AdminPaymentsPage() {
  return (
    <div>
      <PageHeader title="Payment register" description="Platform-wide Stripe transactions with real refund support." />
      <Suspense fallback={<Skeleton className="h-64 w-full" />}>
        <ListInner />
      </Suspense>
    </div>
  );
}
