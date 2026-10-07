import { Badge } from "@/components/ui/badge";

const MAP: Record<string, "default" | "secondary" | "destructive" | "outline" | "success" | "warning" | "info"> = {
  PUBLISHED: "success",
  DRAFT: "secondary",
  CLOSED: "warning",
  ARCHIVED: "outline",
  IN_PROGRESS: "info",
  SUBMITTED: "warning",
  EVALUATED: "success",
  EXPIRED: "destructive",
  PENDING: "warning",
  ACCEPTED: "success",
  CANCELLED: "destructive",
  PAID: "success",
  PROCESSING: "info",
  FAILED: "destructive",
  REFUNDED: "secondary",
  EASY: "success",
  MEDIUM: "warning",
  HARD: "destructive",
  MCQ: "info",
  CODE: "secondary",
  AUTO: "info",
  MANUAL: "secondary",
};

export function StatusBadge({ status }: { status: string }) {
  return <Badge variant={MAP[status] ?? "outline"}>{status.replace(/_/g, " ")}</Badge>;
}
