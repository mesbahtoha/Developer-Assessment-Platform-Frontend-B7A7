import type { Metadata } from "next";
import { ContactForm } from "./contact-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, MapPin } from "lucide-react";

export const metadata: Metadata = {
  title: "Contact",
  description: "Get in touch with the AssessDev team.",
};

export default function ContactPage() {
  return (
    <div className="container grid gap-8 py-10 lg:grid-cols-2">
      <div>
        <p className="text-sm font-medium uppercase tracking-widest text-primary">Contact</p>
        <h1 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">Talk to the team</h1>
        <p className="mt-4 max-w-md text-muted-foreground">
          Questions about assessments, Stripe test payments, or role access? Send a message and we will
          get back to you.
        </p>
        <div className="mt-6 space-y-3">
          <Card>
            <CardHeader className="flex flex-row items-center gap-3 space-y-0">
              <Mail className="h-5 w-5 text-primary" aria-hidden />
              <CardTitle className="text-base">support@assessdev.example.com</CardTitle>
            </CardHeader>
            <CardContent><p className="text-sm text-muted-foreground">For evaluation support, include your role and the assessment title.</p></CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center gap-3 space-y-0">
              <MapPin className="h-5 w-5 text-primary" aria-hidden />
              <CardTitle className="text-base">Remote-first</CardTitle>
            </CardHeader>
            <CardContent><p className="text-sm text-muted-foreground">The demo API runs on Vercel serverless with a pooled Postgres database.</p></CardContent>
          </Card>
        </div>
      </div>
      <ContactForm />
    </div>
  );
}
