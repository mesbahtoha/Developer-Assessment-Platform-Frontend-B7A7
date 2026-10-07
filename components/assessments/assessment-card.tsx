import Link from "next/link";
import { Clock, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/shared/status-badge";
import { formatCents, truncate } from "@/lib/utils";
import type { Assessment } from "@/lib/types";

export function AssessmentCard({
  assessment,
  href,
}: {
  assessment: Assessment;
  href: string;
}) {
  return (
    <Card className="card-hover flex flex-col">
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-base leading-snug">
            <Link href={href} className="hover:underline">{assessment.title}</Link>
          </CardTitle>
          <StatusBadge status={assessment.status} />
        </div>
        <p className="line-clamp-2 text-sm text-muted-foreground">{truncate(assessment.description, 140)}</p>
      </CardHeader>
      <CardContent className="flex flex-wrap gap-2 text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-1"><Clock className="h-3.5 w-3.5" aria-hidden />{assessment.durationMin} min</span>
        <span className="inline-flex items-center gap-1"><Users className="h-3.5 w-3.5" aria-hidden />{assessment._count?.attempts ?? 0} attempts</span>
        <Badge variant={assessment.price > 0 ? "warning" : "success"}>
          {assessment.price > 0 ? formatCents(assessment.price, assessment.currency) : "Free"}
        </Badge>
        <Badge variant="outline">Pass {assessment.passScorePercent}%</Badge>
      </CardContent>
      <CardFooter className="mt-auto pt-0">
        <Button size="sm" className="w-full" asChild>
          <Link href={href}>View details</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
