"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { apiFetch } from "@/lib/api-client";
import { dashboardPathFor, useAuthStore } from "@/lib/auth-store";
import { registerSchema, type RegisterInput } from "@/lib/validations";
import type { AuthPayload } from "@/lib/types";

export function RegisterForm() {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: { role: "CANDIDATE" },
  });
  const role = watch("role");

  const onSubmit = async (data: RegisterInput) => {
    try {
      const payload = await apiFetch<AuthPayload>("/auth/register", {
        method: "POST",
        body: data,
        auth: false,
      });
      useAuthStore.getState().setSession(payload);
      toast.success(`Account created. Welcome, ${payload.user.name}`);
      router.push(dashboardPathFor(payload.user.role));
      router.refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Registration failed. Try a different email.");
    }
  };

  return (
    <Card className="card-hover w-full max-w-md">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-extrabold tracking-tight">
          Create your <span className="bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">account</span>
        </CardTitle>
        <CardDescription>Join as a candidate or a recruiter</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <div className="space-y-1.5">
            <Label htmlFor="name">Full name</Label>
            <Input id="name" autoComplete="name" placeholder="Enter your full name" {...register("name")} />
            {errors.name ? <p className="text-xs text-destructive" role="alert">{errors.name.message}</p> : null}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" autoComplete="email" placeholder="Enter your email" {...register("email")} />
            {errors.email ? <p className="text-xs text-destructive" role="alert">{errors.email.message}</p> : null}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" autoComplete="new-password" placeholder="Minimum 8 characters with a letter and a number" {...register("password")} />
            {errors.password ? <p className="text-xs text-destructive" role="alert">{errors.password.message}</p> : null}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="role">I am joining as</Label>
            <Select value={role} onValueChange={(v) => setValue("role", v as "CANDIDATE" | "RECRUITER")}>
              <SelectTrigger id="role"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="CANDIDATE">Candidate: take assessments</SelectItem>
                <SelectItem value="RECRUITER">Recruiter: create assessments</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button type="submit" disabled={isSubmitting} className="min-h-[44px] w-full">
            {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : null}
            {isSubmitting ? "Creating account" : "Create account"}
          </Button>
        </form>
        <p className="mt-4 text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link href="/login" className="font-semibold text-indigo-600 hover:underline dark:text-indigo-300">Log in</Link>
        </p>
      </CardContent>
    </Card>
  );
}
