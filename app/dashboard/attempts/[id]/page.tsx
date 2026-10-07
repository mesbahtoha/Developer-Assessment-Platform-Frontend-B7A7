import { ExamRunner } from "./exam-runner";

export default function AttemptDetailPage({ params }: { params: { id: string } }) {
  return <ExamRunner attemptId={params.id} />;
}
