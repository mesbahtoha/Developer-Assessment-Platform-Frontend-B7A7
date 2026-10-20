"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowRight, CheckCircle2, Loader2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/shared/status-badge";
import { useVerifyPayment } from "@/lib/queries";
import { formatCents } from "@/lib/utils";

export function SuccessView() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const sessionId = searchParams.get("session_id") ?? "";
  const { data, isLoading, isError } = useVerifyPayment(sessionId, !!sessionId);

  return (
    <Card className="mx-auto max-w-xl">
      <CardHeader className="text-center">
        <CardTitle className="flex items-center justify-center gap-2">
          <CheckCircle2 className="h-6 w-6 text-emerald-600" aria-hidden />
          Payment received
        </CardTitle>
        <CardDescription>
          {sessionId
            ? "Verifying your Stripe session server-side before unlocking the attempt."
            : "No checkout session was attached to this visit."}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 text-center">
        {!sessionId ? (
          <>
            <p className="text-sm text-muted-foreground">
              Start checkout from a paid assessment page to get a session attached automatically.
            </p>
            <Button asChild><Link href="/dashboard/assessments">Browse assessments</Link></Button>
          </>
        ) : isLoading ? (
          <p className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> Confirming with Stripe…
          </p>
        ) : isError || !data?.payment ? (
          <>
            <p className="flex items-center justify-center gap-2 text-sm text-destructive">
              <XCircle className="h-4 w-4" aria-hidden /> Verification failed, the webhook may still be processing.
            </p>
            <div className="flex justify-center gap-2">
              <Button variant="outline" onClick={() => router.refresh()}>Retry verification</Button>
              <Button asChild><Link href="/dashboard/payments">Payment history</Link></Button>
            </div>
          </>
        ) : (
          <>
            <div className="flex justify-center"><StatusBadge status={data.payment.status} /></div>
            <p className="text-sm">
              {data.payment.assessment?.title} · {formatCents(data.payment.amount, data.payment.currency)}
            </p>
            <p className="text-sm text-muted-foreground">
              {data.payment.status === "PAID"
                ? "Confirmed PAID. You can now start your timed attempt."
                : "The payment is still processing, check back in a moment."}
            </p>
            <div className="flex justify-center gap-2">
              <Button asChild>
                <Link href={data.payment.assessmentId ? `/dashboard/assessments/${data.payment.assessmentId}` : "/dashboard/assessments"}>
                  Continue to assessment <ArrowRight className="h-4 w-4" aria-hidden />
                </Link>
              </Button>
              <Button variant="outline" asChild><Link href="/dashboard/payments">History</Link></Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
