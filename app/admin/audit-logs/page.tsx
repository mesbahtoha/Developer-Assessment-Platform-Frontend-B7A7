"use client";

import { Suspense } from "react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { Pagination } from "@/components/shared/pagination";
import { SearchInput } from "@/components/shared/search-input";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useURLFilters } from "@/hooks/use-url-filters";
import { useAuditLogs } from "@/lib/queries";
import { formatDateTime } from "@/lib/utils";

function ListInner() {
  const { filters, setFilters, setPage } = useURLFilters({ page: "1", action: "", search: "" });
  const { data, isLoading, isError, refetch } = useAuditLogs({
    page: filters.page,
    limit: "15",
    action: filters.action || undefined,
    search: filters.search || undefined,
  });
  const logs = data?.logs ?? [];

  return (
    <div>
      <div className="flex flex-col gap-3 sm:flex-row">
        <SearchInput className="flex-1" value={filters.search} onChange={(v) => setFilters({ search: v })} placeholder="Search action, target, actor…" />
        <SearchInput value={filters.action} onChange={(v) => setFilters({ action: v })} placeholder="Filter by action…" />
      </div>

      {isLoading ? (
        <Skeleton className="mt-4 h-72 w-full" />
      ) : isError ? (
        <div className="mt-4 rounded-xl border p-8 text-center">
          <p className="font-medium">Could not load audit logs.</p>
          <Button className="mt-3" variant="outline" onClick={() => refetch()}>Retry</Button>
        </div>
      ) : logs.length === 0 ? (
        <div className="mt-4"><EmptyState title="No audit events" hint="Privileged actions across the platform are recorded here." /></div>
      ) : (
        <>
          <div className="mt-4 hidden md:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Action</TableHead>
                  <TableHead>Actor</TableHead>
                  <TableHead>Target</TableHead>
                  <TableHead>When</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.map((l) => (
                  <TableRow key={l.id}>
                    <TableCell className="font-mono text-xs font-medium">{l.action}</TableCell>
                    <TableCell className="text-muted-foreground">{l.actor ? `${l.actor.name} (${l.actor.email})` : "system"}</TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground">
                      {l.targetType ?? "N/A"}{l.targetId ? ` · ${l.targetId.slice(0, 8)}…` : ""}
                    </TableCell>
                    <TableCell className="text-muted-foreground">{formatDateTime(l.createdAt)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <div className="mt-4 space-y-2 md:hidden">
            {logs.map((l) => (
              <div key={l.id} className="rounded-xl border p-3 text-sm">
                <p className="font-mono text-xs font-medium">{l.action}</p>
                <p className="text-xs text-muted-foreground">{l.actor?.email ?? "system"} · {formatDateTime(l.createdAt)}</p>
              </div>
            ))}
          </div>
          <Pagination page={Number(filters.page) || 1} totalPages={data?.meta.totalPages ?? 0} onChange={setPage} />
        </>
      )}
    </div>
  );
}

export default function AdminAuditLogsPage() {
  return (
    <div>
      <PageHeader title="Audit logs" description="Who did what to what, the platform's tamper-evident trail." />
      <Suspense fallback={<Skeleton className="h-64 w-full" />}>
        <ListInner />
      </Suspense>
    </div>
  );
}
