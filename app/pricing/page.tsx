import type { Metadata } from "next";
import Link from "next/link";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCents } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Pricing",
  description: "Free and paid assessment tiers powered by Stripe test mode.",
};

const FAQS = [
  { q: "How do paid assessments work?", a: "When a candidate starts a paid assessment, the frontend creates a Stripe Checkout session via POST /payments/create. The candidate pays on Stripe's hosted page and is redirected to /payment/success, which verifies the session server-side before unlocking the timed attempt." },
  { q: "Is this real money?", a: "No. The platform runs in Stripe test mode. Use the card 4242 4242 4242 4242 with any future expiry and CVC. No real charges occur." },
  { q: "What happens if I cancel?", a: "Cancelling on Stripe returns you to /payment/cancel. The payment stays PENDING and you can create a fresh session any time." },
  { q: "Can I get a refund?", a: "Admins can issue real Stripe refunds from the payment register (POST /payments/:id/refund). The webhook then marks the payment REFUNDED." },
  { q: "Who sets the price?", a: "Recruiters set the price in cents when creating an assessment. The server re-reads the price from the database at checkout — client-sent amounts are ignored or verified." },
];

export default function PricingPage() {
  return (
    <div className="container py-10">
      <p className="text-sm font-medium uppercase tracking-widest text-primary">Pricing</p>
      <h1 className="mt-2 max-w-3xl text-3xl font-black tracking-tight sm:text-4xl">
        Free to practice. Paid when it counts.
      </h1>
      <p className="mt-4 max-w-2xl text-muted-foreground">
        Recruiters price assessments in cents. Free assessments start instantly; paid ones unlock after
        Stripe Checkout confirms the payment via signed webhooks.
      </p>

      <div className="mt-8 grid gap-4 md:grid-cols-2">
        <Card className="card-hover">
          <CardHeader>
            <CardTitle>Free assessments</CardTitle>
            <CardDescription>{formatCents(0)} · start instantly after invitation</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              {["Core JavaScript & fundamentals catalog", "Timed attempts with auto-graded MCQs", "Instant results with per-problem breakdown", "No payment step required"].map((f) => (
                <li key={f} className="flex gap-2"><Check className="h-4 w-4 shrink-0 text-emerald-600" aria-hidden />{f}</li>
              ))}
            </ul>
            <Button className="mt-4" asChild><Link href="/assessments">Browse free assessments</Link></Button>
          </CardContent>
        </Card>
        <Card className="card-hover border-primary">
          <CardHeader>
            <CardTitle>Paid assessments</CardTitle>
            <CardDescription>From {formatCents(1999)} · unlocked by Stripe Checkout</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              {["System design & advanced tracks", "Stripe-hosted checkout with test cards", "Webhook-confirmed PAID status before attempts", "Admin-issued refunds on request"].map((f) => (
                <li key={f} className="flex gap-2"><Check className="h-4 w-4 shrink-0 text-emerald-600" aria-hidden />{f}</li>
              ))}
            </ul>
            <Button className="mt-4" asChild><Link href="/assessments">Browse paid assessments</Link></Button>
          </CardContent>
        </Card>
      </div>

      <h2 className="mt-12 text-xl font-bold">Payment FAQ</h2>
      <div className="mt-4 grid gap-3 lg:grid-cols-2">
        {FAQS.map((f) => (
          <Card key={f.q}>
            <CardHeader><CardTitle className="text-base">{f.q}</CardTitle></CardHeader>
            <CardContent><p className="text-sm text-muted-foreground">{f.a}</p></CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
