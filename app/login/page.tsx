import type { Metadata } from "next";
import { Suspense } from "react";
import { LoginForm } from "./login-form";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata: Metadata = {
  title: "Log in",
  description: "Log in to AssessDev to access your candidate, recruiter or admin dashboard.",
};

export default function LoginPage() {
  return (
    <div className="container flex justify-center py-10">
      <Suspense fallback={<Skeleton className="h-[560px] w-full max-w-2xl" />}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
