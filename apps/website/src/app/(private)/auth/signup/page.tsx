import type { Metadata } from "next";
import { SignupForm } from "../components/SignupForm";

export const metadata: Metadata = {
  title: "Sign up — Autolokate",
  description: "Create your Autolokate account with mobile OTP verification.",
};

export default function SignupPage() {
  return <SignupForm />;
}
