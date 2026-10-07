"use client";

import { Suspense, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { Pagination } from "@/components/shared/pagination";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusBadge } from "@/components/shared/status-badge";
import { useURLFilters } from "@/hooks/use-url-filters";
import { useEvaluateSubmission, usePendingSubmissions } from "@/lib/queries";
import { evaluateSchema, type EvaluateInput } from "@/lib/validations";
import { formatDateTime } from "@/lib/utils";

function EvaluateDialog({ submissionId, maxScore, onDone }: { submissionId: string; maxScore: number; onDone: () => void }) {
  const [open, setOpen] = useState(false);
  const evaluate = useEvaluateSubmission();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<EvaluateInput>({ resolver: zodResolver(evaluateSchema) });

  const onSubmit = async (v: EvaluateInput) => {
    if (v.score > maxScore) {
      toast.error(`Score cannot exceed ${maxScore}.`);
      return;
    }
    try {
      await evaluate.mutateAsync({ id: submissionId, score: v.score, feedback: v.feedback || undefined });
      toast.success("Submission evaluated.");
      setOpen(false);
      reset();
      onDone();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Evaluation failed");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">Evaluate</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Manual evaluation</DialogTitle>
          <DialogDescription>Score 0–{maxScore} with optional feedback for the candidate.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <div className="space-y-1.5">
            <Label htmlFor={`score-${submissionId}`}>Score (max {maxScore})</Label>
            <Input id={`score-${submissionId}`} type="number" min={0} max={maxScore} {...register("score")} />
            {errors.score ? <p className="text-xs text-destructive">{errors.score.message}</p> : null}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor={`fb-${submissionId}`}>Feedback</Label>
            <Textarea id={`fb-${submissionId}`} rows={3} {...register("feedback")} placeholder="Clean solution, consider edge cases…" />
            {errors.feedback ? <p className="text-xs text-destructive">{errors.feedback.message}</p> : null}
          </div>
          <Button type="submit" disabled={evaluate.isPending}>
            {evaluate.isPending ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : null} Submit evaluation
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function ListInner() {
  const { filters, setPage } = useURLFilters({ page: "1" });
  const { data, isLoading, isError, refetch } = usePendingSubmissions({ page: filters.page, limit: "10" });
  const submissions = data?.submissions ?? [];

  return (
    <div>
      {isLoading ? (
        <div className="space-y-3">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-32 w-full" />)}</div>
      ) : isError ? (
        <div className="rounded-xl border p-8 text-center">
          <p className="font-medium">Could not load the queue.</p>
          <Button className="mt-3" variant="outline" onClick={() => refetch()}>Retry</Button>
        </div>
      ) : submissions.length === 0 ? (
        <EmptyState title="Queue is clear" hint="CODE submissions awaiting manual review will appear here." />
      ) : (
        <>
          <div className="space-y-3">
            {submissions.map((s) => (
              <Card key={s.id}>
                <CardContent className="space-y-2 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="font-medium">{s.problem?.title}</p>
                    <StatusBadge status={s.status} />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {s.attempt?.candidate?.name} ({s.attempt?.candidate?.email}) · {s.attempt?.assessment?.title} · {formatDateTime(s.createdAt)}
                  </p>
                  <pre className="max-h-40 overflow-auto rounded-lg bg-muted p-3 font-mono text-xs">{s.answer ?? "(empty)"}</pre>
                  <EvaluateDialog submissionId={s.id} maxScore={s.problem?.points ?? 1} onDone={() => refetch()} />
                </CardContent>
              </Card>
            ))}
          </div>
          <Pagination page={Number(filters.page) || 1} totalPages={data?.meta.totalPages ?? 0} onChange={setPage} />
        </>
      )}
    </div>
  );
}

export default function RecruiterEvaluationPage() {
  return (
    <div>
      <PageHeader title="Evaluation queue" description="CODE submissions awaiting manual scoring. Each evaluation recomputes the attempt result." />
      <Suspense fallback={<Skeleton className="h-48 w-full" />}>
        <ListInner />
      </Suspense>
    </div>
  );
}
