export const SITE = {
  name: "AssessDev",
  tagline: "Hire developers with confidence",
  description:
    "AssessDev is a developer assessment platform where recruiters build proctored-style coding assessments, invite candidates, run timed attempts, and evaluate results — with Stripe-powered paid assessments.",
};

export const PUBLIC_NAV = [
  { href: "/", label: "Home" },
  { href: "/assessments", label: "Assessments" },
  { href: "/services", label: "Services" },
  { href: "/pricing", label: "Pricing" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export const CANDIDATE_NAV = [
  { href: "/dashboard", label: "Overview", icon: "layout-dashboard" },
  { href: "/dashboard/assessments", label: "Assessments", icon: "file-text" },
  { href: "/dashboard/invitations", label: "Invitations", icon: "mail" },
  { href: "/dashboard/attempts", label: "My Attempts", icon: "timer" },
  { href: "/dashboard/results", label: "Results", icon: "award" },
  { href: "/dashboard/payments", label: "Payments", icon: "credit-card" },
  { href: "/dashboard/profile", label: "Profile", icon: "user" },
];

export const RECRUITER_NAV = [
  { href: "/recruiter", label: "Overview", icon: "layout-dashboard" },
  { href: "/recruiter/assessments", label: "Assessments", icon: "file-text" },
  { href: "/recruiter/problems", label: "Problem Bank", icon: "database" },
  { href: "/recruiter/invitations", label: "Invitations", icon: "mail" },
  { href: "/recruiter/evaluation", label: "Evaluation", icon: "check-square" },
  { href: "/recruiter/results", label: "Results", icon: "award" },
  { href: "/recruiter/profile", label: "Company", icon: "building" },
];

export const ADMIN_NAV = [
  { href: "/admin", label: "Overview", icon: "layout-dashboard" },
  { href: "/admin/users", label: "Users", icon: "users" },
  { href: "/admin/assessments", label: "Assessments", icon: "file-text" },
  { href: "/admin/payments", label: "Payments", icon: "credit-card" },
  { href: "/admin/audit-logs", label: "Audit Logs", icon: "scroll-text" },
];
