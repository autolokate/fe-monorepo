'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import { AlertTriangle, ArrowLeft, RefreshCw, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ProcessOverlay } from '@/components/ProcessOverlay';
import { useCurrentUser, useIsAuthenticated } from '@/hooks/auth';
import type { ApiError } from '@/lib/api/error';
import { ProfileForm } from '../ProfileForm';
import { ProfileSkeleton } from '../ProfileSkeleton';

function profileErrorCopy(error: ApiError | null): { title: string; body: string } {
  const status = error?.status ?? 0;
  const code = error?.code;

  if (status === 401 || code === 'unauthorized' || code === 'unauthenticated') {
    return {
      title: 'Please sign in again',
      body: 'Your session expired. Log in to view and update your profile.',
    };
  }
  if (status === 403 || code === 'forbidden') {
    return {
      title: 'Couldn’t open your profile',
      body: 'You don’t have permission to view this page.',
    };
  }
  if (status === 404 || code === 'not_found') {
    return {
      title: 'Couldn’t load your profile',
      body: 'We couldn’t find your account details right now. Please try again in a moment.',
    };
  }
  return {
    title: 'Couldn’t load your profile',
    body: error?.message || 'Please try again in a moment.',
  };
}

/**
 * Client wrapper for `/profile`.
 * Always shows a skeleton while auth hydrates or `/v1/profile` is in flight —
 * never a blank screen — then either the form or a human-readable error.
 */
export function ProfilePageContent() {
  const router = useRouter();
  const authed = useIsAuthenticated();
  const userQuery = useCurrentUser({ enabled: authed === true });
  const [isNavigating, startTransition] = useTransition();
  const [retrying, setRetrying] = useState(false);

  if (authed === false || (authed === true && userQuery.error?.status === 401)) {
    return (
      <div className="relative z-0 mx-auto flex w-full max-w-xl flex-col items-center px-5 py-16 text-center sm:py-24">
        <span className="flex h-14 w-14 items-center justify-center rounded-full border border-primary/25 bg-primary/10 text-primary">
          <User className="h-6 w-6" aria-hidden />
        </span>
        <h1 className="mt-5 font-display text-2xl font-bold tracking-tight text-foreground">
          Sign in to view your profile
        </h1>
        <p className="mt-2.5 max-w-md text-sm leading-relaxed text-muted-foreground">
          Log in with your mobile number to view and update your details.
        </p>
        <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
          <Button
            className="h-11 px-6 font-semibold"
            onClick={() => {
              startTransition(() => {
                router.push('/auth/login?next=/profile');
              });
            }}
          >
            Log in to account
          </Button>
          <Button variant="outline" asChild className="h-11 px-5">
            <Link href="/">
              <ArrowLeft className="mr-1.5 h-4 w-4" aria-hidden />
              Back to home
            </Link>
          </Button>
        </div>
        <ProcessOverlay active={isNavigating} label="Opening sign in…" />
      </div>
    );
  }

  if (authed === true && userQuery.isError) {
    const copy = profileErrorCopy(userQuery.error);
    return (
      <div className="relative z-0 mx-auto flex w-full max-w-xl flex-col items-center px-5 py-16 text-center sm:py-20">
        <span className="flex h-12 w-12 items-center justify-center rounded-full border border-rose-500/30 bg-rose-500/10 text-rose-500">
          <AlertTriangle className="h-5 w-5" aria-hidden />
        </span>
        <h1 className="mt-5 font-display text-xl font-bold text-foreground">{copy.title}</h1>
        <p className="mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">{copy.body}</p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <Button
            className="h-10"
            disabled={retrying || userQuery.isFetching}
            onClick={() => {
              setRetrying(true);
              void userQuery.refetch().finally(() => {
                setRetrying(false);
              });
            }}
          >
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
        <ProcessOverlay active={retrying || userQuery.isFetching} label="Loading your profile…" />
      </div>
    );
  }

  // Auth hydrating (`null`) or profile fetch in flight — keep the skeleton up.
  if (authed !== true || !userQuery.data) {
    return (
      <>
        <ProfileSkeleton />
        <ProcessOverlay
          active={authed === true && userQuery.isFetching}
          label="Loading your profile…"
        />
      </>
    );
  }

  return <ProfileForm user={userQuery.data} onSaved={() => void userQuery.refetch()} />;
}
