"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "./api-client";
import type {
  AdminUser,
  Assessment,
  AssessmentReport,
  Attempt,
  AuditLog,
  CandidateProfile,
  DashboardStats,
  Invitation,
  PaginationMeta,
  Payment,
  Problem,
  RecruiterProfile,
  ResultItem,
  ResultsSummary,
  SessionUser,
  Submission,
} from "./types";

export function qs(params: object): string {
  const sp = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== "") sp.set(k, String(v));
  });
  const s = sp.toString();
  return s ? `?${s}` : "";
}

/* ---------- Auth ---------- */

export function useMe(enabled = true) {
  return useQuery({
    queryKey: ["me"],
    queryFn: () => apiFetch<{ user: SessionUser }>("/auth/me"),
    enabled,
    retry: false,
  });
}

/* ---------- Users / profiles ---------- */

export function useAccount() {
  return useQuery({
    queryKey: ["account"],
    queryFn: () => apiFetch<{ user: SessionUser }>("/users/me"),
  });
}

export function useMyProfile() {
  return useQuery({
    queryKey: ["my-profile"],
    queryFn: () =>
      apiFetch<{
        profile: CandidateProfile | RecruiterProfile | null;
        profileType: "CANDIDATE" | "RECRUITER" | null;
      }>("/users/me/profile"),
  });
}

export function useUpdateAccount() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: { name?: string; avatarUrl?: string | null }) =>
      apiFetch<{ user: SessionUser }>("/users/me", { method: "PATCH", body }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["account"] });
      qc.invalidateQueries({ queryKey: ["me"] });
    },
  });
}

export function useUpdateProfile() {
  const qc = useQueryClient();
  return useMutation({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mutationFn: (body: Record<string, any>) =>
      apiFetch("/users/me/profile", { method: "PATCH", body }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["my-profile"] }),
  });
}

export function useChangePassword() {
  return useMutation({
    mutationFn: (body: { currentPassword: string; newPassword: string }) =>
      apiFetch("/auth/change-password", { method: "PATCH", body }),
  });
}

/* ---------- Problems ---------- */

export interface ProblemFilters {
  page?: string;
  limit?: string;
  type?: string;
  difficulty?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: string;
}

export function useProblems(filters: ProblemFilters) {
  return useQuery({
    queryKey: ["problems", filters],
    queryFn: () =>
      apiFetch<{ problems: Problem[]; meta: PaginationMeta }>(`/problems${qs(filters)}`),
  });
}

export function useProblem(id: string) {
  return useQuery({
    queryKey: ["problem", id],
    queryFn: () => apiFetch<{ problem: Problem }>(`/problems/${id}`),
    enabled: !!id,
  });
}

export function useCreateProblem() {
  const qc = useQueryClient();
  return useMutation({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mutationFn: (body: Record<string, any>) =>
      apiFetch<{ problem: Problem }>("/problems", { method: "POST", body }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["problems"] }),
  });
}

export function useUpdateProblem(id: string) {
  const qc = useQueryClient();
  return useMutation({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mutationFn: (body: Record<string, any>) =>
      apiFetch<{ problem: Problem }>(`/problems/${id}`, { method: "PATCH", body }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["problems"] });
      qc.invalidateQueries({ queryKey: ["problem", id] });
    },
  });
}

export function useDeleteProblem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiFetch(`/problems/${id}`, { method: "DELETE" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["problems"] }),
  });
}

/* ---------- Assessments ---------- */

export interface AssessmentFilters {
  page?: string;
  limit?: string;
  status?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: string;
}

export function useAssessments(filters: AssessmentFilters) {
  return useQuery({
    queryKey: ["assessments", filters],
    queryFn: () =>
      apiFetch<{ assessments: Assessment[]; meta: PaginationMeta }>(
        `/assessments${qs(filters)}`
      ),
  });
}

export function useAssessment(id: string) {
  return useQuery({
    queryKey: ["assessment", id],
    queryFn: () => apiFetch<{ assessment: Assessment }>(`/assessments/${id}`),
    enabled: !!id,
  });
}

export function useCreateAssessment() {
  const qc = useQueryClient();
  return useMutation({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mutationFn: (body: Record<string, any>) =>
      apiFetch<{ assessment: Assessment }>("/assessments", { method: "POST", body }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["assessments"] }),
  });
}

export function useUpdateAssessment(id: string) {
  const qc = useQueryClient();
  return useMutation({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mutationFn: (body: Record<string, any>) =>
      apiFetch<{ assessment: Assessment }>(`/assessments/${id}`, { method: "PATCH", body }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["assessments"] });
      qc.invalidateQueries({ queryKey: ["assessment", id] });
    },
  });
}

export function useDeleteAssessment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiFetch(`/assessments/${id}`, { method: "DELETE" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["assessments"] }),
  });
}

export function useAttachProblems(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (problemIds: string[]) =>
      apiFetch(`/assessments/${id}/problems`, { method: "POST", body: { problemIds } }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["assessment", id] });
      qc.invalidateQueries({ queryKey: ["assessments"] });
    },
  });
}

export function useDetachProblem(assessmentId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (problemId: string) =>
      apiFetch(`/assessments/${assessmentId}/problems/${problemId}`, { method: "DELETE" }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["assessment", assessmentId] });
      qc.invalidateQueries({ queryKey: ["assessments"] });
    },
  });
}

export function useStartAttempt() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (assessmentId: string) =>
      apiFetch<{ attempt: Attempt }>(`/assessments/${assessmentId}/start`, { method: "POST" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["my-attempts"] }),
  });
}

/* ---------- Invitations ---------- */

export function useInvitations(filters: Record<string, string | undefined>) {
  return useQuery({
    queryKey: ["invitations", filters],
    queryFn: () =>
      apiFetch<{ invitations: Invitation[]; meta: PaginationMeta }>(
        `/invitations${qs(filters)}`
      ),
  });
}

export function useSendInvitation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: { assessmentId: string; candidateEmail: string }) =>
      apiFetch<{ invitation: Invitation }>("/invitations", { method: "POST", body }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["invitations"] }),
  });
}

export function useRespondInvitation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, action }: { id: string; action: "accept" | "reject" }) =>
      apiFetch<{ invitation: Invitation }>(`/invitations/${id}/${action}`, { method: "PATCH" }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["invitations"] });
      qc.invalidateQueries({ queryKey: ["my-attempts"] });
    },
  });
}

/* ---------- Attempts & submissions ---------- */

export function useMyAttempts(filters: Record<string, string | undefined>) {
  return useQuery({
    queryKey: ["my-attempts", filters],
    queryFn: () =>
      apiFetch<{ attempts: Attempt[]; meta: PaginationMeta }>(
        `/attempts/my-attempts${qs(filters)}`
      ),
  });
}

export function useAttempt(id: string) {
  return useQuery({
    queryKey: ["attempt", id],
    queryFn: () => apiFetch<{ attempt: Attempt }>(`/attempts/${id}`),
    enabled: !!id,
    refetchInterval: (query) => {
      const data = query.state.data as { attempt: Attempt } | undefined;
      return data?.attempt.status === "IN_PROGRESS" ? 30_000 : false;
    },
  });
}

export function useSubmitAttempt() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiFetch(`/attempts/${id}/submit`, { method: "PATCH" }),
    onSuccess: (_d, id) => {
      qc.invalidateQueries({ queryKey: ["attempt", id] });
      qc.invalidateQueries({ queryKey: ["my-attempts"] });
    },
  });
}

export function useSaveSubmission(attemptId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: { problemId: string; answer: string; language?: string }) =>
      apiFetch<{ submission: Submission }>(`/attempts/${attemptId}/submissions`, {
        method: "POST",
        body,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["attempt", attemptId] });
      qc.invalidateQueries({ queryKey: ["attempt-submissions", attemptId] });
    },
  });
}

export function useAttemptSubmissions(attemptId: string) {
  return useQuery({
    queryKey: ["attempt-submissions", attemptId],
    queryFn: () =>
      apiFetch<{ submissions: Submission[] }>(`/attempts/${attemptId}/submissions`),
    enabled: !!attemptId,
  });
}

export function useSubmission(id: string) {
  return useQuery({
    queryKey: ["submission", id],
    queryFn: () => apiFetch<{ submission: Submission }>(`/submissions/${id}`),
    enabled: !!id,
  });
}

/* ---------- Evaluation (recruiter) ---------- */

export function usePendingSubmissions(filters: Record<string, string | undefined>) {
  return useQuery({
    queryKey: ["pending-submissions", filters],
    queryFn: () =>
      apiFetch<{ submissions: Submission[]; meta: PaginationMeta }>(
        `/evaluation/submissions/pending${qs(filters)}`
      ),
  });
}

export function useEvaluateSubmission() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, score, feedback }: { id: string; score: number; feedback?: string }) =>
      apiFetch(`/evaluation/submissions/${id}/evaluate`, {
        method: "PATCH",
        body: { score, feedback },
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["pending-submissions"] });
    },
  });
}

export function useAssessmentReport(id: string) {
  return useQuery({
    queryKey: ["assessment-report", id],
    queryFn: () =>
      apiFetch<{ report: AssessmentReport }>(`/evaluation/assessments/${id}/report`),
    enabled: !!id,
  });
}

/* ---------- Results ---------- */

export function useMyResults(filters: Record<string, string | undefined>) {
  return useQuery({
    queryKey: ["my-results", filters],
    queryFn: () =>
      apiFetch<{ results: ResultItem[]; meta: PaginationMeta }>(`/results/me${qs(filters)}`),
  });
}

export function useResultsSummary() {
  return useQuery({
    queryKey: ["results-summary"],
    queryFn: () => apiFetch<ResultsSummary>("/results/me/summary"),
  });
}

export function useResult(id: string) {
  return useQuery({
    queryKey: ["result", id],
    queryFn: () =>
      apiFetch<{ result: ResultItem; breakdown: Submission[] }>(`/results/${id}`),
    enabled: !!id,
  });
}

export function useAssessmentResults(assessmentId: string, filters: Record<string, string | undefined>) {
  return useQuery({
    queryKey: ["assessment-results", assessmentId, filters],
    queryFn: () =>
      apiFetch<{ results: ResultItem[]; meta: PaginationMeta }>(
        `/results/assessment/${assessmentId}${qs(filters)}`
      ),
    enabled: !!assessmentId,
  });
}

export function useLeaderboard(assessmentId: string, limit = 10) {
  return useQuery({
    queryKey: ["leaderboard", assessmentId, limit],
    queryFn: () =>
      apiFetch<{ assessmentId: string; leaderboard: ResultItem[] }>(
        `/results/assessment/${assessmentId}/leaderboard?limit=${limit}`
      ),
    enabled: !!assessmentId,
  });
}

export function usePublishResult() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, action }: { id: string; action: "publish" | "unpublish" }) =>
      apiFetch(`/results/${id}/${action}`, { method: "PATCH" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["assessment-results"] }),
  });
}

/* ---------- Payments ---------- */

export function useMyPayments(filters: Record<string, string | undefined>) {
  return useQuery({
    queryKey: ["my-payments", filters],
    queryFn: () =>
      apiFetch<{ payments: Payment[]; meta: PaginationMeta }>(
        `/payments/my-payments${qs(filters)}`
      ),
  });
}

export function usePayment(id: string) {
  return useQuery({
    queryKey: ["payment", id],
    queryFn: () => apiFetch<{ payment: Payment }>(`/payments/${id}`),
    enabled: !!id,
  });
}

export function useCreateCheckout() {
  return useMutation({
    mutationFn: (body: { assessmentId: string }) =>
      apiFetch<{ url: string; sessionId: string; payment: Payment; reused?: boolean }>(
        "/payments/create",
        { method: "POST", body }
      ),
  });
}

export function useVerifyPayment(sessionId: string, enabled = true) {
  return useQuery({
    queryKey: ["verify-payment", sessionId],
    queryFn: () =>
      apiFetch<{ payment: Payment; stripeStatus?: string }>(
        `/payments/verify/${sessionId}`
      ),
    enabled: !!sessionId && enabled,
    retry: false,
  });
}

export function useRefundPayment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiFetch(`/payments/${id}/refund`, { method: "POST" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-payments"] }),
  });
}

/* ---------- Admin ---------- */

export function useAdminUsers(filters: Record<string, string | undefined>) {
  return useQuery({
    queryKey: ["admin-users", filters],
    queryFn: () =>
      apiFetch<{ users: AdminUser[]; meta: PaginationMeta }>(`/admin/users${qs(filters)}`),
  });
}

export function useAdminUserSearch(q: string) {
  return useQuery({
    queryKey: ["admin-user-search", q],
    queryFn: () =>
      apiFetch<{ users: AdminUser[] }>(`/admin/users/search?q=${encodeURIComponent(q)}`),
    enabled: q.length >= 2,
  });
}

export function useAdminUpdateUserStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      apiFetch(`/admin/users/${id}/status`, { method: "PATCH", body: { isActive } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-users"] }),
  });
}

export function useAdminUpdateUserRole() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, role }: { id: string; role: string }) =>
      apiFetch(`/admin/users/${id}/role`, { method: "PATCH", body: { role } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-users"] }),
  });
}

export function useDashboardStats() {
  return useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: () => apiFetch<DashboardStats>("/admin/dashboard-stats"),
  });
}

export function useAdminPayments(filters: Record<string, string | undefined>) {
  return useQuery({
    queryKey: ["admin-payments", filters],
    queryFn: () =>
      apiFetch<{ payments: Payment[]; meta: PaginationMeta }>(`/admin/payments${qs(filters)}`),
  });
}

export function useAdminAssessments(filters: Record<string, string | undefined>) {
  return useQuery({
    queryKey: ["admin-assessments", filters],
    queryFn: () =>
      apiFetch<{ assessments: Assessment[]; meta: PaginationMeta }>(
        `/admin/assessments${qs(filters)}`
      ),
  });
}

export function useAuditLogs(filters: Record<string, string | undefined>) {
  return useQuery({
    queryKey: ["audit-logs", filters],
    queryFn: () =>
      apiFetch<{ logs: AuditLog[]; meta: PaginationMeta }>(`/admin/audit-logs${qs(filters)}`),
  });
}
