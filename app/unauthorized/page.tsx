import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = { title: "Unauthorized" };

export default function UnauthorizedPage() {
  return (
    <div className="container flex min-h-[50vh] flex-col items-center justify-center gap-3 py-16 text-center">
      <p className="text-sm font-medium uppercase tracking-widest text-destructive">403 · Forbidden</p>
      <h1 className="text-2xl font-bold">You do not have access to this area</h1>
      <p className="max-w-md text-sm text-muted-foreground">
        This section is restricted to a different role. Please use the dashboard matching your account.
      </p>
      <div className="flex gap-3">
        <Button asChild><Link href="/">Go home</Link></Button>
        <Button variant="outline" asChild><Link href="/login">Switch account</Link></Button>
      </div>
    </div>
  );
}
