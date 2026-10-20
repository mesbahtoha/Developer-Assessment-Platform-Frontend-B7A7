"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { contactSchema, type ContactInput } from "@/lib/validations";

export function ContactForm() {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ContactInput>({ resolver: zodResolver(contactSchema) });

  const onSubmit = (data: ContactInput) => {
    const subject = encodeURIComponent(`[AssessDev] ${data.subject}`);
    const body = encodeURIComponent(`From: ${data.name} <${data.email}>\n\n${data.message}`);
    window.location.href = `mailto:hello@assessdev.io?subject=${subject}&body=${body}`;
    toast.success("Thanks. Your email client should open with the message ready to send.");
    reset();
  };

  return (
    <Card className="card-hover h-fit">
      <CardHeader>
        <CardTitle>Send a message</CardTitle>
        <CardDescription>All fields are required. We reply within one business day.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="name">Name</Label>
              <Input id="name" autoComplete="name" placeholder="Enter your name" {...register("name")} />
              {errors.name ? <p className="text-xs text-destructive" role="alert">{errors.name.message}</p> : null}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" autoComplete="email" placeholder="Enter your email" {...register("email")} />
              {errors.email ? <p className="text-xs text-destructive" role="alert">{errors.email.message}</p> : null}
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="subject">Subject</Label>
            <Input id="subject" placeholder="How do paid assessments work" {...register("subject")} />
            {errors.subject ? <p className="text-xs text-destructive" role="alert">{errors.subject.message}</p> : null}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="message">Message</Label>
            <Textarea id="message" rows={5} placeholder="Tell us what you need" {...register("message")} />
            {errors.message ? <p className="text-xs text-destructive" role="alert">{errors.message.message}</p> : null}
          </div>
          <Button type="submit" disabled={isSubmitting} className="min-h-[44px] w-full sm:w-auto">
            {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : null}
            {isSubmitting ? "Preparing" : "Send message"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
