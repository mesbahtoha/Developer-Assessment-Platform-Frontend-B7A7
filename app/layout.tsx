import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { QueryProvider } from "@/lib/query-provider";
import { Toaster } from "sonner";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { cn } from "@/lib/utils";
import { SITE_URL } from "@/lib/site";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "AssessDev | Developer Assessment Platform",
    template: "%s | AssessDev",
  },
  description:
    "Recruiters build coding assessments, invite candidates, run timed attempts and evaluate results. Candidates take structured assessments with Stripe powered paid tiers.",
  openGraph: {
    title: "AssessDev | Developer Assessment Platform",
    description:
      "Assessments, invitations, timed attempts, evaluation and Stripe payments in one hiring workflow.",
    type: "website",
    url: SITE_URL,
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn(jakarta.variable, "min-h-screen bg-background font-sans text-foreground")}>
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
