type ToastListener = (message: string) => void;

let listener: ToastListener | null = null;

export function registerToastListener(next: ToastListener): () => void {
  listener = next;
  return () => {
    if (listener === next) {
      listener = null;
    }
  };
}

export function showErrorToast(message: string): void {
  const trimmed = message.trim();
  if (!trimmed || typeof window === 'undefined') {
    return;
  }
  listener?.(trimmed);
}
