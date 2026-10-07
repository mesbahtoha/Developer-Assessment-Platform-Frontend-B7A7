import { AdminCharts } from "./admin-charts";
import { PageHeader } from "@/components/shared/page-header";

export default function AdminOverviewPage() {
  return (
    <div>
      <PageHeader title="Platform overview" description="Cached analytics across users, assessments, attempts, results and Stripe revenue." />
      <AdminCharts />
    </div>
  );
}
