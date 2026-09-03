#!/usr/bin/env python3
"""Migrate hardcoded marketing hex colors to website design tokens."""
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1] / "apps/website"

REPLACEMENTS = [
    ("#0a0a0c", "var(--website-ink)"),
    ("#0A0A0C", "var(--website-ink)"),
    ("#39c46b", "var(--website-accent-bright)"),
    ("#39C46B", "var(--website-accent-bright)"),
    ("#6b7079", "var(--website-text-muted)"),
    ("#4a4f57", "var(--website-text-soft)"),
    ("#9aa0a8", "var(--website-on-dark-soft)"),
    ("#c9cdd3", "var(--website-on-dark-muted)"),
    ("#eceff3", "var(--website-border-subtle)"),
    ("#fff", "var(--website-surface)"),
    ("#ffffff", "var(--website-surface)"),
    ("#FFFFFF", "var(--website-surface)"),
]

def main() -> None:
    count = 0
    for path in ROOT.rglob("*.css"):
        if "node_modules" in path.parts:
            continue
        text = path.read_text()
        original = text
        for old, new in REPLACEMENTS:
            text = text.replace(old, new)
        if text != original:
            path.write_text(text)
            count += 1
            print(f"updated: {path.relative_to(ROOT)}")

    print(f"Done. {count} files updated.")

if __name__ == "__main__":
    main()
