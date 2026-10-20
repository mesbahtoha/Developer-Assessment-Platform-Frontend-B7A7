"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { ArrowLeft, Clock, CreditCard, Loader2, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusBadge } from "@/components/shared/status-badge";
import { PageHeader } from "@/components/shared/page-header";
import { ApiError } from "@/lib/api-client";
import { useAssessment, useCreateCheckout, useInvitations, useMyAttempts, useStartAttempt } from "@/lib/queries";
import { formatCents, formatDateTime } from "@/lib/utils";

export function CandidateAssessmentView({ id }: { id: string }) {
  const router = useRouter();
  const { data, isLoading, isError } = useAssessment(id);
  const { data: invitesData } = useInvitations({ page: "1", limit: "50" });
  const { data: attemptsData } = useMyAttempts({ page: "1", limit: "50" });
  const startMutation = useStartAttempt();
  const checkoutMutation = useCreateCheckout();
  const [paying, setPaying] = useState(false);

  const invitation = useMemo(
    () => invitesData?.invitations.find((i) => i.assessmentId === id),
    [invitesData, id]
  );
  const existingAttempt = useMemo(
    () => attemptsData?.attempts.find((a) => a.assessmentId === id),
    [attemptsData, id]
  );

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-9 w-2/3" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }
  if (isError || !data?.assessment) {
    return (
      <div className="rounded-xl border p-8 text-center">
        <p className="font-medium">Assessment not found.</p>
        <Button className="mt-3" variant="outline" asChild><Link href="/dashboard/assessments">Back to assessments</Link></Button>
      </div>
    );
  }

  const a = data.assessment;
  const problems = a.problems ?? [];
  const isPaid = a.price > 0;

  const handlePay = async () => {
    setPaying(true);
    try {
      const res = await checkoutMutation.mutateAsync({ assessmentId: id });
      toast.success(res.reused ? "Resuming your checkout session…" : "Checkout session created, redirecting to Stripe…");
      window.location.href = res.url;
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not create checkout session");
      setPaying(false);
    }
  };

  const handleStart = async () => {
    try {
      const res = await startMutation.mutateAsync(id);
      toast.success("Attempt started, good luck!");
      router.push(`/dashboard/attempts/${res.attempt.id}`);
    } catch (e) {
      if (e instanceof ApiError && e.status === 402) {
        toast.error("Payment required, complete Stripe checkout first.");
        return;
      }
      if (e instanceof ApiError && e.status === 409) {
        toast.error(e.message);
        if (existingAttempt) router.push(`/dashboard/attempts/${existingAttempt.id}`);
        return;
      }
      toast.error(e instanceof Error ? e.message : "Could not start attempt");
    }
  };

  return (
    <div>
      <Button variant="ghost" size="sm" asChild className="mb-4">
        <Link href="/dashboard/assessments"><ArrowLeft className="h-4 w-4" aria-hidden /> All assessments</Link>
      </Button>
      <PageHeader
        title={a.title}
        description={a.description}
        action={<StatusBadge status={a.status} />}
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader><CardTitle>What to expect</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p className="flex items-center gap-2"><Clock className="h-4 w-4 text-muted-foreground" aria-hidden />{a.durationMin} minutes, timed server-side. Late submissions are rejected.</p>
            <p>• {problems.length} problem{problems.length === 1 ? "" : "s"}, MCQ answers are auto-graded instantly, CODE answers go to manual review.</p>
            <p>• Pass mark {a.passScorePercent}%. One attempt per candidate.</p>
            <p>• Price: <strong>{isPaid ? formatCents(a.price, a.currency) : "Free"}</strong>{isPaid ? ", Stripe Checkout with test cards." : ""}</p>
            {problems.length > 0 ? (
              <ul className="pt-2 space-y-2">
                {problems.map((l, i) => (
                  <li key={l.problemId} className="rounded-lg border p-3">
                    <span className="text-sm font-medium">Q{i + 1}. {l.problem?.title}</span>
                    <span className="ml-2"><StatusBadge status={l.problem?.type ?? "MCQ"} /></span>
                  </li>
                ))}
              </ul>
            ) : null}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Your access</CardTitle></CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Invitation</span>
              {invitation ? <StatusBadge status={invitation.status} /> : <span className="text-muted-foreground">Not invited</span>}
            </div>
            {invitation ? (
              <p className="text-xs text-muted-foreground">Responded {formatDateTime(invitation.respondedAt ?? invitation.createdAt)}</p>
            ) : (
              <p className="text-xs text-muted-foreground">Ask a recruiter to invite your candidate email before starting.</p>
            )}
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Attempt</span>
              {existingAttempt ? <StatusBadge status={existingAttempt.status} /> : <span className="text-muted-foreground">None yet</span>}
            </div>

            {existingAttempt ? (
              <Button className="w-full" asChild>
                <Link href={`/dashboard/attempts/${existingAttempt.id}`}>
                  <Play className="h-4 w-4" aria-hidden /> {existingAttempt.status === "IN_PROGRESS" ? "Resume attempt" : "View attempt"}
                </Link>
              </Button>
            ) : (
              <>
                {isPaid ? (
                  <Button className="w-full" onClick={handlePay} disabled={paying || checkoutMutation.isPending}>
                    {(paying || checkoutMutation.isPending) ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : <CreditCard className="h-4 w-4" aria-hidden />}
                    Pay {formatCents(a.price, a.currency)} with Stripe
                  </Button>
                ) : null}
                <Button
                  className="w-full"
                  variant={isPaid ? "outline" : "default"}
                  onClick={handleStart}
                  disabled={startMutation.isPending || !invitation || invitation.status !== "ACCEPTED"}
                  title={!invitation ? "You need an invitation first" : invitation.status !== "ACCEPTED" ? "Accept the invitation first" : "Start timed attempt"}
                >
                  {startMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : <Play className="h-4 w-4" aria-hidden />}
                  Start timed attempt
                </Button>
                {(!invitation || invitation.status !== "ACCEPTED") ? (
                  <p className="text-xs text-muted-foreground">
                    Accept your invitation on the <Link href="/dashboard/invitations" className="text-primary hover:underline">invitations page</Link> first.
                  </p>
                ) : null}
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
