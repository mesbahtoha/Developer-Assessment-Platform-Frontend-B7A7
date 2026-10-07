import { z } from "zod";

/* Mirrors backend Zod rules so frontend validation matches API validation. */

export const loginSchema = z.object({
  email: z.string().email("Enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});
export type LoginInput = z.infer<typeof loginSchema>;

export const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
  email: z.string().email("Enter a valid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(72)
    .regex(/[A-Za-z]/, "Password must contain a letter")
    .regex(/[0-9]/, "Password must contain a number"),
  role: z.enum(["CANDIDATE", "RECRUITER"]).default("CANDIDATE"),
});
export type RegisterInput = z.infer<typeof registerSchema>;

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z
    .string()
    .min(8, "New password must be at least 8 characters")
    .max(72)
    .regex(/[A-Za-z]/, "Password must contain a letter")
    .regex(/[0-9]/, "Password must contain a number"),
});
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;

export const updateAccountSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100).optional(),
  avatarUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
});
export type UpdateAccountInput = z.infer<typeof updateAccountSchema>;

export const candidateProfileSchema = z.object({
  phone: z
    .string()
    .max(20)
    .optional()
    .or(z.literal(""))
    .refine((v) => !v || v.trim().length >= 5, { message: "Phone must be at least 5 characters" }),
  headline: z
    .string()
    .max(150)
    .optional()
    .or(z.literal(""))
    .refine((v) => !v || v.trim().length >= 3, { message: "Headline must be at least 3 characters" }),
  bio: z.string().min(10, "Bio must be at least 10 characters").max(2000).optional().or(z.literal("")),
  skills: z.string().max(300).optional().or(z.literal("")),
  experienceYears: z.coerce.number().int().min(0).max(60).optional(),
  githubUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  linkedinUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  portfolioUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
});
export type CandidateProfileInput = z.infer<typeof candidateProfileSchema>;

export const recruiterProfileSchema = z.object({
  companyName: z.string().min(2, "Company name is required").max(150),
  companyWebsite: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  companyLogoUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  designation: z
    .string()
    .max(100)
    .optional()
    .or(z.literal(""))
    .refine((v) => !v || v.trim().length >= 2, { message: "Designation must be at least 2 characters" }),
});
export type RecruiterProfileInput = z.infer<typeof recruiterProfileSchema>;

export const problemSchema = z
  .object({
    title: z.string().min(3, "Title must be at least 3 characters").max(150),
    type: z.enum(["MCQ", "CODE"]).default("MCQ"),
    difficulty: z.enum(["EASY", "MEDIUM", "HARD"]).default("EASY"),
    prompt: z.string().min(5, "Prompt must be at least 5 characters").max(5000),
    options: z.string().optional(),
    correctAnswer: z.string().min(1, "Answer is required").max(2000),
    points: z.coerce.number().int().min(1).max(100).default(1),
    tags: z.string().optional(),
  })
  .refine(
    (v) => {
      if (v.type !== "MCQ") return true;
      const opts = v.options
        ? v.options.split(",").map((s) => s.trim()).filter(Boolean)
        : [];
      return opts.length >= 2 && opts.includes(v.correctAnswer.trim());
    },
    { message: "MCQ needs ≥2 comma-separated options including the correct answer", path: ["options"] }
  );
export type ProblemInput = z.infer<typeof problemSchema>;

export const assessmentSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters").max(150),
  description: z.string().min(5, "Description must be at least 5 characters").max(5000),
  durationMin: z.coerce.number().int().min(5).max(600).default(60),
  price: z.coerce.number().int().min(0).default(0),
  passScorePercent: z.coerce.number().int().min(1).max(100).default(50),
});
export type AssessmentInput = z.infer<typeof assessmentSchema>;

export const inviteSchema = z.object({
  assessmentId: z.string().min(1, "Assessment is required"),
  candidateEmail: z.string().email("Enter a valid candidate email"),
});
export type InviteInput = z.infer<typeof inviteSchema>;

export const evaluateSchema = z.object({
  score: z.coerce.number().int().min(0, "Score cannot be negative"),
  feedback: z.string().max(1000).optional().or(z.literal("")),
});
export type EvaluateInput = z.infer<typeof evaluateSchema>;

export const contactSchema = z.object({
  name: z.string().min(2, "Name is required").max(100),
  email: z.string().email("Enter a valid email address"),
  subject: z.string().min(3, "Subject is required").max(150),
  message: z.string().min(10, "Message must be at least 10 characters").max(2000),
});
export type ContactInput = z.infer<typeof contactSchema>;
