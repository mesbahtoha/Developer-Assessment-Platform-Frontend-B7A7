import type { Metadata } from "next";
import { RegisterForm } from "./register-form";

export const metadata: Metadata = {
  title: "Register",
  description: "Create a candidate or recruiter account on AssessDev.",
};

export default function RegisterPage() {
  return (
    <div className="container flex justify-center py-10">
      <RegisterForm />
    </div>
  );
}
