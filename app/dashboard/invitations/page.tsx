"use client";

import { Suspense } from "react";
import { toast } from "sonner";
import { Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { Pagination } from "@/components/shared/pagination";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusBadge } from "@/components/shared/status-badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useURLFilters } from "@/hooks/use-url-filters";
import { useInvitations, useRespondInvitation } from "@/lib/queries";
import { formatDateTime } from "@/lib/utils";

function ListInner() {
  const { filters, setFilters, setPage } = useURLFilters({ page: "1", status: "" });
  const { data, isLoading, isError, refetch } = useInvitations({
    page: filters.page,
    limit: "10",
    status: filters.status || undefined,
  });
  const respond = useRespondInvitation();
  const invites = data?.invitations ?? [];

  const act = async (id: string, action: "accept" | "reject") => {
    try {
      await respond.mutateAsync({ id, action });
      toast.success(action === "accept" ? "Invitation accepted — you can now start the attempt." : "Invitation declined.");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Action failed");
    }
  };

  return (
    <div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <Select value={filters.status || "all"} onValueChange={(v) => setFilters({ status: v === "all" ? "" : v })}>
          <SelectTrigger className="w-full sm:w-48"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="PENDING">Pending</SelectItem>
            <SelectItem value="ACCEPTED">Accepted</SelectItem>
            <SelectItem value="CANCELLED">Declined</SelectItem>
            <SelectItem value="EXPIRED">Expired</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="mt-4 space-y-3">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24 w-full" />)}</div>
      ) : isError ? (
        <div className="mt-4 rounded-xl border p-8 text-center">
          <p className="font-medium">Could not load invitations.</p>
          <Button className="mt-3" variant="outline" onClick={() => refetch()}>Retry</Button>
        </div>
      ) : invites.length === 0 ? (
        <div className="mt-4"><EmptyState title="No invitations" hint="When a recruiter invites your email, it will appear here with accept / decline actions." /></div>
      ) : (
        <>
          <div className="mt-4 space-y-3">
            {invites.map((inv) => (
              <Card key={inv.id}>
                <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <p className="font-medium">{inv.assessment?.title ?? inv.assessmentId}</p>
                    <p className="text-xs text-muted-foreground">
                      From {inv.invitedBy?.name ?? "recruiter"} · Expires {formatDateTime(inv.expiresAt)}
                    </p>
                    <div className="mt-1"><StatusBadge status={inv.status} /></div>
                  </div>
                  {inv.status === "PENDING" ? (
                    <div className="flex shrink-0 gap-2">
                      <Button size="sm" onClick={() => act(inv.id, "accept")} disabled={respond.isPending}>
                        <Check className="h-4 w-4" aria-hidden /> Accept
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => act(inv.id, "reject")} disabled={respond.isPending}>
                        <X className="h-4 w-4" aria-hidden /> Decline
                      </Button>
                    </div>
                  ) : null}
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

export default function CandidateInvitationsPage() {
  return (
    <div>
      <PageHeader title="Invitations" description="Assessments recruiters invited you to. Accept to unlock timed attempts." />
      <Suspense fallback={<Skeleton className="h-48 w-full" />}>
        <ListInner />
      </Suspense>
    </div>
  );
}
