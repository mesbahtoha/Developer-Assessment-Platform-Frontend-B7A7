import type { Metadata } from "next";
import { Suspense } from "react";
import { AssessmentsExplorer } from "./assessments-explorer";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata: Metadata = {
  title: "Assessments",
  description: "Browse published developer assessments, free and paid tiers.",
};

export default function AssessmentsPage() {
  return (
    <div className="container py-10">
      <p className="text-sm font-medium uppercase tracking-widest text-primary">Catalog</p>
      <h1 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">Assessments</h1>
      <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
        Log in to see the live catalog. Candidates see published assessments; recruiters see their own;
        admins see everything.
      </p>
      <Suspense fallback={<Skeleton className="mt-6 h-64 w-full" />}>
        <AssessmentsExplorer />
      </Suspense>
    </div>
  );
}
