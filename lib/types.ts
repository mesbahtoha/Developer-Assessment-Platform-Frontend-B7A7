/* Central TypeScript contracts mirroring the backend Prisma schema + API envelopes. */

export type Role = "CANDIDATE" | "RECRUITER" | "ADMIN";
export type AssessmentStatus = "DRAFT" | "PUBLISHED" | "CLOSED" | "ARCHIVED";
export type AttemptStatus = "IN_PROGRESS" | "SUBMITTED" | "EVALUATED" | "EXPIRED";
export type SubmissionStatus = "PENDING" | "SUBMITTED" | "EVALUATED";
export type InvitationStatus = "PENDING" | "ACCEPTED" | "EXPIRED" | "CANCELLED";
export type PaymentStatus = "PENDING" | "PROCESSING" | "PAID" | "FAILED" | "REFUNDED";
export type ProblemType = "MCQ" | "CODE";
export type Difficulty = "EASY" | "MEDIUM" | "HARD";
export type EvaluationMethod = "AUTO" | "MANUAL";

/** Global success envelope returned by every backend endpoint. */
export interface ApiSuccess<T> {
  success: true;
  message: string;
  data: T;
}

/** Global error envelope. */
export interface ApiFailure {
  success: false;
  message: string;
  errors: Array<{ field?: string; message: string; path?: string }>;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatarUrl?: string | null;
  googleId?: string | null;
  createdAt?: string;
}

export interface AuthPayload {
  user: SessionUser;
  accessToken: string;
  refreshToken: string;
}

export interface CandidateProfile {
  id: string;
  userId: string;
  phone?: string | null;
  headline?: string | null;
  bio?: string | null;
  skills: string[];
  experienceYears?: number | null;
  githubUrl?: string | null;
  linkedinUrl?: string | null;
  portfolioUrl?: string | null;
}

export interface RecruiterProfile {
  id: string;
  userId: string;
  companyName: string;
  companyWebsite?: string | null;
  companyLogoUrl?: string | null;
  designation?: string | null;
}

export interface Problem {
  id: string;
  title: string;
  type: ProblemType;
  difficulty: Difficulty;
  prompt: string;
  options?: string[] | null;
  /** Only present for RECRUITER/ADMIN views. Never exposed to candidates. */
  correctAnswer?: string;
  points: number;
  tags: string[];
  createdById: string;
  createdAt: string;
  updatedAt: string;
}

export interface AssessmentProblemLink {
  id?: string;
  assessmentId: string;
  problemId: string;
  order: number;
  points?: number | null;
  problem?: Problem;
}

export interface Assessment {
  id: string;
  title: string;
  description: string;
  status: AssessmentStatus;
  durationMin: number;
  price: number; // cents; 0 = free
  currency: string;
  passScorePercent: number;
  recruiterId: string;
  recruiter?: Pick<SessionUser, "id" | "name" | "email">;
  problems?: AssessmentProblemLink[];
  _count?: { problems: number; invitations: number; attempts: number; payments: number };
  createdAt: string;
  updatedAt: string;
}

export interface Invitation {
  id: string;
  assessmentId: string;
  candidateId: string;
  invitedById: string;
  status: InvitationStatus;
  token: string;
  expiresAt?: string | null;
  respondedAt?: string | null;
  createdAt: string;
  assessment?: Pick<Assessment, "id" | "title" | "price" | "durationMin" | "status">;
  candidate?: Pick<SessionUser, "id" | "name" | "email">;
  invitedBy?: Pick<SessionUser, "id" | "name" | "email">;
}

export interface AttemptResult {
  score: number;
  totalPoints: number;
  percentage: number;
  isPassed: boolean;
  publishedAt?: string | null;
}

export interface Attempt {
  id: string;
  candidateId: string;
  assessmentId: string;
  status: AttemptStatus;
  startedAt: string;
  deadlineAt?: string | null;
  submittedAt?: string | null;
  assessment?: Pick<Assessment, "id" | "title" | "durationMin" | "price" | "passScorePercent">;
  result?: AttemptResult | null;
  submissions?: Submission[];
  _count?: { submissions: number };
  createdAt: string;
}

export interface Evaluation {
  id: string;
  submissionId: string;
  evaluatedById?: string | null;
  method: EvaluationMethod;
  score: number;
  maxScore: number;
  feedback?: string | null;
  createdAt: string;
}

export interface Submission {
  id: string;
  attemptId: string;
  problemId: string;
  answer?: string | null;
  language?: string | null;
  status: SubmissionStatus;
  pointsAwarded?: number | null;
  evaluatedAt?: string | null;
  createdAt: string;
  problem?: Problem;
  evaluation?: Evaluation | null;
  attempt?: Pick<Attempt, "id" | "candidateId" | "assessmentId" | "status"> & {
    candidate?: Pick<SessionUser, "id" | "name" | "email">;
    assessment?: Pick<Assessment, "id" | "title">;
  };
}

export interface ResultItem {
  id: string;
  attemptId: string;
  score: number;
  totalPoints: number;
  percentage: number;
  isPassed: boolean;
  publishedAt?: string | null;
  isPublished?: boolean;
  createdAt: string;
  attempt?: Attempt & {
    candidate?: Pick<SessionUser, "id" | "name" | "email">;
    assessment?: Pick<Assessment, "id" | "title">;
  };
}

export interface Payment {
  id: string;
  userId: string;
  assessmentId: string;
  amount: number; // cents
  currency: string;
  status: PaymentStatus;
  provider: string;
  stripeSessionId?: string | null;
  stripePaymentIntentId?: string | null;
  paidAt?: string | null;
  refundedAt?: string | null;
  createdAt: string;
  assessment?: Pick<Assessment, "id" | "title" | "price">;
  user?: Pick<SessionUser, "id" | "name" | "email" | "role">;
}

export interface AdminUser extends SessionUser {
  isDeleted?: boolean;
  updatedAt?: string;
}

export interface AuditLog {
  id: string;
  action: string;
  targetType?: string | null;
  targetId?: string | null;
  meta?: Record<string, unknown> | null;
  createdAt: string;
  actor?: Pick<SessionUser, "id" | "name" | "email"> | null;
}

export interface DashboardStats {
  users: { total: number; byRole: Record<string, number>; paidUsers?: number };
  problems: { total: number };
  assessments: { total: number; published: number };
  invitations: { total: number };
  attempts: { total: number; byStatus: Record<string, number> };
  results: { total: number; passed: number; failed: number; passRate: number };
  payments: {
    byStatus: Record<string, number>;
    grossAmountCents: number;
    refundedAmountCents: number;
    netRevenueCents: number;
  };
}

export interface AssessmentReport {
  assessmentId: string;
  attempts: { total: number; byStatus: Record<string, number> };
  results: {
    total: number;
    averagePercentage: number;
    highestPercentage: number;
    lowestPercentage: number;
    passCount: number;
    failCount: number;
    passRate: number;
  };
  perProblem: Array<{
    problemId: string;
    problemTitle: string;
    submissions: number;
    correct: number;
    accuracy: number;
  }>;
  topScorers: ResultItem[];
}

export interface ResultsSummary {
  total: number;
  passed: number;
  failed: number;
  averagePercentage: number;
  bestPercentage: number;
}
