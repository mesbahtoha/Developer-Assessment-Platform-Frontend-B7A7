import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, BadgeCheck, Building2, CreditCard, FileText, GraduationCap, ShieldCheck, Timer, Star, Quote, CheckCircle2, Users, Award, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SITE } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Hire developers with confidence",
  description: SITE.description,
};

const STEPS = [
  { icon: FileText, title: "Recruiters build assessments", text: "Create draft assessments, attach MCQ and code problems from the bank, then publish when ready." },
  { icon: BadgeCheck, title: "Invite candidates", text: "Send unique invitation tokens per candidate. Candidates accept in one click from their dashboard." },
  { icon: CreditCard, title: "Collect payment for paid tiers", text: "Stripe Checkout confirms payment through signed webhooks before timed attempts unlock." },
  { icon: Timer, title: "Timed attempts and auto grading", text: "Server enforced deadlines, one attempt per candidate, instant MCQ scoring plus manual code review." },
];

const ROLES = [
  { icon: GraduationCap, title: "Candidates", text: "Browse published assessments, accept invitations, pay securely, take timed exams and track results." },
  { icon: Building2, title: "Recruiters", text: "Own the problem bank, manage the assessment lifecycle, invite candidates, evaluate code and publish results." },
  { icon: ShieldCheck, title: "Admins", text: "Manage users, payments and assessments with refunds, cached analytics and a full audit trail." },
];

const FEATURES = [
  { icon: Timer, title: "Server enforced timing", text: "Deadlines are checked on the server so attempts close fairly even if the browser disconnects." },
  { icon: ShieldCheck, title: "Role based access", text: "Candidate, recruiter and admin permissions are enforced in middleware and rechecked by the API." },
  { icon: CreditCard, title: "Secure Stripe payments", text: "Checkout sessions verify prices on the server. Webhooks confirm payment before attempts unlock." },
  { icon: Award, title: "Fair evaluation", text: "MCQs grade instantly. Code answers go to structured manual review with scores and feedback." },
  { icon: Users, title: "Invitation workflow", text: "Token based invites keep each assessment private to the candidates you select." },
  { icon: Clock, title: "Result transparency", text: "Candidates see scores, pass status and published feedback in one clear results view." },
];

const CATEGORIES = [
  { name: "JavaScript", count: "MCQ plus code", desc: "Types, arrays, closures and async patterns for frontend and Node roles." },
  { name: "Backend APIs", count: "Code review", desc: "REST design, validation, auth flows and database reasoning." },
  { name: "Problem Solving", count: "Timed", desc: "Logic, data structures and edge case handling under real deadlines." },
  { name: "Full Stack", count: "Mixed", desc: "Combined MCQ screening with practical code tasks for versatile hires." },
  { name: "Database", count: "MCQ plus code", desc: "Schema design, queries, indexing basics and data integrity." },
  { name: "Hiring Essentials", count: "Starter", desc: "Short screening sets recruiters use for first round shortlists." },
];

const STATS = [
  { value: "3", label: "Roles with isolated dashboards" },
  { value: "100%", label: "Server side validation coverage" },
  { value: "24/7", label: "Timed attempts with safe resume" },
  { value: "Stripe", label: "Verified checkout and refunds" },
];

const TESTIMONIALS = [
  { name: "Nadia Rahman", role: "Engineering Manager, Fintech", text: "We replaced take home PDFs with timed assessments. Screening time dropped and code quality signals improved in the first month." },
  { name: "Tanvir Ahmed", role: "Talent Lead, SaaS Startup", text: "Invitations plus Stripe checkout removed our manual payment tracking. Candidates start faster and recruiters review in one place." },
  { name: "Sarah Karim", role: "Senior Frontend Engineer", text: "The candidate flow is clear from invite to result. Timers, autosave and instant MCQ feedback make the exam feel fair." },
];

const FAQS = [
  { q: "How do invitations work?", a: "Recruiters invite by email. Each invite carries a unique token. Candidates accept from their dashboard, which unlocks payment or the timed attempt." },
  { q: "How do paid assessments work?", a: "Recruiters set a price when creating an assessment. Candidates pay through Stripe Checkout. The server verifies the price and webhook before unlocking the attempt." },
  { q: "How is scoring handled?", a: "MCQ answers grade instantly on submit. Code answers queue for manual review where evaluators assign scores and feedback, then results are published." },
  { q: "Can I manage users and refunds?", a: "Admins manage user status and roles, review payments, issue refunds and inspect the audit log for every critical action." },
];

export default function HomePage() {
  return (
    <div>
      {/* 1. Hero */}
      <section className="gradient-hero relative overflow-hidden border-b">
        <div className="pointer-events-none absolute -top-24 left-1/4 h-72 w-72 rounded-full bg-indigo-300/30 blur-3xl" aria-hidden />
        <div className="pointer-events-none absolute -top-16 right-1/4 h-72 w-72 rounded-full bg-violet-300/30 blur-3xl" aria-hidden />
        <div className="container relative grid gap-10 py-14 sm:py-20 lg:grid-cols-2 lg:py-24">
          <div className="reveal flex flex-col justify-center">
            <p className="mb-4 inline-flex w-fit items-center gap-2 rounded-full border bg-background/80 px-3 py-1.5 text-xs font-semibold text-muted-foreground shadow-sm">
              <span className="h-2 w-2 rounded-full bg-emerald-500" aria-hidden />
              Live platform for candidates, recruiters and admins
            </p>
            <h1 className="text-3xl font-extrabold leading-[1.1] tracking-tight sm:text-5xl lg:text-6xl">
              Assess developers with <span className="bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">real work, timed</span>
            </h1>
            <p className="mt-4 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
              {SITE.description}
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <Button size="lg" className="min-h-[48px]" asChild>
                <Link href="/assessments">
                  Browse assessments <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="min-h-[48px]" asChild>
                <Link href="/register">Create free account</Link>
              </Button>
            </div>
            <dl className="mt-8 grid max-w-md grid-cols-3 gap-3 text-center">
              {[
                ["Timed", "Server deadlines"],
                ["Secure", "Stripe checkout"],
                ["Fair", "Structured review"],
              ].map(([k, v]) => (
                <div key={k} className="rounded-xl border bg-background/80 p-3 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
                  <dt className="font-bold">{k}</dt>
                  <dd className="mt-0.5 text-xs text-muted-foreground">{v}</dd>
                </div>
              ))}
            </dl>
          </div>
          <div className="reveal reveal-delay-1 grid content-center gap-4 [perspective:2000px]">
            <Card className="transition-transform duration-300 lg:[transform:rotateX(4deg)_rotateY(-8deg)] lg:hover:[transform:rotateX(2deg)_rotateY(-4deg)]">
              <CardHeader>
                <CardTitle>Candidate journey</CardTitle>
                <CardDescription>Invitation to payment to timed attempt to result</CardDescription>
              </CardHeader>
              <CardContent>
                <ol className="space-y-3 text-sm">
                  {["Accept invitation from your dashboard", "Pay securely for paid assessments", "Start your timed attempt before the deadline", "Submit answers. MCQs grade instantly."].map((s, i) => (
                    <li key={s} className="flex gap-3">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gradient-to-r from-indigo-600 to-violet-600 text-xs font-bold text-white shadow-[0_0_20px_rgba(79,70,229,0.35)]">
                        {i + 1}
                      </span>
                      <span className="pt-0.5">{s}</span>
                    </li>
                  ))}
                </ol>
              </CardContent>
            </Card>
            <Card className="float-soft transition-transform duration-300 lg:[transform:rotateX(4deg)_rotateY(6deg)]">
              <CardHeader>
                <CardTitle>Recruiter journey</CardTitle>
                <CardDescription>Draft to publish to evaluate to report</CardDescription>
              </CardHeader>
              <CardContent>
                <ol className="space-y-3 text-sm">
                  {["Create assessment in draft with duration and pass score", "Attach bank problems, then publish", "Invite candidates and review the pending queue", "Evaluate code, publish results, read reports"].map((s, i) => (
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

      {/* 2. Stats */}
      <section className="border-b bg-background">
        <div className="container grid grid-cols-2 gap-4 py-10 md:grid-cols-4">
          {STATS.map((s) => (
            <div key={s.label} className="rounded-xl border bg-card p-5 text-center shadow-[0_4px_20px_-2px_rgba(79,70,229,0.1)] transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_10px_25px_-5px_rgba(79,70,229,0.15)]">
              <p className="bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-2xl font-extrabold text-transparent sm:text-3xl">{s.value}</p>
              <p className="mt-1 text-xs font-medium text-muted-foreground sm:text-sm">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 3. Features */}
      <section className="container py-16 sm:py-20 lg:py-24">
        <div className="mx-auto max-w-2xl text-center">
          <Badge className="bg-indigo-50 text-indigo-700 hover:bg-indigo-100 dark:bg-indigo-950 dark:text-indigo-200">Platform features</Badge>
          <h2 className="mt-3 text-2xl font-bold tracking-tight sm:text-4xl">Everything hiring needs in one workflow</h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
            Built for real hiring teams. Every action is validated on the client and rechecked on the server.
          </p>
        </div>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f) => (
            <Card key={f.title} className="card-hover group">
              <CardHeader>
                <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 transition-transform duration-200 group-hover:scale-110 dark:bg-indigo-950 dark:text-indigo-300">
                  <f.icon className="h-6 w-6" aria-hidden />
                </span>
                <CardTitle className="mt-3 text-base">{f.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-relaxed text-muted-foreground">{f.text}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* 4. Categories */}
      <section className="border-y bg-muted/30">
        <div className="container py-16 sm:py-20">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">Assessment categories</h2>
              <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
                Recruiters organize problems by hiring goal. Candidates filter the catalog by skill area.
              </p>
            </div>
            <Button variant="outline" asChild className="w-fit">
              <Link href="/assessments">Explore catalog <ArrowRight className="h-4 w-4" aria-hidden /></Link>
            </Button>
          </div>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {CATEGORIES.map((c) => (
              <Card key={c.name} className="card-hover group">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">{c.name}</CardTitle>
                    <Badge variant="outline">{c.count}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{c.desc}</p>
                  <Link href="/assessments" className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-indigo-600 hover:underline dark:text-indigo-300">
                    View assessments <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" aria-hidden />
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* 5. How it works */}
      <section className="container py-16 sm:py-20">
        <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">How the platform works</h2>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          The lifecycle follows clear states. Assessments move from draft to published to closed. Attempts move from in progress to submitted to evaluated.
        </p>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((s, i) => (
            <Card key={s.title} className="card-hover relative overflow-hidden">
              <span className="absolute right-4 top-4 text-4xl font-extrabold text-indigo-100 dark:text-indigo-950" aria-hidden>{i + 1}</span>
              <CardHeader>
                <s.icon className="h-6 w-6 text-indigo-600 dark:text-indigo-300" aria-hidden />
                <CardTitle className="text-base">{s.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-relaxed text-muted-foreground">{s.text}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* 6. Roles */}
      <section className="border-y bg-gradient-to-b from-indigo-50/60 to-background dark:from-indigo-950/20">
        <div className="container py-16 sm:py-20">
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">Built for three roles</h2>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            Permissions are enforced in middleware and rechecked by the API. Each role gets its own dashboard.
          </p>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {ROLES.map((r) => (
              <Card key={r.title} className="card-hover">
                <CardHeader>
                  <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 text-white shadow-[0_4px_14px_0_rgba(79,70,229,0.3)]">
                    <r.icon className="h-6 w-6" aria-hidden />
                  </span>
                  <CardTitle className="mt-3">{r.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm leading-relaxed text-muted-foreground">{r.text}</p>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <Button asChild><Link href="/register">Get started free</Link></Button>
            <Button variant="outline" asChild><Link href="/pricing">See paid tiers</Link></Button>
          </div>
        </div>
      </section>

      {/* 7. Testimonials */}
      <section className="container py-16 sm:py-20">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">Trusted by hiring teams</h2>
          <p className="mt-2 text-sm text-muted-foreground">Real feedback from recruiters and engineers who run assessments every week.</p>
          <div className="mt-2 flex items-center justify-center gap-1" aria-label="4.9 out of 5 rating">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" aria-hidden />
            ))}
            <span className="ml-2 text-sm font-semibold">4.9/5 from active teams</span>
          </div>
        </div>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {TESTIMONIALS.map((t) => (
            <Card key={t.name} className="card-hover">
              <CardHeader>
                <Quote className="h-6 w-6 text-indigo-300" aria-hidden />
                <p className="text-sm leading-relaxed">{t.text}</p>
              </CardHeader>
              <CardContent>
                <p className="text-sm font-semibold">{t.name}</p>
                <p className="text-xs text-muted-foreground">{t.role}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* 8. FAQ */}
      <section className="border-y bg-muted/30">
        <div className="container grid gap-8 py-16 sm:py-20 lg:grid-cols-2">
          <div>
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">Frequently asked questions</h2>
            <p className="mt-2 max-w-md text-sm text-muted-foreground">
              Clear answers about invitations, payments, scoring and admin controls. Need more help? Visit the contact page.
            </p>
            <Button variant="outline" asChild className="mt-4">
              <Link href="/contact">Contact support</Link>
            </Button>
          </div>
          <div className="space-y-3">
            {FAQS.map((f) => (
              <details key={f.q} className="group rounded-xl border bg-card p-4 shadow-sm transition-all hover:shadow-md">
                <summary className="cursor-pointer list-none text-sm font-semibold">
                  <span className="flex items-center justify-between gap-3">
                    {f.q}
                    <span className="text-indigo-600 transition-transform group-open:rotate-45" aria-hidden>+</span>
                  </span>
                </summary>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* 9. CTA */}
      <section className="container py-16 sm:py-20">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-900 to-indigo-950 px-6 py-12 text-center text-white sm:px-12">
          <div className="pointer-events-none absolute -left-16 -top-16 h-56 w-56 rounded-full bg-violet-500/30 blur-3xl" aria-hidden />
          <div className="pointer-events-none absolute -bottom-16 -right-16 h-56 w-56 rounded-full bg-indigo-400/30 blur-3xl" aria-hidden />
          <h2 className="relative mx-auto max-w-2xl text-2xl font-bold tracking-tight sm:text-4xl">
            Ready to run your first assessment?
          </h2>
          <p className="relative mx-auto mt-3 max-w-xl text-sm text-indigo-100 sm:text-base">
            Create a free account as a candidate or recruiter. Paid assessments use secure Stripe checkout with verified pricing.
          </p>
          <div className="relative mt-6 flex flex-col justify-center gap-3 sm:flex-row">
            <Button size="lg" variant="secondary" className="min-h-[48px] bg-white text-indigo-900 hover:bg-indigo-50" asChild>
              <Link href="/register"><CheckCircle2 className="h-4 w-4" aria-hidden /> Create account</Link>
            </Button>
            <Button size="lg" variant="outline" className="min-h-[48px] border-white/30 bg-transparent text-white hover:bg-white/10 hover:text-white" asChild>
              <Link href="/about">Learn more</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
