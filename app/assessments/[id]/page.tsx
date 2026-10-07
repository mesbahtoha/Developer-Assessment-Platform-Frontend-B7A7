import type { Metadata } from "next";
import { AssessmentDetail } from "./assessment-detail";

export const metadata: Metadata = {
  title: "Assessment details",
  description: "Assessment overview, problems, price and lifecycle status.",
};

export default function AssessmentDetailPage({ params }: { params: { id: string } }) {
  return (
    <div className="container py-10">
      <AssessmentDetail id={params.id} backHref="/assessments" />
    </div>
  );
}
