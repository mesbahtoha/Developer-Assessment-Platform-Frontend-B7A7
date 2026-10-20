"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Loader2, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { apiFetch } from "@/lib/api-client";
import { dashboardPathFor, useAuthStore } from "@/lib/auth-store";
import { loginSchema, type LoginInput } from "@/lib/validations";
import type { AuthPayload } from "@/lib/types";

const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? "";

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (opts: { client_id: string; callback: (r: { credential: string }) => void }) => void;
          renderButton: (el: HTMLElement, opts: Record<string, unknown>) => void;
        };
      };
    };
  }
}

function GoogleSignIn({ onSuccess }: { onSuccess: (p: AuthPayload) => void }) {
  const btnRef = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!GOOGLE_CLIENT_ID) return;
    if (document.getElementById("google-gsi")) {
      setReady(true);
      return;
    }
    const s = document.createElement("script");
    s.id = "google-gsi";
    s.src = "https://accounts.google.com/gsi/client";
    s.async = true;
    s.defer = true;
    s.onload = () => setReady(true);
    document.head.appendChild(s);
  }, []);

  useEffect(() => {
    if (!ready || !GOOGLE_CLIENT_ID || !btnRef.current || !window.google) return;
    btnRef.current.innerHTML = "";
    window.google.accounts.id.initialize({
      client_id: GOOGLE_CLIENT_ID,
      callback: async (res) => {
        setBusy(true);
        try {
          const payload = await apiFetch<AuthPayload>("/auth/social-login", {
            method: "POST",
            body: { credential: res.credential },
            auth: false,
          });
          onSuccess(payload);
        } catch (e) {
          toast.error(e instanceof Error ? e.message : "Google sign in failed");
        } finally {
          setBusy(false);
        }
      },
    });
    window.google.accounts.id.renderButton(btnRef.current, {
      theme: "outline",
      size: "large",
      width: 320,
      text: "continue_with",
    });
  }, [ready, onSuccess]);

  if (!GOOGLE_CLIENT_ID) return null;

  return (
    <div className="mt-4">
      <div ref={btnRef} className="flex justify-center" aria-live="polite" />
      {busy ? (
        <p className="mt-2 flex items-center justify-center gap-2 text-xs text-muted-foreground">
          <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden /> Verifying with Google
        </p>
      ) : null}
    </div>
  );
}

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next");
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({ resolver: zodResolver(loginSchema) });

  const succeed = (payload: AuthPayload) => {
    useAuthStore.getState().setSession(payload);
    toast.success(`Welcome back, ${payload.user.name}`);
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
      toast.error(e instanceof Error ? e.message : "Login failed. Check your email and password.");
    }
  };

  return (
    <div className="w-full max-w-md">
      <div className="mb-6 text-center">
        <h1 className="text-3xl font-extrabold tracking-tight">
          Welcome <span className="bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">back</span>
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">Log in to continue to your dashboard</p>
      </div>

      <Card className="card-hover">
        <CardHeader className="text-center">
          <CardTitle>Log in</CardTitle>
          <CardDescription>Use your registered email and password</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" autoComplete="email" placeholder="Enter your email" {...register("email")} />
              {errors.email ? <p className="text-xs text-destructive" role="alert">{errors.email.message}</p> : null}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" autoComplete="current-password" placeholder="Enter your password" {...register("password")} />
              {errors.password ? <p className="text-xs text-destructive" role="alert">{errors.password.message}</p> : null}
            </div>
            <Button type="submit" disabled={isSubmitting} className="min-h-[44px] w-full">
              {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : <Lock className="h-4 w-4" aria-hidden />}
              {isSubmitting ? "Logging in" : "Login"}
            </Button>
          </form>
          <GoogleSignIn onSuccess={succeed} />
          <p className="mt-4 text-center text-sm text-muted-foreground">
            No account?{" "}
            <Link href="/register" className="font-semibold text-indigo-600 hover:underline dark:text-indigo-300">
              Create one
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
