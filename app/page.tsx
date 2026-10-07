import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, BadgeCheck, Building2, CreditCard, FileText, GraduationCap, ShieldCheck, Timer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SITE } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Hire developers with confidence",
  description: SITE.description,
};

const STEPS = [
  { icon: FileText, title: "Recruiters build assessments", text: "Create DRAFT assessments, attach MCQ and CODE problems from the bank, then publish when ready." },
  { icon: BadgeCheck, title: "Invite candidates", text: "Send unique invitation tokens per candidate. Candidates accept in one click from their dashboard." },
  { icon: CreditCard, title: "Collect payment for paid tiers", text: "Stripe Checkout confirms payment via signed webhooks before timed attempts unlock." },
  { icon: Timer, title: "Timed attempts & auto-grading", text: "Server-side deadlines, one attempt per candidate, instant MCQ evaluation and manual code review." },
];

const ROLES = [
  { icon: GraduationCap, title: "Candidates", text: "Browse published assessments, accept invitations, pay with Stripe, take timed exams and track results." },
  { icon: Building2, title: "Recruiters", text: "Own the problem bank, manage the assessment lifecycle, invite candidates, evaluate code and publish results." },
  { icon: ShieldCheck, title: "Admins", text: "Platform-wide users, payments, assessment registers, refunds and a full audit trail with cached analytics." },
];

export default function HomePage() {
  return (
    <div>
      {/* Hero */}
      <section className="gradient-hero border-b">
        <div className="container grid gap-10 py-14 lg:grid-cols-2 lg:py-20">
          <div className="flex flex-col justify-center">
            <p className="mb-3 inline-flex w-fit items-center gap-2 rounded-full border bg-background px-3 py-1 text-xs font-medium text-muted-foreground">
              <span className="h-2 w-2 rounded-full bg-emerald-500" aria-hidden />
              Live API · Stripe test mode · 3 roles
            </p>
            <h1 className="text-4xl font-black tracking-tight sm:text-5xl">
              Assess developers the way you hire: <span className="text-primary">real work, timed.</span>
            </h1>
            <p className="mt-4 max-w-xl text-muted-foreground">
              {SITE.description}
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button size="lg" asChild>
                <Link href="/assessments">
                  Browse assessments <ArrowRight className="h-4 w-4" aria-hidden />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/login">Try a demo login</Link>
              </Button>
            </div>
            <dl className="mt-8 grid max-w-md grid-cols-3 gap-4 text-center">
              {[
                ["Timed", "Server deadlines"],
                ["Stripe", "Real checkout"],
                ["RBAC", "3 roles"],
              ].map(([k, v]) => (
                <div key={k} className="rounded-xl border bg-background p-3">
                  <dt className="font-bold">{k}</dt>
                  <dd className="text-xs text-muted-foreground">{v}</dd>
                </div>
              ))}
            </dl>
          </div>
          <div className="grid content-center gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Candidate journey</CardTitle>
                <CardDescription>Invitation → payment → timed attempt → result</CardDescription>
              </CardHeader>
              <CardContent>
                <ol className="space-y-3 text-sm">
                  {["Accept invitation from dashboard", "Pay via Stripe for paid assessments", "Start timed attempt before the deadline", "Submit answers — MCQs auto-graded instantly"].map((s, i) => (
                    <li key={s} className="flex gap-3">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                        {i + 1}
                      </span>
                      <span className="pt-0.5">{s}</span>
                    </li>
                  ))}
                </ol>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Recruiter journey</CardTitle>
                <CardDescription>Draft → publish → evaluate → report</CardDescription>
              </CardHeader>
              <CardContent>
                <ol className="space-y-3 text-sm">
                  {["Create assessment in DRAFT with duration & pass score", "Attach bank problems, then publish", "Invite candidates & review the pending queue", "Evaluate code, publish results, read cached reports"].map((s, i) => (
                    <li key={s} className="flex gap-3">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-xs font-bold text-white">
                        {i + 1}
                      </span>
                      <span className="pt-0.5">{s}</span>
                    </li>
                  ))}
                </ol>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="container py-14">
        <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">How the platform works</h2>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          The full lifecycle mirrors the backend state machines — assessments move DRAFT → PUBLISHED → CLOSED → ARCHIVED, attempts IN_PROGRESS → SUBMITTED → EVALUATED.
        </p>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((s) => (
            <Card key={s.title} className="card-hover">
              <CardHeader>
                <s.icon className="h-6 w-6 text-primary" aria-hidden />
                <CardTitle className="text-base">{s.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{s.text}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Roles */}
      <section className="border-y bg-muted/30">
        <div className="container py-14">
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">Built for three roles</h2>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            Permissions are enforced in middleware and re-checked by the API. Each role gets its own dashboard shell.
          </p>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {ROLES.map((r) => (
              <Card key={r.title} className="card-hover">
                <CardHeader>
                  <r.icon className="h-6 w-6 text-primary" aria-hidden />
                  <CardTitle>{r.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{r.text}</p>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button asChild><Link href="/login">One-click demo login</Link></Button>
            <Button variant="outline" asChild><Link href="/pricing">See paid tiers</Link></Button>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="container py-14 text-center">
        <h2 className="mx-auto max-w-2xl text-2xl font-bold tracking-tight sm:text-3xl">
          Ready to run your first assessment?
        </h2>
        <p className="mx-auto mt-2 max-w-xl text-sm text-muted-foreground">
          Register as a candidate or recruiter, or jump straight in with a demo account. Paid assessments use Stripe test cards — no real charges.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Button size="lg" asChild><Link href="/register">Create account</Link></Button>
          <Button size="lg" variant="outline" asChild><Link href="/about">Learn more</Link></Button>
        </div>
      </section>
    </div>
  );
}
