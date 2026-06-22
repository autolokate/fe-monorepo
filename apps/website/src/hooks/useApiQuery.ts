"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ApiError, extractApiErrorMessage } from "@/lib/api/error";

export interface UseApiQueryOptions<TData> {
  /** Skip the initial fetch when false. Useful to gate on auth/state. Default: true. */
  enabled?: boolean;
  /** Seed value rendered before the first fetch resolves. */
  initialData?: TData;
  /** Called on success. */
  onSuccess?: (data: TData) => void;
  /** Called on failure. */
  onError?: (error: ApiError) => void;
}

export interface UseApiQueryResult<TData> {
  data: TData | undefined;
  error: ApiError | null;
  isLoading: boolean;
  isFetching: boolean;
  isError: boolean;
  isSuccess: boolean;
  refetch: () => Promise<TData | undefined>;
}

type Status = "idle" | "loading" | "success" | "error";

/**
 * Lightweight query hook — replays `queryFn` whenever `deps` change.
 * No global cache, no dedupe, no background refetch. Perfect for simple reads.
 */
export function useApiQuery<TData>(
  queryFn: () => Promise<TData>,
  deps: ReadonlyArray<unknown> = [],
  options: UseApiQueryOptions<TData> = {},
): UseApiQueryResult<TData> {
  const { enabled = true, initialData, onSuccess, onError } = options;

  const [data, setData] = useState<TData | undefined>(initialData);
  const [error, setError] = useState<ApiError | null>(null);
  const [status, setStatus] = useState<Status>(enabled ? "loading" : "idle");
  const [isFetching, setIsFetching] = useState(false);

  // Keep latest callbacks without causing effect resubscription.
  const fnRef = useRef(queryFn);
  const cbRef = useRef({ onSuccess, onError });
  fnRef.current = queryFn;
  cbRef.current = { onSuccess, onError };

  const run = useCallback(async (): Promise<TData | undefined> => {
    setIsFetching(true);
    // Flip to "loading" at the start of every fetch. The `isLoading` getter
    // also gates on `data === undefined`, so background refetches don't
    // re-trigger skeleton UI — but the initial fetch (or a fetch after
    // `enabled` flipped from false → true) correctly reports loading.
    setStatus("loading");
    try {
      const result = await fnRef.current();
      setData(result);
      setStatus("success");
      setError(null);
      cbRef.current.onSuccess?.(result);
      return result;
    } catch (raw) {
      const apiErr =
        raw instanceof ApiError ? raw : new ApiError(extractApiErrorMessage(raw), 0);
      setError(apiErr);
      setStatus("error");
      cbRef.current.onError?.(apiErr);
      return undefined;
    } finally {
      setIsFetching(false);
    }
  }, []);

  useEffect(() => {
    if (!enabled) return;
    void run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, ...deps]);

  return {
    data,
    error,
    isLoading: status === "loading" && data === undefined,
    isFetching,
    isError: status === "error",
    isSuccess: status === "success",
    refetch: run,
  };
}
