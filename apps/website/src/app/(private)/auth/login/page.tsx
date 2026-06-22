import type { Metadata } from "next";
import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import { LoginForm } from "../components/LoginForm";

export const metadata: Metadata = {
  title: "Sign in — Autolokate",
  description: "Sign in to Autolokate with a one-time code sent to your phone.",
};

function LoginFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-950">
      <Loader2 className="h-8 w-8 animate-spin text-white/40" aria-hidden />
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<LoginFallback />}>
      <LoginForm />
    </Suspense>
  );
}
