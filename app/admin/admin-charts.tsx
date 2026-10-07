"use client";

import { Bar, BarChart, CartesianGrid, Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { StatCard } from "@/components/shared/stat-card";
import { PageHeader } from "@/components/shared/page-header";
import { useDashboardStats } from "@/lib/queries";
import { formatCents } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const COLORS = ["#2563eb", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];

export function AdminCharts() {
  const { data, isLoading, isError, refetch } = useDashboardStats();

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-28 w-full" />)}
        </div>
        <Skeleton className="h-72 w-full" />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="rounded-xl border p-8 text-center">
        <p className="font-medium">Could not load platform statistics.</p>
        <Button className="mt-3" variant="outline" onClick={() => refetch()}>Retry</Button>
      </div>
    );
  }

  const roleData = Object.entries(data.users.byRole ?? {}).map(([name, value]) => ({ name, value }));
  const attemptData = Object.entries(data.attempts.byStatus ?? {}).map(([name, value]) => ({ name, value }));
  const paymentData = Object.entries(data.payments.byStatus ?? {}).map(([name, value]) => ({ name, value }));

  return (
    <div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Users" value={data.users.total} hint={`${roleData.map((r) => `${r.name}: ${r.value}`).join(" · ")}`} />
        <StatCard title="Assessments" value={data.assessments.total} hint={`${data.assessments.published} published`} />
        <StatCard title="Attempts" value={data.attempts.total} hint={`${data.invitations.total} invitations sent`} />
        <StatCard title="Net revenue" value={formatCents(data.payments.netRevenueCents)} hint={`Gross ${formatCents(data.payments.grossAmountCents)}`} />
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Users by role</CardTitle></CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={roleData} dataKey="value" nameKey="name" outerRadius={90} label>
                  {roleData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Attempts by status</CardTitle></CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={attemptData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" fontSize={11} />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="value" fill="#2563eb" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Payments by status</CardTitle></CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={paymentData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" fontSize={11} />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="value" fill="#10b981" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Results overview</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p>Total results: <strong>{data.results.total}</strong></p>
            <p>Passed: <strong>{data.results.passed}</strong> · Failed: <strong>{data.results.failed}</strong></p>
            <p>Pass rate: <strong>{data.results.passRate}%</strong></p>
            <div className="h-3 overflow-hidden rounded bg-muted">
              <div className="h-full bg-emerald-500" style={{ width: `${Math.min(100, data.results.passRate)}%` }} />
            </div>
            <p className="text-muted-foreground">Problems in bank: {data.problems.total}</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
