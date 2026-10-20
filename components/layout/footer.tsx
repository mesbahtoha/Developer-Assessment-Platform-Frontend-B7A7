import Link from "next/link";
import { Code2, Mail, MapPin, Github, Linkedin, Twitter } from "lucide-react";
import { SITE } from "@/lib/constants";

export function Footer() {
  return (
    <footer className="border-t bg-muted/30">
      <div className="container grid gap-8 py-12 sm:grid-cols-2 md:grid-cols-4">
        <div className="sm:col-span-2">
          <div className="flex items-center gap-2 font-bold">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-600 to-violet-600 text-white">
              <Code2 className="h-4 w-4" aria-hidden />
            </span>
            <span className="font-extrabold tracking-tight">{SITE.name}</span>
          </div>
          <p className="mt-3 max-w-md text-sm leading-relaxed text-muted-foreground">{SITE.description}</p>
          <div className="mt-4 space-y-1.5 text-sm text-muted-foreground">
            <p className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-indigo-600" aria-hidden />
              <a href="mailto:hello@assessdev.io" className="transition-colors hover:text-foreground">hello@assessdev.io</a>
            </p>
            <p className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-indigo-600" aria-hidden />
              Remote first, serving hiring teams worldwide
            </p>
          </div>
          <div className="mt-4 flex gap-2">
            <a href="https://github.com" target="_blank" rel="noreferrer" aria-label="GitHub" className="flex h-9 w-9 items-center justify-center rounded-lg border transition-all hover:-translate-y-0.5 hover:border-indigo-200 hover:bg-accent">
              <Github className="h-4 w-4" aria-hidden />
            </a>
            <a href="https://linkedin.com" target="_blank" rel="noreferrer" aria-label="LinkedIn" className="flex h-9 w-9 items-center justify-center rounded-lg border transition-all hover:-translate-y-0.5 hover:border-indigo-200 hover:bg-accent">
              <Linkedin className="h-4 w-4" aria-hidden />
            </a>
            <a href="https://x.com" target="_blank" rel="noreferrer" aria-label="X" className="flex h-9 w-9 items-center justify-center rounded-lg border transition-all hover:-translate-y-0.5 hover:border-indigo-200 hover:bg-accent">
              <Twitter className="h-4 w-4" aria-hidden />
            </a>
          </div>
        </div>
        <div>
          <h4 className="mb-3 text-sm font-semibold">Platform</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><Link href="/assessments" className="transition-colors hover:text-foreground">Assessments</Link></li>
            <li><Link href="/services" className="transition-colors hover:text-foreground">Services</Link></li>
            <li><Link href="/pricing" className="transition-colors hover:text-foreground">Pricing</Link></li>
            <li><Link href="/about" className="transition-colors hover:text-foreground">About</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="mb-3 text-sm font-semibold">Account</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><Link href="/login" className="transition-colors hover:text-foreground">Log in</Link></li>
            <li><Link href="/register" className="transition-colors hover:text-foreground">Register</Link></li>
            <li><Link href="/contact" className="transition-colors hover:text-foreground">Contact</Link></li>
            <li><Link href="/pricing" className="transition-colors hover:text-foreground">Paid tiers</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t">
        <div className="container flex flex-col items-center justify-between gap-2 py-4 text-xs text-muted-foreground sm:flex-row">
          <span>© {new Date().getFullYear()} {SITE.name}. All rights reserved.</span>
          <span>Secure checkout with Stripe. No charge until you confirm.</span>
        </div>
      </div>
    </footer>
  );
}
