import type { Metadata } from "next";
import Link from "next/link";
import { XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Payment cancelled",
  description: "Your Stripe checkout was cancelled — no charge was made.",
};

function CancelCard() {
  return (
    <Card className="mx-auto max-w-xl">
      <CardHeader className="text-center">
        <CardTitle className="flex items-center justify-center gap-2">
          <XCircle className="h-6 w-6 text-amber-500" aria-hidden />
          Payment cancelled
        </CardTitle>
        <CardDescription>
          You left Stripe Checkout before paying. No charge was made and the payment stays PENDING —
          create a fresh session any time.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex justify-center gap-2">
        <Button asChild><Link href="/dashboard/assessments">Try again</Link></Button>
        <Button variant="outline" asChild><Link href="/dashboard/payments">Payment history</Link></Button>
      </CardContent>
    </Card>
  );
}

export default function PaymentCancelPage() {
  return (
    <div className="container py-10">
      <CancelCard />
    </div>
  );
}
