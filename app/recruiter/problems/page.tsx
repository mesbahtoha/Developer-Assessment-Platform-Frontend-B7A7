"use client";

import { Suspense, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Loader2, Pencil, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { Pagination } from "@/components/shared/pagination";
import { SearchInput } from "@/components/shared/search-input";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusBadge } from "@/components/shared/status-badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useURLFilters } from "@/hooks/use-url-filters";
import { useCreateProblem, useDeleteProblem, useProblems, useUpdateProblem } from "@/lib/queries";
import { problemSchema, type ProblemInput } from "@/lib/validations";
import type { Problem } from "@/lib/types";

function ProblemDialog({ problem, onDone }: { problem?: Problem; onDone: () => void }) {
  const [open, setOpen] = useState(false);
  const create = useCreateProblem();
  const update = useUpdateProblem(problem?.id ?? "");
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<ProblemInput>({
    resolver: zodResolver(problemSchema),
    defaultValues: problem
      ? {
          title: problem.title,
          type: problem.type,
          difficulty: problem.difficulty,
          prompt: problem.prompt,
          options: (problem.options ?? []).join(", "),
          correctAnswer: problem.correctAnswer ?? "",
          points: problem.points,
          tags: (problem.tags ?? []).join(", "),
        }
      : { type: "MCQ", difficulty: "EASY", points: 1 },
  });
  const type = watch("type");

  const onSubmit = async (v: ProblemInput) => {
    const body = {
      title: v.title,
      type: v.type,
      difficulty: v.difficulty,
      prompt: v.prompt,
      options: v.type === "MCQ" ? v.options?.split(",").map((s) => s.trim()).filter(Boolean) : undefined,
      correctAnswer: v.correctAnswer.trim(),
      points: v.points,
      tags: v.tags ? v.tags.split(",").map((s) => s.trim()).filter(Boolean) : [],
    };
    try {
      if (problem) await update.mutateAsync(body);
      else await create.mutateAsync(body);
      toast.success(problem ? "Problem updated." : "Problem created.");
      setOpen(false);
      reset();
      onDone();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Save failed");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {problem ? (
          <Button size="sm" variant="outline"><Pencil className="h-4 w-4" aria-hidden /> Edit</Button>
        ) : (
          <Button size="sm"><Plus className="h-4 w-4" aria-hidden /> New problem</Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{problem ? "Edit problem" : "New problem"}</DialogTitle>
          <DialogDescription>MCQ answers must match one of the comma-separated options.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4 sm:grid-cols-2" noValidate>
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="title">Title</Label>
            <Input id="title" {...register("title")} placeholder="Array filtering" />
            {errors.title ? <p className="text-xs text-destructive">{errors.title.message}</p> : null}
          </div>
          <div className="space-y-1.5">
            <Label>Type</Label>
            <Select value={type} onValueChange={(v) => setValue("type", v as "MCQ" | "CODE")}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="MCQ">MCQ</SelectItem>
                <SelectItem value="CODE">CODE</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Difficulty</Label>
            <Select value={watch("difficulty")} onValueChange={(v) => setValue("difficulty", v as "EASY" | "MEDIUM" | "HARD")}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="EASY">Easy</SelectItem>
                <SelectItem value="MEDIUM">Medium</SelectItem>
                <SelectItem value="HARD">Hard</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="prompt">Prompt</Label>
            <Textarea id="prompt" rows={3} {...register("prompt")} placeholder="Which method creates a new array…?" />
            {errors.prompt ? <p className="text-xs text-destructive">{errors.prompt.message}</p> : null}
          </div>
          {type === "MCQ" ? (
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="options">Options (comma separated)</Label>
              <Input id="options" {...register("options")} placeholder="map(), filter(), forEach(), reduce()" />
              {errors.options ? <p className="text-xs text-destructive">{errors.options.message}</p> : null}
            </div>
          ) : null}
          <div className="space-y-1.5">
            <Label htmlFor="correctAnswer">Correct answer {type === "CODE" ? "(reference)" : ""}</Label>
            <Input id="correctAnswer" {...register("correctAnswer")} placeholder={type === "MCQ" ? "filter()" : "Reference solution…"} />
            {errors.correctAnswer ? <p className="text-xs text-destructive">{errors.correctAnswer.message}</p> : null}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="points">Points (1–100)</Label>
            <Input id="points" type="number" min={1} max={100} {...register("points")} />
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="tags">Tags (comma separated)</Label>
            <Input id="tags" {...register("tags")} placeholder="javascript, arrays" />
          </div>
          <div className="sm:col-span-2">
            <Button type="submit" disabled={create.isPending || update.isPending}>
              {(create.isPending || update.isPending) ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : null}
              {problem ? "Save changes" : "Create problem"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function ListInner() {
  const { filters, setFilters, setPage } = useURLFilters({ page: "1", search: "", type: "", difficulty: "" });
  const { data, isLoading, isError, refetch } = useProblems({
    page: filters.page,
    limit: "9",
    search: filters.search || undefined,
    type: filters.type || undefined,
    difficulty: filters.difficulty || undefined,
  });
  const del = useDeleteProblem();
  const problems = data?.problems ?? [];

  const remove = async (id: string) => {
    if (!confirm("Soft-delete this problem?")) return;
    try {
      await del.mutateAsync(id);
      toast.success("Problem deleted.");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Delete failed");
    }
  };

  return (
    <div>
      <div className="flex flex-col gap-3 lg:flex-row">
        <SearchInput className="flex-1" value={filters.search} onChange={(v) => setFilters({ search: v })} placeholder="Search title or prompt…" />
        <div className="flex gap-2">
          <Select value={filters.type || "all"} onValueChange={(v) => setFilters({ type: v === "all" ? "" : v })}>
            <SelectTrigger className="w-32"><SelectValue placeholder="Type" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All types</SelectItem>
              <SelectItem value="MCQ">MCQ</SelectItem>
              <SelectItem value="CODE">CODE</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filters.difficulty || "all"} onValueChange={(v) => setFilters({ difficulty: v === "all" ? "" : v })}>
            <SelectTrigger className="w-36"><SelectValue placeholder="Difficulty" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All levels</SelectItem>
              <SelectItem value="EASY">Easy</SelectItem>
              <SelectItem value="MEDIUM">Medium</SelectItem>
              <SelectItem value="HARD">Hard</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {isLoading ? (
        <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-48 w-full" />)}
        </div>
      ) : isError ? (
        <div className="mt-4 rounded-xl border p-8 text-center">
          <p className="font-medium">Could not load problems.</p>
          <Button className="mt-3" variant="outline" onClick={() => refetch()}>Retry</Button>
        </div>
      ) : problems.length === 0 ? (
        <div className="mt-4"><EmptyState title="No problems yet" hint="Create MCQ or CODE problems to attach to assessments." /></div>
      ) : (
        <>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {problems.map((p) => (
              <Card key={p.id} className="flex flex-col">
                <CardContent className="space-y-2 p-4">
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-medium leading-snug">{p.title}</p>
                    <div className="flex shrink-0 gap-1">
                      <StatusBadge status={p.type} />
                      <StatusBadge status={p.difficulty} />
                    </div>
                  </div>
                  <p className="line-clamp-2 text-sm text-muted-foreground">{p.prompt}</p>
                  <p className="text-xs text-muted-foreground">{p.points} pts · {(p.tags ?? []).join(", ") || "untagged"}</p>
                  <div className="flex gap-2 pt-1">
                    <ProblemDialog problem={p} onDone={() => refetch()} />
                    <Button size="sm" variant="destructive" onClick={() => remove(p.id)} disabled={del.isPending}>
                      <Trash2 className="h-4 w-4" aria-hidden />
                    </Button>
                  </div>
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

export default function RecruiterProblemsPage() {
  return (
    <div>
      <PageHeader
        title="Problem bank"
        description="MCQ and CODE problems with difficulty, points and tags."
        action={
          <Suspense>
            <ProblemDialog onDone={() => {}} />
          </Suspense>
        }
      />
      <Suspense fallback={<Skeleton className="h-64 w-full" />}>
        <ListInner />
      </Suspense>
    </div>
  );
}
