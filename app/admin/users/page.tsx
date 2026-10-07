"use client";

import { Suspense } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { Pagination } from "@/components/shared/pagination";
import { SearchInput } from "@/components/shared/search-input";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusBadge } from "@/components/shared/status-badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useURLFilters } from "@/hooks/use-url-filters";
import { useAdminUpdateUserRole, useAdminUpdateUserStatus, useAdminUsers } from "@/lib/queries";
import { formatDate } from "@/lib/utils";

function ListInner() {
  const { filters, setFilters, setPage } = useURLFilters({ page: "1", search: "", role: "" });
  const { data, isLoading, isError, refetch } = useAdminUsers({
    page: filters.page,
    limit: "10",
    search: filters.search || undefined,
    role: filters.role || undefined,
  });
  const setStatus = useAdminUpdateUserStatus();
  const setRole = useAdminUpdateUserRole();
  const users = data?.users ?? [];

  const toggleActive = async (id: string, isDeleted: boolean | undefined, name: string) => {
    try {
      await setStatus.mutateAsync({ id, isActive: !!isDeleted });
      toast.success(isDeleted ? `${name} reactivated.` : `${name} deactivated.`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Status change failed");
    }
  };

  const changeRole = async (id: string, role: string, name: string) => {
    try {
      await setRole.mutateAsync({ id, role });
      toast.success(`${name} is now ${role}.`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Role change failed");
    }
  };

  return (
    <div>
      <div className="flex flex-col gap-3 sm:flex-row">
        <SearchInput className="flex-1" value={filters.search} onChange={(v) => setFilters({ search: v })} placeholder="Search name or email…" />
        <Select value={filters.role || "all"} onValueChange={(v) => setFilters({ role: v === "all" ? "" : v })}>
          <SelectTrigger className="w-full sm:w-44"><SelectValue placeholder="Role" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All roles</SelectItem>
            <SelectItem value="CANDIDATE">Candidate</SelectItem>
            <SelectItem value="RECRUITER">Recruiter</SelectItem>
            <SelectItem value="ADMIN">Admin</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <Skeleton className="mt-4 h-72 w-full" />
      ) : isError ? (
        <div className="mt-4 rounded-xl border p-8 text-center">
          <p className="font-medium">Could not load users.</p>
          <Button className="mt-3" variant="outline" onClick={() => refetch()}>Retry</Button>
        </div>
      ) : users.length === 0 ? (
        <div className="mt-4"><EmptyState title="No users found" hint="Try a different search or role filter." /></div>
      ) : (
        <>
          <div className="mt-4 hidden md:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((u) => (
                  <TableRow key={u.id}>
                    <TableCell>
                      <p className="font-medium">{u.name}</p>
                      <p className="text-xs text-muted-foreground">{u.email}</p>
                    </TableCell>
                    <TableCell>
                      <select
                        value={u.role}
                        onChange={(e) => changeRole(u.id, e.target.value, u.name)}
                        className="h-8 rounded-md border border-input bg-background px-2 text-xs"
                        aria-label={`Role for ${u.name}`}
                      >
                        <option value="CANDIDATE">CANDIDATE</option>
                        <option value="RECRUITER">RECRUITER</option>
                        <option value="ADMIN">ADMIN</option>
                      </select>
                    </TableCell>
                    <TableCell>
                      {u.isDeleted ? <StatusBadge status="CANCELLED" /> : <StatusBadge status="ACCEPTED" />}
                      <span className="ml-1 text-xs text-muted-foreground">{u.isDeleted ? "banned" : "active"}</span>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{formatDate(u.createdAt)}</TableCell>
                    <TableCell className="text-right">
                      <Button size="sm" variant="outline" onClick={() => toggleActive(u.id, u.isDeleted, u.name)} disabled={setStatus.isPending}>
                        {(setStatus.isPending) ? <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden /> : null}
                        {u.isDeleted ? "Reactivate" : "Ban"}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <div className="mt-4 space-y-2 md:hidden">
            {users.map((u) => (
              <div key={u.id} className="rounded-xl border p-3 text-sm">
                <p className="font-medium">{u.name}</p>
                <p className="text-xs text-muted-foreground">{u.email} · {u.role}</p>
                <div className="mt-2 flex gap-2">
                  <select
                    value={u.role}
                    onChange={(e) => changeRole(u.id, e.target.value, u.name)}
                    className="h-8 flex-1 rounded-md border border-input bg-background px-2 text-xs"
                    aria-label={`Role for ${u.name}`}
                  >
                    <option value="CANDIDATE">CANDIDATE</option>
                    <option value="RECRUITER">RECRUITER</option>
                    <option value="ADMIN">ADMIN</option>
                  </select>
                  <Button size="sm" variant="outline" onClick={() => toggleActive(u.id, u.isDeleted, u.name)}>
                    {u.isDeleted ? "Reactivate" : "Ban"}
                  </Button>
                </div>
              </div>
            ))}
          </div>
          <Pagination page={Number(filters.page) || 1} totalPages={data?.meta.totalPages ?? 0} onChange={setPage} />
        </>
      )}
    </div>
  );
}

export default function AdminUsersPage() {
  return (
    <div>
      <PageHeader title="Users" description="Activate / ban accounts and change roles. Self-changes are blocked by the API." />
      <Suspense fallback={<Skeleton className="h-64 w-full" />}>
        <ListInner />
      </Suspense>
    </div>
  );
}
