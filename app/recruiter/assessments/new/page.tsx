"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { ArrowLeft, ArrowRight, Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { ApiError } from "@/lib/api-client";
import { useAttachProblems, useCreateAssessment, useProblems, useUpdateAssessment } from "@/lib/queries";
import { assessmentSchema, type AssessmentInput } from "@/lib/validations";
import { formatCents } from "@/lib/utils";

const STEPS = ["Basics", "Attach problems", "Publish"];

export default function NewAssessmentWizard() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [assessmentId, setAssessmentId] = useState<string | null>(null);
  const [selected, setSelected] = useState<string[]>([]);
  const create = useCreateAssessment();
  const attach = useAttachProblems(assessmentId ?? "");

  const { data: problemsData } = useProblems({ page: "1", limit: "50" });
  const problems = problemsData?.problems ?? [];

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<AssessmentInput>({
    resolver: zodResolver(assessmentSchema),
    defaultValues: { durationMin: 60, price: 0, passScorePercent: 50 },
  });
  const values = watch();

  const createDraft = async (v: AssessmentInput) => {
    try {
      const res = await create.mutateAsync({ ...v, price: Math.round(Number(v.price)) });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const id = (res as any)?.assessment?.id as string;
      setAssessmentId(id);
      toast.success("DRAFT created, now attach problems.");
      setStep(1);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not create assessment");
    }
  };

  const attachSelected = async () => {
    if (!assessmentId) return;
    if (selected.length === 0) {
      toast.error("Select at least one problem, publishing requires ≥1.");
      return;
    }
    try {
      await attach.mutateAsync(selected);
      toast.success(`${selected.length} problem(s) attached.`);
      setStep(2);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not attach problems");
    }
  };

  return (
    <div>
      <PageHeader title="New assessment" description="Three-step wizard: basics → problems → publish." />

      <ol className="mb-6 flex gap-2" aria-label="Progress">
        {STEPS.map((s, i) => (
          <li key={s} className={`flex flex-1 items-center gap-2 rounded-lg border p-2.5 text-sm ${i === step ? "border-primary bg-primary/5 font-semibold" : i < step ? "bg-muted" : ""}`}>
            <span className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${i < step ? "bg-emerald-600 text-white" : i === step ? "bg-primary text-primary-foreground" : "bg-muted-foreground/20"}`}>
              {i < step ? <Check className="h-3.5 w-3.5" aria-hidden /> : i + 1}
            </span>
            {s}
          </li>
        ))}
      </ol>

      {step === 0 ? (
        <Card className="max-w-2xl">
          <CardHeader>
            <CardTitle>Step 1, Basics</CardTitle>
            <CardDescription>Creates the assessment in DRAFT. Price is in cents (0 = free).</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(createDraft)} className="space-y-4" noValidate>
              <div className="space-y-1.5">
                <Label htmlFor="title">Title</Label>
                <Input id="title" {...register("title")} placeholder="JavaScript Fundamentals" />
                {errors.title ? <p className="text-xs text-destructive">{errors.title.message}</p> : null}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" rows={3} {...register("description")} placeholder="Core JS concepts: types, arrays, closures…" />
                {errors.description ? <p className="text-xs text-destructive">{errors.description.message}</p> : null}
              </div>
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-1.5">
                  <Label htmlFor="durationMin">Duration (min)</Label>
                  <Input id="durationMin" type="number" min={5} max={600} {...register("durationMin")} />
                  {errors.durationMin ? <p className="text-xs text-destructive">{errors.durationMin.message}</p> : null}
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="price">Price (cents)</Label>
                  <Input id="price" type="number" min={0} {...register("price")} />
                  {errors.price ? <p className="text-xs text-destructive">{errors.price.message}</p> : null}
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="passScorePercent">Pass %</Label>
                  <Input id="passScorePercent" type="number" min={1} max={100} {...register("passScorePercent")} />
                  {errors.passScorePercent ? <p className="text-xs text-destructive">{errors.passScorePercent.message}</p> : null}
                </div>
              </div>
              <Button type="submit" disabled={create.isPending}>
                {create.isPending ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : null}
                Create DRAFT <ArrowRight className="h-4 w-4" aria-hidden />
              </Button>
            </form>
          </CardContent>
        </Card>
      ) : null}

      {step === 1 ? (
        <Card>
          <CardHeader>
            <CardTitle>Step 2, Attach problems</CardTitle>
            <CardDescription>Select from your problem bank. Publishing requires at least one.</CardDescription>
          </CardHeader>
          <CardContent>
            {problems.length === 0 ? (
              <p className="text-sm text-muted-foreground">No problems in the bank yet, create some on the Problem Bank page first.</p>
            ) : (
              <ul className="grid gap-2 sm:grid-cols-2">
                {problems.map((p) => {
                  const on = selected.includes(p.id);
                  return (
                    <li key={p.id}>
                      <button
                        type="button"
                        onClick={() => setSelected((prev) => (on ? prev.filter((x) => x !== p.id) : [...prev, p.id]))}
                        className={`w-full rounded-lg border p-3 text-left text-sm hover:bg-accent ${on ? "border-primary bg-primary/5" : ""}`}
                        aria-pressed={on}
                      >
                        <span className="font-medium">{p.title}</span>
                        <span className="ml-2 inline-flex gap-1 align-middle"><StatusBadge status={p.type} /><StatusBadge status={p.difficulty} /></span>
                        <span className="block text-xs text-muted-foreground">{p.points} pts</span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
            <div className="mt-4 flex gap-2">
              <Button variant="outline" onClick={() => setStep(0)}><ArrowLeft className="h-4 w-4" aria-hidden /> Back</Button>
              <Button onClick={attachSelected} disabled={attach.isPending}>
                {attach.isPending ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : null}
                Attach {selected.length} & continue <ArrowRight className="h-4 w-4" aria-hidden />
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : null}

      {step === 2 ? (
        <PublishStep assessmentId={assessmentId!} summary={`${values.title} · ${formatCents(Number(values.price) || 0)} · ${selected.length} problems`} onDone={(id) => router.push(`/recruiter/assessments/${id}`)} />
      ) : null}
    </div>
  );
}

function PublishStep({ assessmentId, summary, onDone }: { assessmentId: string; summary: string; onDone: (id: string) => void }) {
  const publish = useUpdateAssessment(assessmentId);
  const [error, setError] = useState<string | null>(null);

  const doPublish = async () => {
    setError(null);
    try {
      await publish.mutateAsync({ status: "PUBLISHED" });
      toast.success("Assessment published, candidates can now be invited.");
      onDone(assessmentId);
    } catch (e) {
      const msg = e instanceof ApiError ? e.message : e instanceof Error ? e.message : "Publish failed";
      setError(msg);
      toast.error(msg);
    }
  };

  return (
    <Card className="max-w-2xl">
      <CardHeader>
        <CardTitle>Step 3, Publish</CardTitle>
        <CardDescription>{summary}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-muted-foreground">
          Publishing moves DRAFT → PUBLISHED. Candidates with invitations can then pay (if priced) and
          start timed attempts.
        </p>
        {error ? <p className="rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">{error}</p> : null}
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => onDone(assessmentId)}>Manage later</Button>
          <Button onClick={doPublish} disabled={publish.isPending}>
            {publish.isPending ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : null}
            Publish now
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
