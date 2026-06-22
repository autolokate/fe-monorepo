"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { cn } from "@/lib/utils";
import { useLogout } from "@/hooks/auth";
import { AvatarGlyph, avatarMenuItems, type AvatarMenuItem } from "./constants";

interface AvatarMenuProps {
  /** Optional accessibility label — defaults to the user's name/phone when available. */
  label?: string;
  className?: string;
}

/**
 * Circular avatar button + Radix dropdown shown in the header when the user
 * is signed in. Replaces the "Log in" CTA. Mirrors Autolokate's
 * `site-header.tsx` AvatarMenu (Profile, Community, Logout).
 */
export function AvatarMenu({ label = "Account", className }: AvatarMenuProps) {
  const router = useRouter();
  const logout = useLogout({
    onSuccess: () => router.push("/"),
  });

  function handleSelect(item: AvatarMenuItem) {
    if (item.action === "logout") {
      void logout.mutate();
    }
  }

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button
          type="button"
          aria-label={label}
          className={cn(
            "flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-border/80 bg-card text-foreground shadow-[0_12px_30px_-14px_rgba(0,0,0,0.35)] ring-1 ring-primary/20 transition hover:scale-[1.03] hover:ring-primary/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background sm:h-10 sm:w-10",
            className,
          )}
        >
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-background text-foreground sm:h-8 sm:w-8">
            <AvatarGlyph className="h-4 w-4" />
          </span>
        </button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="end"
          sideOffset={10}
          collisionPadding={8}
          className="z-[60] w-52 rounded-2xl border border-border/80 bg-card/95 p-2 shadow-xl backdrop-blur-md focus:outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95"
        >
          {avatarMenuItems.map((item, index) => {
            const isLast = index === avatarMenuItems.length - 1;
            const Icon = item.icon;
            const row = (
              <DropdownMenu.Item
                key={item.id}
                onSelect={() => handleSelect(item)}
                className={cn(
                  "flex cursor-pointer items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium outline-none transition-colors",
                  item.tone === "danger"
                    ? "text-rose-600 focus:bg-rose-500/10 focus:text-rose-600"
                    : "text-foreground focus:bg-primary/10 focus:text-foreground",
                  logout.isLoading && item.action === "logout" && "pointer-events-none opacity-60",
                )}
                asChild={Boolean(item.href)}
              >
                {item.href ? (
                  <Link href={item.href}>
                    <Icon className={cn("h-4 w-4", item.tone === "danger" ? "text-rose-600" : "text-foreground")} aria-hidden />
                    <span>{item.label}</span>
                  </Link>
                ) : (
                  <span className="flex items-center gap-2.5">
                    <Icon className={cn("h-4 w-4", item.tone === "danger" ? "text-rose-600" : "text-foreground")} aria-hidden />
                    <span>{logout.isLoading && item.action === "logout" ? "Signing out…" : item.label}</span>
                  </span>
                )}
              </DropdownMenu.Item>
            );

            // Separator before the last (danger) item.
            if (isLast && avatarMenuItems.length > 1 && item.tone === "danger") {
              return (
                <span key={item.id}>
                  <DropdownMenu.Separator className="my-1.5 h-px bg-border/70" />
                  {row}
                </span>
              );
            }
            return row;
          })}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
