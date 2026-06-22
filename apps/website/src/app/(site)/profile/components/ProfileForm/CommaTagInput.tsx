"use client";

import { useState, type ReactNode } from "react";
import { X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { FIELD_ERROR_BORDER } from "./constants";

function parseList(raw: string): string[] {
  return raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

interface CommaTagInputProps {
  id: string;
  placeholder?: string;
  value: string;
  onChange: (next: string) => void;
  disabled?: boolean;
  icon: ReactNode;
  hasError?: boolean;
  "aria-invalid"?: boolean;
}

/**
 * Comma-separated list shown as removable chips; editing still maps to the
 * same string field consumed by `validateProfileForm`.
 */
export function CommaTagInput({
  id,
  placeholder,
  value,
  onChange,
  disabled,
  icon,
  hasError,
  "aria-invalid": ariaInvalid,
}: CommaTagInputProps) {
  const [draft, setDraft] = useState("");
  const tags = parseList(value);

  function commitTags(nextTags: string[]) {
    onChange(nextTags.join(", "));
  }

  function remove(tag: string) {
    commitTags(tags.filter((t) => t !== tag));
  }

  function addFromDraft() {
    const t = draft.trim().toLowerCase();
    if (!t) return;
    const next = tags.includes(t) ? tags : [...tags, t];
    commitTags(next);
    setDraft("");
  }

  return (
    <div
      className={cn(
        "flex min-h-11 w-full items-center gap-2 rounded-xl border border-border/70 bg-background px-3 py-2 text-sm shadow-inner transition",
        "focus-within:border-primary/60 focus-within:ring-2 focus-within:ring-primary/20",
        disabled && "cursor-not-allowed opacity-60",
        hasError && FIELD_ERROR_BORDER,
      )}
    >
      <span
        className="pointer-events-none flex shrink-0 items-center justify-center text-primary [&_svg]:h-4 [&_svg]:w-4 [&_svg]:shrink-0"
        aria-hidden
      >
        {icon}
      </span>
      <div className="flex min-w-0 flex-1 flex-wrap items-center gap-1.5">
        {tags.map((tag) => (
          <Badge
            key={tag}
            variant="secondary"
            className="inline-flex h-7 max-h-7 shrink-0 items-center gap-1 border border-border/60 bg-muted/50 py-0 pr-1 pl-2 align-middle font-normal capitalize leading-none text-foreground"
          >
            {tag}
            <button
              type="button"
              disabled={disabled}
              className="inline-flex shrink-0 rounded p-0.5 text-muted-foreground hover:bg-background/80 hover:text-foreground disabled:pointer-events-none"
              onClick={() => remove(tag)}
              aria-label={`Remove ${tag}`}
            >
              <X className="h-3 w-3" aria-hidden />
            </button>
          </Badge>
        ))}
        <Input
          id={id}
          type="text"
          disabled={disabled}
          placeholder={tags.length ? "" : placeholder}
          aria-invalid={ariaInvalid}
          className="h-8 min-h-8 min-w-[8rem] flex-1 self-center border-0 bg-transparent px-0.5 py-1 align-middle text-sm leading-none shadow-none focus-visible:ring-0 disabled:opacity-60"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === ",") {
              e.preventDefault();
              addFromDraft();
            }
            if (e.key === "Backspace" && !draft && tags.length > 0) {
              remove(tags[tags.length - 1]!);
            }
          }}
          onBlur={() => {
            if (draft.trim()) addFromDraft();
          }}
        />
      </div>
    </div>
  );
}
