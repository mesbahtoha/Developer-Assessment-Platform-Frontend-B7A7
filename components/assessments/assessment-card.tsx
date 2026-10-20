import Link from "next/link";
import { Clock, Users, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/shared/status-badge";
import { formatCents, truncate } from "@/lib/utils";
import type { Assessment } from "@/lib/types";

const COVER_GRADIENTS = [
  "from-indigo-600 to-violet-600",
  "from-violet-600 to-indigo-800",
  "from-indigo-500 to-violet-500",
];

function coverFor(id: string): string {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) % 997;
  return COVER_GRADIENTS[h % COVER_GRADIENTS.length];
}

export function AssessmentCard({
  assessment,
  href,
}: {
  assessment: Assessment;
  href: string;
}) {
  return (
    <Card className="card-hover group flex h-full flex-col overflow-hidden">
      <div className={`relative flex h-28 items-end justify-between bg-gradient-to-br ${coverFor(assessment.id)} p-4`} aria-hidden>
        <div className="pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full bg-white/15 blur-2xl" />
        <span className="rounded-full bg-white/20 px-2.5 py-1 text-[11px] font-semibold text-white backdrop-blur">
          {assessment.durationMin} min timed
        </span>
        <StatusBadge status={assessment.status} />
      </div>
      <CardHeader className="flex-1">
        <CardTitle className="line-clamp-2 min-h-[2.6rem] text-base leading-snug">
          <Link href={href} className="transition-colors group-hover:text-indigo-600 dark:group-hover:text-indigo-300">{assessment.title}</Link>
        </CardTitle>
        <p className="line-clamp-2 min-h-[2.5rem] text-sm text-muted-foreground">{truncate(assessment.description, 140)}</p>
      </CardHeader>
      <CardContent className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-1"><Clock className="h-3.5 w-3.5" aria-hidden />{assessment.durationMin} min</span>
        <span className="inline-flex items-center gap-1"><Users className="h-3.5 w-3.5" aria-hidden />{assessment._count?.attempts ?? 0} attempts</span>
        <Badge variant={assessment.price > 0 ? "warning" : "success"}>
          {assessment.price > 0 ? formatCents(assessment.price, assessment.currency) : "Free"}
        </Badge>
        <Badge variant="outline">Pass {assessment.passScorePercent}%</Badge>
      </CardContent>
      <CardFooter className="mt-auto pt-0">
        <Button size="sm" className="group/btn min-h-[40px] w-full" asChild>
          <Link href={href}>View details <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover/btn:translate-x-1" aria-hidden /></Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
