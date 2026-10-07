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
import { PageHeader } from "@/components/shared/page-header";
import { Skeleton } from "@/components/ui/skeleton";
import { useAccount, useChangePassword, useMyProfile, useUpdateAccount, useUpdateProfile } from "@/lib/queries";
import { changePasswordSchema, recruiterProfileSchema, updateAccountSchema, type ChangePasswordInput, type RecruiterProfileInput, type UpdateAccountInput } from "@/lib/validations";
import type { RecruiterProfile } from "@/lib/types";

export default function RecruiterProfilePage() {
  const { data: accountData, isLoading: accountLoading } = useAccount();
  const { data: profileData, isLoading: profileLoading } = useMyProfile();
  const updateAccount = useUpdateAccount();
  const updateProfile = useUpdateProfile();
  const changePassword = useChangePassword();

  const accountForm = useForm<UpdateAccountInput>({ resolver: zodResolver(updateAccountSchema) });
  const companyForm = useForm<RecruiterProfileInput>({ resolver: zodResolver(recruiterProfileSchema) });
  const passwordForm = useForm<ChangePasswordInput>({ resolver: zodResolver(changePasswordSchema) });

  useEffect(() => {
    if (accountData?.user) {
      accountForm.reset({ name: accountData.user.name, avatarUrl: accountData.user.avatarUrl ?? "" });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accountData]);

  useEffect(() => {
    const p = profileData?.profile as RecruiterProfile | null;
    if (p) {
      companyForm.reset({
        companyName: p.companyName,
        companyWebsite: p.companyWebsite ?? "",
        companyLogoUrl: p.companyLogoUrl ?? "",
        designation: p.designation ?? "",
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

  return (
    <div>
      <PageHeader title="Company & settings" description="Your account, company profile and password." />
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Account</CardTitle>
            <CardDescription>{accountData?.user.email}</CardDescription>
          </CardHeader>
          <CardContent>
            <form
              onSubmit={accountForm.handleSubmit(async (v) => {
                try {
                  await updateAccount.mutateAsync({ name: v.name, avatarUrl: v.avatarUrl || null });
                  toast.success("Account updated.");
                } catch (e) {
                  toast.error(e instanceof Error ? e.message : "Update failed");
                }
              })}
              className="space-y-4"
              noValidate
            >
              <div className="space-y-1.5">
                <Label htmlFor="name">Full name</Label>
                <Input id="name" {...accountForm.register("name")} />
                {accountForm.formState.errors.name ? <p className="text-xs text-destructive">{accountForm.formState.errors.name.message}</p> : null}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="avatarUrl">Avatar URL</Label>
                <Input id="avatarUrl" {...accountForm.register("avatarUrl")} />
              </div>
              <Button type="submit" disabled={updateAccount.isPending}>
                {updateAccount.isPending ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : null} Save account
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Change password</CardTitle></CardHeader>
          <CardContent>
            <form
              onSubmit={passwordForm.handleSubmit(async (v) => {
                try {
                  await changePassword.mutateAsync(v);
                  toast.success("Password changed.");
                  passwordForm.reset();
                } catch (e) {
                  toast.error(e instanceof Error ? e.message : "Password change failed");
                }
              })}
              className="space-y-4"
              noValidate
            >
              <div className="space-y-1.5">
                <Label htmlFor="currentPassword">Current password</Label>
                <Input id="currentPassword" type="password" {...passwordForm.register("currentPassword")} />
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
          <CardTitle>Company profile</CardTitle>
          <CardDescription>Shown on assessments you own.</CardDescription>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={companyForm.handleSubmit(async (v) => {
              try {
                await updateProfile.mutateAsync(v);
                toast.success("Company profile updated.");
              } catch (e) {
                toast.error(e instanceof Error ? e.message : "Update failed");
              }
            })}
            className="grid gap-4 sm:grid-cols-2"
            noValidate
          >
            <div className="space-y-1.5">
              <Label htmlFor="companyName">Company name *</Label>
              <Input id="companyName" {...companyForm.register("companyName")} placeholder="TechCorp Solutions" />
              {companyForm.formState.errors.companyName ? <p className="text-xs text-destructive">{companyForm.formState.errors.companyName.message}</p> : null}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="designation">Your designation</Label>
              <Input id="designation" {...companyForm.register("designation")} placeholder="Engineering Manager" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="companyWebsite">Company website</Label>
              <Input id="companyWebsite" {...companyForm.register("companyWebsite")} placeholder="https://…" />
              {companyForm.formState.errors.companyWebsite ? <p className="text-xs text-destructive">{companyForm.formState.errors.companyWebsite.message}</p> : null}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="companyLogoUrl">Logo URL</Label>
              <Input id="companyLogoUrl" {...companyForm.register("companyLogoUrl")} placeholder="https://…" />
            </div>
            <div className="sm:col-span-2">
              <Button type="submit" disabled={updateProfile.isPending}>
                {updateProfile.isPending ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : null} Save company
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
