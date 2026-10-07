"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Loader2, Lock, ShieldCheck, Briefcase, GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { apiFetch } from "@/lib/api-client";
import { DEMO_ACCOUNTS, dashboardPathFor, useAuthStore } from "@/lib/auth-store";
import { loginSchema, type LoginInput } from "@/lib/validations";
import type { AuthPayload, Role } from "@/lib/types";

const DEMO_ICONS: Record<Role, typeof ShieldCheck> = {
  ADMIN: ShieldCheck,
  RECRUITER: Briefcase,
  CANDIDATE: GraduationCap,
};

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next");
  const [demoRole, setDemoRole] = useState<Role | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({ resolver: zodResolver(loginSchema) });

  const succeed = (payload: AuthPayload) => {
    useAuthStore.getState().setSession(payload);
    toast.success(`Welcome back, ${payload.user.name}!`);
    router.push(next ?? dashboardPathFor(payload.user.role));
    router.refresh();
  };

  const onSubmit = async (data: LoginInput) => {
    try {
      const payload = await apiFetch<AuthPayload>("/auth/login", {
        method: "POST",
        body: data,
        auth: false,
      });
      succeed(payload);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Login failed");
    }
  };

  const demoLogin = async (role: Role, email: string, password: string) => {
    setDemoRole(role);
    try {
      const payload = await apiFetch<AuthPayload>("/auth/login", {
        method: "POST",
        body: { email, password },
        auth: false,
      });
      succeed(payload);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Demo login failed");
      setDemoRole(null);
    }
  };

  return (
    <div className="w-full max-w-2xl">
      <div className="mb-6 text-center">
        <h1 className="text-3xl font-black tracking-tight">Welcome back 👋</h1>
        <p className="mt-1 text-sm text-muted-foreground">Log in to your account</p>
      </div>

      <Card>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" autoComplete="email" placeholder="you@example.com" {...register("email")} />
              {errors.email ? <p className="text-xs text-destructive">{errors.email.message}</p> : null}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" autoComplete="current-password" placeholder="••••••••" {...register("password")} />
              {errors.password ? <p className="text-xs text-destructive">{errors.password.message}</p> : null}
            </div>
            <Button type="submit" disabled={isSubmitting} className="w-full">
              {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : <Lock className="h-4 w-4" aria-hidden />}
              {isSubmitting ? "Logging in…" : "Login"}
            </Button>
          </form>
          <p className="mt-4 text-center text-sm text-muted-foreground">
            No account?{" "}
            <Link href="/register" className="font-medium text-primary hover:underline">
              Register
            </Link>
          </p>
        </CardContent>
      </Card>

      <div className="my-6 flex items-center gap-3 text-xs text-muted-foreground">
        <span className="h-px flex-1 bg-border" />
        OR
        <span className="h-px flex-1 bg-border" />
      </div>

      <Card>
        <CardHeader className="text-center">
          <CardTitle>🚀 Quick Demo Login</CardTitle>
          <CardDescription>One click signs you in and routes you to the role dashboard.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-3">
            {DEMO_ACCOUNTS.map((d) => {
              const Icon = DEMO_ICONS[d.role];
              const busy = demoRole === d.role;
              return (
                <div key={d.role} className="flex flex-col items-center gap-2 rounded-xl border p-4 text-center">
                  <Icon className="h-6 w-6 text-primary" aria-hidden />
                  <p className="text-sm font-semibold">{d.label}</p>
                  <p className="break-all text-[11px] text-muted-foreground">{d.email}</p>
                  <Button
                    size="sm"
                    className="w-full"
                    disabled={demoRole !== null}
                    onClick={() => demoLogin(d.role, d.email, d.password)}
                  >
                    {busy ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : null}
                    {busy ? "Signing in…" : "Demo Login"}
                  </Button>
                </div>
              );
            })}
          </div>
          <p className="mt-4 text-center text-xs text-muted-foreground">
            Demo passwords: Admin@1234 · Recruiter@1234 · Candidate@1234
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
