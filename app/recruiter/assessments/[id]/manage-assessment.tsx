"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { ArrowLeft, Loader2, Trash2, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusBadge } from "@/components/shared/status-badge";
import { EmptyState } from "@/components/shared/empty-state";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ApiError } from "@/lib/api-client";
import {
  useAssessment,
  useAssessmentReport,
  useAssessmentResults,
  useAttachProblems,
  useDeleteAssessment,
  useDetachProblem,
  useLeaderboard,
  useProblems,
  usePublishResult,
  useSendInvitation,
  useUpdateAssessment,
} from "@/lib/queries";
import { assessmentSchema, inviteSchema, type AssessmentInput, type InviteInput } from "@/lib/validations";
import { formatCents, formatDateTime } from "@/lib/utils";

const TRANSITIONS: Record<string, string[]> = {
  DRAFT: ["PUBLISHED", "ARCHIVED"],
  PUBLISHED: ["CLOSED", "DRAFT", "ARCHIVED"],
  CLOSED: ["PUBLISHED", "ARCHIVED"],
  ARCHIVED: [],
};

export function ManageAssessment({ id }: { id: string }) {
  const router = useRouter();
  const { data, isLoading, isError, refetch } = useAssessment(id);
  const update = useUpdateAssessment(id);
  const remove = useDeleteAssessment();
  const [tab, setTab] = useState("overview");

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-9 w-2/3" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }
  if (isError || !data?.assessment) {
    return (
      <div className="rounded-xl border p-8 text-center">
        <p className="font-medium">Assessment not found or you do not own it.</p>
        <Button className="mt-3" variant="outline" asChild><Link href="/recruiter/assessments">Back</Link></Button>
      </div>
    );
  }

  const a = data.assessment;
  const allowed = TRANSITIONS[a.status] ?? [];

  const changeStatus = async (status: string) => {
    try {
      await update.mutateAsync({ status });
      toast.success(`Status → ${status}`);
      refetch();
    } catch (e) {
      toast.error(e instanceof ApiError ? e.message : e instanceof Error ? e.message : "Transition failed");
    }
  };

  const deleteIt = async () => {
    if (!confirm("Soft-delete this assessment?")) return;
    try {
      await remove.mutateAsync(id);
      toast.success("Assessment deleted.");
      router.push("/recruiter/assessments");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Delete failed");
    }
  };

  return (
    <div>
      <Button variant="ghost" size="sm" asChild className="mb-4">
        <Link href="/recruiter/assessments"><ArrowLeft className="h-4 w-4" aria-hidden /> All assessments</Link>
      </Button>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{a.title}</h1>
          <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
            <StatusBadge status={a.status} />
            <span>{a.price > 0 ? formatCents(a.price, a.currency) : "Free"}</span>
            <span>{a.durationMin} min · pass {a.passScorePercent}%</span>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {allowed.map((s) => (
            <Button key={s} size="sm" variant="outline" onClick={() => changeStatus(s)} disabled={update.isPending}>
              → {s}
            </Button>
          ))}
          <Button size="sm" variant="destructive" onClick={deleteIt} disabled={remove.isPending}>
            <Trash2 className="h-4 w-4" aria-hidden />
          </Button>
        </div>
      </div>

      <Tabs value={tab} onValueChange={setTab} className="mt-6">
        <TabsList className="flex w-full flex-wrap justify-start">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="problems">Problems</TabsTrigger>
          <TabsTrigger value="invite">Invite</TabsTrigger>
          <TabsTrigger value="results">Results</TabsTrigger>
          <TabsTrigger value="report">Report</TabsTrigger>
        </TabsList>
        <TabsContent value="overview"><EditBasics assessmentId={id} onSaved={() => refetch()} /></TabsContent>
        <TabsContent value="problems"><ManageProblems assessmentId={id} /></TabsContent>
        <TabsContent value="invite"><InviteCandidate assessmentId={id} /></TabsContent>
        <TabsContent value="results"><AssessmentResults assessmentId={id} /></TabsContent>
        <TabsContent value="report"><AssessmentReportView assessmentId={id} /></TabsContent>
      </Tabs>
    </div>
  );
}

function EditBasics({ assessmentId, onSaved }: { assessmentId: string; onSaved: () => void }) {
  const { data } = useAssessment(assessmentId);
  const update = useUpdateAssessment(assessmentId);
  const a = data?.assessment;
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AssessmentInput>({
    resolver: zodResolver(assessmentSchema),
    values: a ? { title: a.title, description: a.description, durationMin: a.durationMin, price: a.price, passScorePercent: a.passScorePercent } : undefined,
  });

  const onSubmit = async (v: AssessmentInput) => {
    try {
      await update.mutateAsync(v);
      toast.success("Assessment updated.");
      onSaved();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Update failed");
    }
  };

  return (
    <Card className="max-w-2xl">
      <CardHeader><CardTitle>Edit basics</CardTitle></CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <div className="space-y-1.5">
            <Label htmlFor="title">Title</Label>
            <Input id="title" {...register("title")} />
            {errors.title ? <p className="text-xs text-destructive">{errors.title.message}</p> : null}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" rows={3} {...register("description")} />
            {errors.description ? <p className="text-xs text-destructive">{errors.description.message}</p> : null}
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-1.5">
              <Label htmlFor="durationMin">Duration (min)</Label>
              <Input id="durationMin" type="number" {...register("durationMin")} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="price">Price (cents)</Label>
              <Input id="price" type="number" {...register("price")} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="passScorePercent">Pass %</Label>
              <Input id="passScorePercent" type="number" {...register("passScorePercent")} />
            </div>
          </div>
          <Button type="submit" disabled={update.isPending}>
            {update.isPending ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : null} Save changes
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

function ManageProblems({ assessmentId }: { assessmentId: string }) {
  const { data, refetch } = useAssessment(assessmentId);
  const { data: bank } = useProblems({ page: "1", limit: "50" });
  const attach = useAttachProblems(assessmentId);
  const detach = useDetachProblem(assessmentId);
  const [selected, setSelected] = useState<string[]>([]);

  const attached = new Set((data?.assessment.problems ?? []).map((l) => l.problemId));
  const available = (bank?.problems ?? []).filter((p) => !attached.has(p.id));

  const doAttach = async () => {
    if (selected.length === 0) {
      toast.error("Select at least one problem.");
      return;
    }
    try {
      await attach.mutateAsync(selected);
      toast.success("Problems attached.");
      setSelected([]);
      refetch();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Attach failed");
    }
  };

  const doDetach = async (problemId: string) => {
    try {
      await detach.mutateAsync(problemId);
      toast.success("Problem detached.");
      refetch();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Detach failed");
    }
  };

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card>
        <CardHeader><CardTitle>Attached ({attached.size})</CardTitle></CardHeader>
        <CardContent>
          {(data?.assessment.problems ?? []).length === 0 ? (
            <EmptyState title="No problems attached" hint="Publishing requires at least one problem." />
          ) : (
            <ul className="space-y-2">
              {(data?.assessment.problems ?? []).map((l, i) => (
                <li key={l.problemId} className="flex items-center justify-between gap-2 rounded-lg border p-2.5 text-sm">
                  <span className="truncate">Q{i + 1}. {l.problem?.title ?? l.problemId}</span>
                  <Button size="sm" variant="outline" onClick={() => doDetach(l.problemId)} disabled={detach.isPending}>Remove</Button>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle>Available in bank</CardTitle></CardHeader>
        <CardContent>
          {available.length === 0 ? (
            <p className="text-sm text-muted-foreground">Everything in the bank is already attached.</p>
          ) : (
            <>
              <ul className="max-h-80 space-y-2 overflow-y-auto">
                {available.map((p) => {
                  const on = selected.includes(p.id);
                  return (
                    <li key={p.id}>
                      <button
                        type="button"
                        onClick={() => setSelected((prev) => (on ? prev.filter((x) => x !== p.id) : [...prev, p.id]))}
                        className={`w-full rounded-lg border p-2.5 text-left text-sm hover:bg-accent ${on ? "border-primary bg-primary/5" : ""}`}
                        aria-pressed={on}
                      >
                        <span className="font-medium">{p.title}</span>
                        <span className="ml-2"><StatusBadge status={p.type} /></span>
                      </button>
                    </li>
                  );
                })}
              </ul>
              <Button className="mt-3" size="sm" onClick={doAttach} disabled={attach.isPending}>
                {attach.isPending ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : null}
                Attach {selected.length} selected
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function InviteCandidate({ assessmentId }: { assessmentId: string }) {
  const send = useSendInvitation();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<InviteInput>({
    resolver: zodResolver(inviteSchema),
    defaultValues: { assessmentId, candidateEmail: "" },
  });

  const onSubmit = async (v: InviteInput) => {
    try {
      await send.mutateAsync({ assessmentId, candidateEmail: v.candidateEmail });
      toast.success(`Invitation sent to ${v.candidateEmail}.`);
      reset({ assessmentId, candidateEmail: "" });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Invite failed");
    }
  };

  return (
    <Card className="max-w-xl">
      <CardHeader><CardTitle>Invite a candidate</CardTitle></CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <input type="hidden" {...register("assessmentId")} />
          <div className="space-y-1.5">
            <Label htmlFor="candidateEmail">Candidate email (must be a registered candidate)</Label>
            <Input id="candidateEmail" type="email" placeholder="Enter candidate email" {...register("candidateEmail")} />
            {errors.candidateEmail ? <p className="text-xs text-destructive">{errors.candidateEmail.message}</p> : null}
          </div>
          <Button type="submit" disabled={send.isPending}>
            {send.isPending ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : <UserPlus className="h-4 w-4" aria-hidden />}
            Send invitation
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

function AssessmentResults({ assessmentId }: { assessmentId: string }) {
  const { data, isLoading, refetch } = useAssessmentResults(assessmentId, { page: "1", limit: "20" });
  const { data: lb } = useLeaderboard(assessmentId, 5);
  const publish = usePublishResult();
  const results = data?.results ?? [];

  const act = async (id: string, action: "publish" | "unpublish") => {
    try {
      await publish.mutateAsync({ id, action });
      toast.success(action === "publish" ? "Result published." : "Result unpublished.");
      refetch();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Action failed");
    }
  };

  if (isLoading) return <Skeleton className="h-48 w-full" />;

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <Card className="lg:col-span-2">
        <CardHeader><CardTitle>Results ({data?.meta.total ?? results.length})</CardTitle></CardHeader>
        <CardContent>
          {results.length === 0 ? (
            <EmptyState title="No results yet" hint="Results appear once candidates submit attempts." />
          ) : (
            <ul className="space-y-2">
              {results.map((r) => (
                <li key={r.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border p-3 text-sm">
                  <div>
                    <p className="font-medium">{r.attempt?.candidate?.name ?? r.attempt?.candidate?.email}</p>
                    <p className="text-xs text-muted-foreground">{r.score}/{r.totalPoints} · {r.percentage}% · {formatDateTime(r.createdAt)}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusBadge status={r.isPassed ? "ACCEPTED" : "FAILED"} />
                    <Button size="sm" variant="outline" onClick={() => act(r.id, r.publishedAt ? "unpublish" : "publish")} disabled={publish.isPending}>
                      {r.publishedAt ? "Unpublish" : "Publish"}
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle>Leaderboard (top 5)</CardTitle></CardHeader>
        <CardContent>
          {(lb?.leaderboard ?? []).length === 0 ? (
            <p className="text-sm text-muted-foreground">No ranked candidates yet.</p>
          ) : (
            <ol className="space-y-2 text-sm">
              {(lb?.leaderboard ?? []).map((r, i) => (
                <li key={r.id} className="flex items-center justify-between rounded-lg border p-2.5">
                  <span>#{i + 1} {r.attempt?.candidate?.name}</span>
                  <strong>{r.percentage}%</strong>
                </li>
              ))}
            </ol>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function AssessmentReportView({ assessmentId }: { assessmentId: string }) {
  const { data, isLoading, isError } = useAssessmentReport(assessmentId);

  if (isLoading) return <Skeleton className="h-64 w-full" />;
  if (isError || !data?.report) {
    return <p className="text-sm text-muted-foreground">Report unavailable for this assessment.</p>;
  }
  const r = data.report;

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card>
        <CardHeader><CardTitle>Attempt funnel</CardTitle></CardHeader>
        <CardContent className="space-y-1 text-sm">
          <p>Total attempts: <strong>{r.attempts.total}</strong></p>
          {Object.entries(r.attempts.byStatus ?? {}).map(([k, v]) => (
            <p key={k} className="flex justify-between"><span>{k}</span><strong>{v as number}</strong></p>
          ))}
          <div className="pt-2">
            <p>Results: <strong>{r.results.total}</strong> · pass rate <strong>{r.results.passRate}%</strong></p>
            <p className="text-muted-foreground">Avg {r.results.averagePercentage}% · best {r.results.highestPercentage}% · lowest {r.results.lowestPercentage}%</p>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle>Per-problem accuracy</CardTitle></CardHeader>
        <CardContent>
          {r.perProblem.length === 0 ? (
            <p className="text-sm text-muted-foreground">No submissions yet.</p>
          ) : (
            <ul className="space-y-2 text-sm">
              {r.perProblem.map((p) => (
                <li key={p.problemId} className="rounded-lg border p-2.5">
                  <p className="font-medium">{p.problemTitle}</p>
                  <div className="mt-1 h-2 overflow-hidden rounded bg-muted">
                    <div className="h-full bg-primary" style={{ width: `${Math.round(p.accuracy)}%` }} />
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">{p.correct}/{p.submissions} correct · {Math.round(p.accuracy)}%</p>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
