type ToastListener = (message: string) => void;

let listener: ToastListener | null = null;
let lastMessage = '';
let lastShownAt = 0;
const DEDUPE_WINDOW_MS = 1500;

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
  const now = Date.now();
  if (trimmed === lastMessage && now - lastShownAt < DEDUPE_WINDOW_MS) {
    return;
  }
  lastMessage = trimmed;
  lastShownAt = now;
  listener?.(trimmed);
}
