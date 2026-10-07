import type { Metadata } from "next";
import "./globals.css";
import { QueryProvider } from "@/lib/query-provider";
import { Toaster } from "sonner";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";

export const metadata: Metadata = {
  title: {
    default: "AssessDev — Developer Assessment Platform",
    template: "%s | AssessDev",
  },
  description:
    "Recruiters build coding assessments, invite candidates, run timed attempts and evaluate results. Candidates take proctored-style assessments with Stripe-powered paid tiers.",
  openGraph: {
    title: "AssessDev — Developer Assessment Platform",
    description:
      "Assessments, invitations, timed attempts, evaluation and Stripe payments — end to end.",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-background text-foreground">
        <QueryProvider>
          <Navbar />
          <main className="min-h-[calc(100vh-4rem-12rem)]">{children}</main>
          <Footer />
          <Toaster richColors position="top-right" closeButton />
        </QueryProvider>
      </body>
    </html>
  );
}
