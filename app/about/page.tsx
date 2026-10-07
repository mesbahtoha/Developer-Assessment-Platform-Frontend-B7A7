import type { Metadata } from "next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Database, Layers, Lock, Workflow, Zap } from "lucide-react";

export const metadata: Metadata = {
  title: "About",
  description: "What AssessDev is, how it works, and the stack behind it.",
};

const STACK = [
  { icon: Layers, title: "Next.js App Router", text: "Server Components by default, client islands for interactivity, layouts, loading and error boundaries per route." },
  { icon: Database, title: "PostgreSQL + Prisma", text: "Relational integrity, composite uniques preventing duplicates, transactions and soft deletes." },
  { icon: Zap, title: "Redis caching", text: "Read-through cache for hot listings, reports, leaderboards and dashboard stats." },
  { icon: Lock, title: "JWT + RBAC", text: "Short-lived access tokens, rotating refresh sessions, middleware guards plus service-level ownership checks." },
  { icon: Workflow, title: "Stripe payments", text: "Real Checkout sessions, signed webhooks, idempotent confirmation and admin refunds." },
];

export default function AboutPage() {
  return (
    <div className="container py-10">
      <p className="text-sm font-medium uppercase tracking-widest text-primary">About</p>
      <h1 className="mt-2 max-w-3xl text-3xl font-black tracking-tight sm:text-4xl">
        A hiring platform that treats assessments like production software.
      </h1>
      <p className="mt-4 max-w-3xl text-muted-foreground">
        AssessDev lets companies evaluate developer candidates at scale. Recruiters build assessments
        from a problem bank, invite candidates with unique tokens, run timed attempts with server-side
        deadlines, and evaluate results — with real Stripe payments for paid assessments. Every critical
        action is captured in audit logs and hot reads are served from Redis.
      </p>

      <h2 className="mt-10 text-xl font-bold">End-to-end workflow</h2>
      <ol className="mt-4 grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-3">
        {[
          "Recruiter creates an assessment in DRAFT",
          "Attaches MCQ / CODE problems from the bank",
          "Publishes the assessment (requires ≥1 problem)",
          "Invites candidates with unique tokens",
          "Candidate accepts the invitation",
          "Candidate pays via Stripe for paid tiers",
          "Candidate starts a timed attempt",
          "Submissions: MCQ auto-graded, CODE queued",
          "Recruiter evaluates code with score + feedback",
        ].map((s, i) => (
          <li key={s} className="flex gap-3 rounded-xl border bg-card p-4">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
              {i + 1}
            </span>
            <span className="pt-0.5">{s}</span>
          </li>
        ))}
      </ol>

      <h2 className="mt-10 text-xl font-bold">Architecture</h2>
      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {STACK.map((s) => (
          <Card key={s.title}>
            <CardHeader>
              <s.icon className="h-5 w-5 text-primary" aria-hidden />
              <CardTitle className="text-base">{s.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{s.text}</p>
            </CardContent>
          </Card>
        ))}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Consistent API envelope</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Every response uses a shared envelope with success flags, human messages, paginated meta
              objects and field-level Zod error arrays — mirrored by frontend validation.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
