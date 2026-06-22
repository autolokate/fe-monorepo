"use client";

import { useCallback, useRef, useState } from "react";
import { toast } from "sonner";
import { ApiError, extractApiErrorMessage } from "@/lib/api/error";

export interface UseApiMutationOptions<TData, TVariables> {
  /** Runs after a successful call. Receives the resolved data + the variables you passed in. */
  onSuccess?: (data: TData, variables: TVariables) => void | Promise<void>;
  /** Runs after a failed call. Receives the normalised `ApiError`. */
  onError?: (error: ApiError, variables: TVariables) => void | Promise<void>;
  /** Toast on success automatically. Pass a string for the title, or `true` for a default. */
  successToast?: string | true;
  /** Toast on error automatically. Pass `false` to silence the default behaviour. Defaults to `true`. */
  errorToast?: boolean | string;
}

export interface UseApiMutationResult<TData, TVariables> {
  mutate: (variables: TVariables) => Promise<TData | undefined>;
  /** Like `mutate`, but rethrows on error so the caller can chain its own logic. */
  mutateAsync: (variables: TVariables) => Promise<TData>;
  reset: () => void;
  data: TData | undefined;
  error: ApiError | null;
  isLoading: boolean;
  isError: boolean;
  isSuccess: boolean;
  isIdle: boolean;
}

type Status = "idle" | "loading" | "success" | "error";

/**
 * Tiny mutation hook — wraps an async function with `{ loading, error, data }` state,
 * normalised `ApiError` handling, and optional `sonner` toast on success / error.
 *
 * @example
 *   const m = useApiMutation(requestOtp, { successToast: "OTP sent" });
 *   await m.mutateAsync({ phone: "+91..." });
 */
export function useApiMutation<TData, TVariables = void>(
  mutationFn: (variables: TVariables) => Promise<TData>,
  options: UseApiMutationOptions<TData, TVariables> = {},
): UseApiMutationResult<TData, TVariables> {
  const [status, setStatus] = useState<Status>("idle");
  const [data, setData] = useState<TData | undefined>(undefined);
  const [error, setError] = useState<ApiError | null>(null);

  // Stash callbacks in a ref so re-renders don't re-create the mutate fn unnecessarily.
  const optionsRef = useRef(options);
  optionsRef.current = options;

  const reset = useCallback(() => {
    setStatus("idle");
    setData(undefined);
    setError(null);
  }, []);

  const mutateAsync = useCallback(
    async (variables: TVariables): Promise<TData> => {
      setStatus("loading");
      setError(null);
      try {
        const result = await mutationFn(variables);
        setData(result);
        setStatus("success");

        const { onSuccess, successToast } = optionsRef.current;
        if (successToast) {
          toast.success(typeof successToast === "string" ? successToast : "Done");
        }
        await onSuccess?.(result, variables);
        return result;
      } catch (raw) {
        const apiErr =
          raw instanceof ApiError
            ? raw
            : new ApiError(extractApiErrorMessage(raw), 0);
        setError(apiErr);
        setStatus("error");

        const { onError, errorToast = true } = optionsRef.current;
        if (errorToast) {
          toast.error(typeof errorToast === "string" ? errorToast : apiErr.message);
        }
        await onError?.(apiErr, variables);
        throw apiErr;
      }
    },
    [mutationFn],
  );

  const mutate = useCallback(
    async (variables: TVariables): Promise<TData | undefined> => {
      try {
        return await mutateAsync(variables);
      } catch {
        return undefined;
      }
    },
    [mutateAsync],
  );

  return {
    mutate,
    mutateAsync,
    reset,
    data,
    error,
    isLoading: status === "loading",
    isError: status === "error",
    isSuccess: status === "success",
    isIdle: status === "idle",
  };
}
