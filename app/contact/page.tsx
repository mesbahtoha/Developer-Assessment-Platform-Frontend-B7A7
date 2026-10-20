import type { Metadata } from "next";
import { ContactForm } from "./contact-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, MapPin, Clock } from "lucide-react";

export const metadata: Metadata = {
  title: "Contact",
  description: "Get in touch with the AssessDev team for sales, support and hiring questions.",
};

export default function ContactPage() {
  return (
    <div className="container grid gap-8 py-10 lg:grid-cols-2 lg:py-14">
      <div className="reveal">
        <p className="text-sm font-semibold uppercase tracking-widest text-indigo-600 dark:text-indigo-300">Contact</p>
        <h1 className="mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl">
          Talk to the <span className="bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">team</span>
        </h1>
        <p className="mt-4 max-w-md leading-relaxed text-muted-foreground">
          Questions about assessments, Stripe payments or role access? Send a message and the team will
          get back within one business day.
        </p>
        <div className="mt-6 space-y-3">
          <Card className="card-hover">
            <CardHeader className="flex flex-row items-center gap-3 space-y-0">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-300">
                <Mail className="h-5 w-5" aria-hidden />
              </span>
              <CardTitle className="text-base">hello@assessdev.io</CardTitle>
            </CardHeader>
            <CardContent><p className="text-sm text-muted-foreground">For support, include your role and the assessment title.</p></CardContent>
          </Card>
          <Card className="card-hover">
            <CardHeader className="flex flex-row items-center gap-3 space-y-0">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-300">
                <MapPin className="h-5 w-5" aria-hidden />
              </span>
              <CardTitle className="text-base">Remote first</CardTitle>
            </CardHeader>
            <CardContent><p className="text-sm text-muted-foreground">Serving hiring teams worldwide with secure cloud infrastructure.</p></CardContent>
          </Card>
          <Card className="card-hover">
            <CardHeader className="flex flex-row items-center gap-3 space-y-0">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-300">
                <Clock className="h-5 w-5" aria-hidden />
              </span>
              <CardTitle className="text-base">Response time</CardTitle>
            </CardHeader>
            <CardContent><p className="text-sm text-muted-foreground">Support replies within 24 hours on business days.</p></CardContent>
          </Card>
        </div>
      </div>
      <ContactForm />
    </div>
  );
}
