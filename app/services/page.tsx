import type { Metadata } from "next";
import Link from "next/link";
import { BarChart3, Clock, Code2, CreditCard, Inbox, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Services",
  description: "What the AssessDev platform offers recruiters, candidates and admins.",
};

const SERVICES = [
  { icon: Code2, title: "Problem bank", text: "MCQ and CODE problems with difficulty levels, point values and tags. Recruiters own full CRUD with soft deletes; answer keys never leak to candidates.", href: "/recruiter/problems", cta: "Manage the bank" },
  { icon: Clock, title: "Timed assessments", text: "Configurable durations, server-computed deadlines, one attempt per candidate and late submissions rejected automatically.", href: "/assessments", cta: "Browse assessments" },
  { icon: Inbox, title: "Candidate invitations", text: "Unique token per candidate per assessment, accept/reject workflow with expiry handling and duplicate prevention.", href: "/dashboard/invitations", cta: "View invitations" },
  { icon: CreditCard, title: "Stripe payments", text: "Real Checkout sessions with server-side price enforcement, signed webhooks, post-redirect verification and admin refunds.", href: "/pricing", cta: "See pricing" },
  { icon: Users, title: "Evaluation & results", text: "Automatic MCQ scoring plus manual code review with feedback, publish/unpublish controls, leaderboards and per-problem breakdowns.", href: "/recruiter/evaluation", cta: "Review queue" },
  { icon: BarChart3, title: "Reports & admin console", text: "Cached assessment reports, attempt funnels, platform stats, payment registers and a full audit trail.", href: "/admin", cta: "Admin overview" },
];

export default function ServicesPage() {
  return (
    <div className="container py-10">
      <p className="text-sm font-medium uppercase tracking-widest text-primary">Services</p>
      <h1 className="mt-2 max-w-3xl text-3xl font-black tracking-tight sm:text-4xl">
        Everything you need to assess developers fairly.
      </h1>
      <p className="mt-4 max-w-2xl text-muted-foreground">
        Six platform services cover the full hiring loop — each backed by a real API with validation,
        role checks and caching.
      </p>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {SERVICES.map((s) => (
          <Card key={s.title} className="card-hover flex flex-col">
            <CardHeader>
              <s.icon className="h-6 w-6 text-primary" aria-hidden />
              <CardTitle>{s.title}</CardTitle>
              <CardDescription>{s.text}</CardDescription>
            </CardHeader>
            <CardContent className="mt-auto pt-0">
              <Button variant="outline" size="sm" asChild>
                <Link href={s.href}>{s.cta}</Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
