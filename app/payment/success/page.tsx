import type { Metadata } from "next";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { SuccessView } from "./success-view";

export const metadata: Metadata = {
  title: "Payment successful",
  description: "Your Stripe payment was confirmed and your assessment is unlocking.",
};

export default function PaymentSuccessPage() {
  return (
    <div className="container py-10">
      <Suspense fallback={<Skeleton className="h-64 w-full max-w-xl" />}>
        <SuccessView />
      </Suspense>
    </div>
  );
}
