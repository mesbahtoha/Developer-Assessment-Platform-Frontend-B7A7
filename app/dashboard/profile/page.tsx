"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PageHeader } from "@/components/shared/page-header";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/use-auth";
import { useAccount, useChangePassword, useMyProfile, useUpdateAccount, useUpdateProfile } from "@/lib/queries";
import { stripEmpty } from "@/lib/utils";
import { candidateProfileSchema, changePasswordSchema, updateAccountSchema, type CandidateProfileInput, type ChangePasswordInput, type UpdateAccountInput } from "@/lib/validations";
import type { CandidateProfile } from "@/lib/types";

export default function CandidateProfilePage() {
  const { user } = useAuth();
  const { data: accountData, isLoading: accountLoading } = useAccount();
  const { data: profileData, isLoading: profileLoading } = useMyProfile();
  const updateAccount = useUpdateAccount();
  const updateProfile = useUpdateProfile();
  const changePassword = useChangePassword();

  const accountForm = useForm<UpdateAccountInput>({
    resolver: zodResolver(updateAccountSchema),
    defaultValues: { name: "", avatarUrl: "" },
  });
  const profileForm = useForm<CandidateProfileInput>({ resolver: zodResolver(candidateProfileSchema) });
  const passwordForm = useForm<ChangePasswordInput>({ resolver: zodResolver(changePasswordSchema) });

  useEffect(() => {
    const u = accountData?.user ?? user;
    if (u) {
      accountForm.reset({ name: u.name, avatarUrl: u.avatarUrl ?? "" });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accountData, user]);

  useEffect(() => {
    const p = profileData?.profile as CandidateProfile | null;
    if (p) {
      profileForm.reset({
        phone: p.phone ?? "",
        headline: p.headline ?? "",
        bio: p.bio ?? "",
        skills: (p.skills ?? []).join(", "),
        experienceYears: p.experienceYears ?? undefined,
        githubUrl: p.githubUrl ?? "",
        linkedinUrl: p.linkedinUrl ?? "",
        portfolioUrl: p.portfolioUrl ?? "",
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profileData]);

  if (accountLoading || profileLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-9 w-64" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  const onAccount = async (v: UpdateAccountInput) => {
    try {
      await updateAccount.mutateAsync({ name: v.name, avatarUrl: v.avatarUrl || null });
      toast.success("Account updated.");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Update failed");
    }
  };

  const onProfile = async (v: CandidateProfileInput) => {
    try {
      const skills = v.skills ? v.skills.split(",").map((s) => s.trim()).filter(Boolean).slice(0, 30) : [];
      await updateProfile.mutateAsync(
        stripEmpty({
          ...v,
          skills: skills.length > 0 ? skills : undefined,
          experienceYears: v.experienceYears === undefined || Number.isNaN(v.experienceYears) ? undefined : v.experienceYears,
        })
      );
      toast.success("Developer profile updated.");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Update failed");
    }
  };

  const onPassword = async (v: ChangePasswordInput) => {
    try {
      await changePassword.mutateAsync(v);
      toast.success("Password changed — all sessions were revoked except this one. Please log in again if asked.");
      passwordForm.reset();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Password change failed");
    }
  };

  return (
    <div>
      <PageHeader title="Profile & settings" description="Your account, developer profile and password." />

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Account</CardTitle>
            <CardDescription>{accountData?.user.email}</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={accountForm.handleSubmit(onAccount)} className="space-y-4" noValidate>
              <div className="space-y-1.5">
                <Label htmlFor="name">Full name</Label>
                <Input id="name" {...accountForm.register("name")} />
                {accountForm.formState.errors.name ? <p className="text-xs text-destructive">{accountForm.formState.errors.name.message}</p> : null}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="avatarUrl">Avatar URL</Label>
                <Input id="avatarUrl" placeholder="https://…" {...accountForm.register("avatarUrl")} />
                {accountForm.formState.errors.avatarUrl ? <p className="text-xs text-destructive">{accountForm.formState.errors.avatarUrl.message}</p> : null}
              </div>
              <Button type="submit" disabled={updateAccount.isPending}>
                {updateAccount.isPending ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : null} Save account
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Change password</CardTitle>
            <CardDescription>Changing it revokes all refresh sessions.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={passwordForm.handleSubmit(onPassword)} className="space-y-4" noValidate>
              <div className="space-y-1.5">
                <Label htmlFor="currentPassword">Current password</Label>
                <Input id="currentPassword" type="password" {...passwordForm.register("currentPassword")} />
                {passwordForm.formState.errors.currentPassword ? <p className="text-xs text-destructive">{passwordForm.formState.errors.currentPassword.message}</p> : null}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="newPassword">New password</Label>
                <Input id="newPassword" type="password" {...passwordForm.register("newPassword")} />
                {passwordForm.formState.errors.newPassword ? <p className="text-xs text-destructive">{passwordForm.formState.errors.newPassword.message}</p> : null}
              </div>
              <Button type="submit" disabled={changePassword.isPending}>
                {changePassword.isPending ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : null} Change password
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-4">
        <CardHeader>
          <CardTitle>Developer profile</CardTitle>
          <CardDescription>Skills, experience and links shown to recruiters reviewing your attempts.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={profileForm.handleSubmit(onProfile)} className="grid gap-4 sm:grid-cols-2" noValidate>
            <div className="space-y-1.5">
              <Label htmlFor="headline">Headline</Label>
              <Input id="headline" placeholder="Junior Backend Developer" {...profileForm.register("headline")} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" placeholder="+880…" {...profileForm.register("phone")} />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="bio">Bio (min 10 chars)</Label>
              <Textarea id="bio" rows={3} {...profileForm.register("bio")} />
              {profileForm.formState.errors.bio ? <p className="text-xs text-destructive">{profileForm.formState.errors.bio.message}</p> : null}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="skills">Skills (comma separated)</Label>
              <Input id="skills" placeholder="JavaScript, Node.js, PostgreSQL" {...profileForm.register("skills")} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="experienceYears">Experience (years)</Label>
              <Input id="experienceYears" type="number" min={0} max={60} {...profileForm.register("experienceYears")} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="githubUrl">GitHub URL</Label>
              <Input id="githubUrl" placeholder="https://github.com/…" {...profileForm.register("githubUrl")} />
              {profileForm.formState.errors.githubUrl ? <p className="text-xs text-destructive">{profileForm.formState.errors.githubUrl.message}</p> : null}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="linkedinUrl">LinkedIn URL</Label>
              <Input id="linkedinUrl" placeholder="https://linkedin.com/in/…" {...profileForm.register("linkedinUrl")} />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="portfolioUrl">Portfolio URL</Label>
              <Input id="portfolioUrl" placeholder="https://…" {...profileForm.register("portfolioUrl")} />
            </div>
            <div className="sm:col-span-2">
              <Button type="submit" disabled={updateProfile.isPending}>
                {updateProfile.isPending ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : null} Save profile
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
