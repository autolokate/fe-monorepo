import type { PaginationDto } from '@autolokate/api-client';

/** A keyset page as the admin list clients return it (`data` + `meta.pagination`). */
export type CursorPage<T> = { items: T[]; pagination: PaginationDto | null };

export const ADMIN_LIST_PAGE_SIZE = 50;

/** `getNextPageParam` for keyset lists: the next cursor only while the server reports more. */
export function nextCursorOf<T>(page: CursorPage<T>): string | undefined {
  return page.pagination?.hasMore ? (page.pagination.nextCursor ?? undefined) : undefined;
}

/**
 * `getNextPageParam` for offset lists that return a bare array (no pagination meta): a full page
 * means there may be more; a short page is the end.
 */
export function nextOffsetOf<T>(
  lastPage: T[],
  allPages: T[][],
  pageSize: number = ADMIN_LIST_PAGE_SIZE,
): number | undefined {
  if (lastPage.length < pageSize) return undefined;
  return allPages.reduce((total, page) => total + page.length, 0);
}
