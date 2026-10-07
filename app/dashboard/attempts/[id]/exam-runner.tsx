"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { ArrowLeft, CheckCircle2, Loader2, Send, Timer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { StatusBadge } from "@/components/shared/status-badge";
import { ApiError } from "@/lib/api-client";
import { useAssessment, useAttempt, useSaveSubmission, useSubmitAttempt } from "@/lib/queries";
import { timeLeft } from "@/lib/utils";

export function ExamRunner({ attemptId }: { attemptId: string }) {
  const router = useRouter();
  const { data: attemptData, isLoading, isError, refetch } = useAttempt(attemptId);
  const submitMutation = useSubmitAttempt();
  const saveMutation = useSaveSubmission(attemptId);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [languages, setLanguages] = useState<Record<string, string>>({});
  const [savingId, setSavingId] = useState<string | null>(null);
  const [now, setNow] = useState(() => Date.now());

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const attempt = (attemptData as any)?.attempt ?? attemptData;
  const assessmentId: string | undefined = attempt?.assessmentId ?? attempt?.assessment?.id;
  const { data: assessmentData } = useAssessment(assessmentId ?? "");

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const problems = useMemo(() => (assessmentData as any)?.assessment?.problems ?? [], [assessmentData]);
  const submissions: Array<{ problemId: string; answer?: string | null; status: string; pointsAwarded?: number | null }> =
    attempt?.submissions ?? [];
  const submittedByProblem = useMemo(() => {
    const map: Record<string, (typeof submissions)[number]> = {};
    submissions.forEach((s) => { map[s.problemId] = s; });
    return map;
  }, [submissions]);

  const isActive = attempt?.status === "IN_PROGRESS";

  useEffect(() => {
    if (!isActive) return;
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, [isActive]);

  useEffect(() => {
    if (!attempt?.deadlineAt || !isActive) return;
    if (new Date(attempt.deadlineAt).getTime() <= Date.now()) {
      toast.error("Time is up — finalizing your attempt.");
      refetch();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [now]);

  const saveAnswer = async (problemId: string, type: string) => {
    const answer = (answers[problemId] ?? submittedByProblem[problemId]?.answer ?? "").trim();
    if (!answer) {
      toast.error("Write an answer before saving.");
      return;
    }
    setSavingId(problemId);
    try {
      const res = await saveMutation.mutateAsync({
        problemId,
        answer,
        language: type === "CODE" ? languages[problemId] || "javascript" : undefined,
      });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const saved = (res as any)?.submission;
      if (saved?.status === "EVALUATED") {
        toast.success(saved.pointsAwarded > 0 ? "Correct — answer saved!" : "Saved — that MCQ was incorrect.");
      } else {
        toast.success("Answer saved — queued for manual review.");
      }
      refetch();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not save answer");
    } finally {
      setSavingId(null);
    }
  };

  const finalize = async () => {
    try {
      await submitMutation.mutateAsync(attemptId);
      toast.success("Attempt submitted — results computed.");
      refetch();
      router.refresh();
    } catch (e) {
      if (e instanceof ApiError && e.status === 409) toast.error(e.message);
      else toast.error(e instanceof Error ? e.message : "Could not submit attempt");
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-9 w-2/3" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }
  if (isError || !attempt) {
    return (
      <div className="rounded-xl border p-8 text-center">
        <p className="font-medium">Attempt not found or you do not have access.</p>
        <Button className="mt-3" variant="outline" asChild><Link href="/dashboard/attempts">Back to attempts</Link></Button>
      </div>
    );
  }

  return (
    <div>
      <Button variant="ghost" size="sm" asChild className="mb-4">
        <Link href="/dashboard/attempts"><ArrowLeft className="h-4 w-4" aria-hidden /> All attempts</Link>
      </Button>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{attempt.assessment?.title ?? "Attempt"}</h1>
          <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
            <StatusBadge status={attempt.status} />
            {attempt.deadlineAt ? (
              <span className="inline-flex items-center gap-1 font-medium text-foreground">
                <Timer className="h-4 w-4" aria-hidden />
                {isActive ? timeLeft(attempt.deadlineAt) : "Closed"} left
              </span>
            ) : null}
          </div>
        </div>
        {isActive ? (
          <Button onClick={finalize} disabled={submitMutation.isPending}>
            {submitMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : <Send className="h-4 w-4" aria-hidden />}
            Finalize attempt
          </Button>
        ) : null}
      </div>

      {attempt.result ? (
        <Card className="mt-4 border-emerald-200 bg-emerald-50/50">
          <CardContent className="flex flex-wrap items-center gap-4 p-4 text-sm">
            <CheckCircle2 className="h-5 w-5 text-emerald-600" aria-hidden />
            <span>Score <strong>{attempt.result.score}/{attempt.result.totalPoints}</strong></span>
            <span><strong>{attempt.result.percentage}%</strong></span>
            <StatusBadge status={attempt.result.isPassed ? "ACCEPTED" : "FAILED"} />
            <span className="text-muted-foreground">{attempt.result.isPassed ? "Passed" : "Not passed"} — {attempt.status}</span>
          </CardContent>
        </Card>
      ) : null}

      <div className="mt-4 space-y-4">
        {problems.length === 0 ? (
          <Card><CardContent className="p-6 text-sm text-muted-foreground">Loading questions… if this persists, reopen the assessment page.</CardContent></Card>
        ) : null}
        {problems.map((link: { problemId: string; points?: number | null; problem?: { title: string; type: string; difficulty: string; prompt: string; options?: string[] | null; points: number } }, i: number) => {
          const p = link.problem;
          if (!p) return null;
          const saved = submittedByProblem[link.problemId];
          const draft = answers[link.problemId] ?? saved?.answer ?? "";
          return (
            <Card key={link.problemId}>
              <CardHeader>
                <CardTitle className="text-base">
                  Q{i + 1}. {p.title}
                  <span className="ml-2 inline-flex gap-2 align-middle">
                    <StatusBadge status={p.type} />
                    <StatusBadge status={p.difficulty} />
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="whitespace-pre-wrap text-sm">{p.prompt}</p>
                <p className="text-xs text-muted-foreground">{link.points ?? p.points} points</p>

                {p.type === "MCQ" && Array.isArray(p.options) ? (
                  <div className="space-y-2" role="radiogroup" aria-label={`Options for question ${i + 1}`}>
                    {p.options.map((opt) => (
                      <label key={opt} className="flex cursor-pointer items-center gap-2 rounded-lg border p-2.5 text-sm hover:bg-accent">
                        <input
                          type="radio"
                          name={`q-${link.problemId}`}
                          value={opt}
                          checked={draft === opt}
                          disabled={!isActive}
                          onChange={() => setAnswers((prev) => ({ ...prev, [link.problemId]: opt }))}
                          className="h-4 w-4 accent-current"
                        />
                        {opt}
                      </label>
                    ))}
                  </div>
                ) : (
                  <>
                    <div className="grid gap-2 sm:grid-cols-3">
                      <div className="space-y-1.5 sm:col-span-1">
                        <Label htmlFor={`lang-${link.problemId}`}>Language</Label>
                        <Input
                          id={`lang-${link.problemId}`}
                          value={languages[link.problemId] ?? saved?.language ?? "javascript"}
                          disabled={!isActive}
                          onChange={(e) => setLanguages((prev) => ({ ...prev, [link.problemId]: e.target.value }))}
                        />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor={`ans-${link.problemId}`}>Your code / answer</Label>
                      <Textarea
                        id={`ans-${link.problemId}`}
                        rows={6}
                        className="font-mono text-xs"
                        value={draft}
                        disabled={!isActive}
                        onChange={(e) => setAnswers((prev) => ({ ...prev, [link.problemId]: e.target.value }))}
                        placeholder={p.type === "CODE" ? "// write your solution here" : "Your answer"}
                      />
                    </div>
                  </>
                )}

                <div className="flex flex-wrap items-center gap-2">
                  {isActive ? (
                    <Button size="sm" onClick={() => saveAnswer(link.problemId, p.type)} disabled={savingId === link.problemId}>
                      {savingId === link.problemId ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : null}
                      Save answer
                    </Button>
                  ) : null}
                  {saved ? (
                    <span className="inline-flex items-center gap-2 text-xs text-muted-foreground">
                      <StatusBadge status={saved.status} />
                      {saved.pointsAwarded !== null && saved.pointsAwarded !== undefined ? `${saved.pointsAwarded} pts` : ""}
                    </span>
                  ) : (
                    <span className="text-xs text-muted-foreground">Not answered yet</span>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
