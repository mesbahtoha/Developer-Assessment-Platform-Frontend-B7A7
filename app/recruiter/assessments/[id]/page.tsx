import { ManageAssessment } from "./manage-assessment";

export default function RecruiterAssessmentManagePage({ params }: { params: { id: string } }) {
  return <ManageAssessment id={params.id} />;
}
