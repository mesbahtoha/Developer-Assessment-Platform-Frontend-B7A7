"use client";

import { Suspense } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Loader2, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { Pagination } from "@/components/shared/pagination";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusBadge } from "@/components/shared/status-badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useURLFilters } from "@/hooks/use-url-filters";
import { useAssessments, useInvitations, useSendInvitation } from "@/lib/queries";
import { inviteSchema, type InviteInput } from "@/lib/validations";
import { formatDateTime } from "@/lib/utils";

function SendForm({ onSent }: { onSent: () => void }) {
  const send = useSendInvitation();
  const { data: assessmentsData } = useAssessments({ page: "1", limit: "50" });
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<InviteInput>({ resolver: zodResolver(inviteSchema) });

  const onSubmit = async (v: InviteInput) => {
    try {
      await send.mutateAsync(v);
      toast.success(`Invitation sent to ${v.candidateEmail}.`);
      reset();
      onSent();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Invite failed");
    }
  };

  return (
    <Card>
      <CardContent className="p-4">
        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-3 sm:grid-cols-3" noValidate>
          <div className="space-y-1.5">
            <Label htmlFor="assessmentId">Assessment</Label>
            <select id="assessmentId" {...register("assessmentId")} className="flex h-9 w-full rounded-lg border border-input bg-background px-3 text-sm">
              <option value="">Select…</option>
              {(assessmentsData?.assessments ?? []).map((a) => (
                <option key={a.id} value={a.id}>{a.title}</option>
              ))}
            </select>
            {errors.assessmentId ? <p className="text-xs text-destructive">{errors.assessmentId.message}</p> : null}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="candidateEmail">Candidate email</Label>
            <Input id="candidateEmail" type="email" placeholder="candidate@example.com" {...register("candidateEmail")} />
            {errors.candidateEmail ? <p className="text-xs text-destructive">{errors.candidateEmail.message}</p> : null}
          </div>
          <div className="flex items-end">
            <Button type="submit" disabled={send.isPending} className="w-full">
              {send.isPending ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : <UserPlus className="h-4 w-4" aria-hidden />}
              Send
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

function ListInner({ refreshKey }: { refreshKey: number }) {
  const { filters, setFilters, setPage } = useURLFilters({ page: "1", status: "" });
  const { data, isLoading, isError, refetch } = useInvitations({
    page: filters.page,
    limit: "10",
    status: filters.status || undefined,
  });
  const invites = data?.invitations ?? [];

  useEffect(() => {
    if (refreshKey > 0) refetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshKey]);

  return (
    <div className="mt-4">
      <div className="flex gap-3">
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
        <Button variant="outline" size="sm" onClick={() => refetch()}>Refresh</Button>
      </div>
      {isLoading ? (
        <div className="mt-4 space-y-3">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-20 w-full" />)}</div>
      ) : isError ? (
        <div className="mt-4 rounded-xl border p-8 text-center">
          <p className="font-medium">Could not load invitations.</p>
          <Button className="mt-3" variant="outline" onClick={() => refetch()}>Retry</Button>
        </div>
      ) : invites.length === 0 ? (
        <div className="mt-4"><EmptyState title="No invitations sent" hint="Invite candidates by email from the form above." /></div>
      ) : (
        <>
          <div className="mt-4 space-y-2">
            {invites.map((inv) => (
              <div key={inv.id} className="flex flex-wrap items-center justify-between gap-2 rounded-xl border p-3 text-sm">
                <div>
                  <p className="font-medium">{inv.assessment?.title} → {inv.candidate?.email ?? inv.candidateId}</p>
                  <p className="text-xs text-muted-foreground">Sent {formatDateTime(inv.createdAt)}</p>
                </div>
                <StatusBadge status={inv.status} />
              </div>
            ))}
          </div>
          <Pagination page={Number(filters.page) || 1} totalPages={data?.meta.totalPages ?? 0} onChange={setPage} />
        </>
      )}
    </div>
  );
}

import { useState } from "react";
import { useEffect } from "react";

export default function RecruiterInvitationsPage() {
  const [refreshKey, setRefreshKey] = useState(0);
  return (
    <div>
      <PageHeader title="Invitations" description="Invite candidates by email and track accept / decline / expiry." />
      <SendForm onSent={() => setRefreshKey((k) => k + 1)} />
      <Suspense fallback={<Skeleton className="mt-4 h-48 w-full" />}>
        <ListInner refreshKey={refreshKey} />
      </Suspense>
    </div>
  );
}
