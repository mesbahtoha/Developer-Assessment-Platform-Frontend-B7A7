import { CandidateAssessmentView } from "./candidate-assessment-view";

export default function CandidateAssessmentDetailPage({ params }: { params: { id: string } }) {
  return <CandidateAssessmentView id={params.id} />;
}
