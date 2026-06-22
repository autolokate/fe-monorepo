"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { AlertTriangle, ArrowLeft, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCurrentUser, useIsAuthenticated } from "@/hooks/auth";
import { ProfileForm } from "../ProfileForm";
import { ProfileSkeleton } from "../ProfileSkeleton";

/**
 * Client wrapper for `/profile`. Three-state render:
 *  1. Auth still hydrating → skeleton (no flash).
 *  2. Not authed (either visiting cold or after a logout) → bounce to home.
 *  3. Authed → fetch `/me`, then render the editable form.
 */
export function ProfilePageContent() {
  const router = useRouter();
  const authed = useIsAuthenticated();

  // Only fire /me once the auth state has resolved client-side.
  const userQuery = useCurrentUser({ enabled: authed === true });

  // Send unauthenticated visitors back to the homepage. They can sign in
  // from the header CTA if they want.
  useEffect(() => {
    if (authed === false) {
      router.replace("/");
    }
  }, [authed, router]);

  // Real failure — backend returned an error.
  if (authed === true && userQuery.isError) {
    return (
      <div className="relative z-0 mx-auto flex w-full max-w-6xl flex-col items-center px-5 py-20 text-center">
        <span className="flex h-12 w-12 items-center justify-center rounded-full border border-rose-500/30 bg-rose-500/10 text-rose-500">
          <AlertTriangle className="h-5 w-5" aria-hidden />
        </span>
        <h1 className="mt-5 font-display text-xl font-bold text-foreground">
          Couldn&apos;t load your profile
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          {userQuery.error?.message ?? "Please try again in a moment."}
        </p>
        <div className="mt-6 flex gap-2">
          <Button onClick={() => void userQuery.refetch()} className="h-10">
            <RefreshCw className="h-4 w-4" aria-hidden />
            Try again
          </Button>
          <Button variant="ghost" asChild className="h-10">
            <Link href="/">
              <ArrowLeft className="mr-1 h-4 w-4" aria-hidden />
              Back home
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  // Anything before we actually have `data` — hydration in progress, redirect
  // pending, fetch queued, or fetch in flight — renders the skeleton. This
  // prevents the brief flash where `data === undefined` but `isError === false`
  // (the gap between the effect mounting the request and the request starting).
  if (!userQuery.data) {
    return <ProfileSkeleton />;
  }

  return <ProfileForm user={userQuery.data} onSaved={() => void userQuery.refetch()} />;
}
