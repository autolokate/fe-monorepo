const DIAG_KEY = 'al-pwa-photo-diagnostics';
const MAX_ENTRIES = 40;

export type PhotoDiagnosticEntry = {
  at: string;
  routeId: string;
  event: string;
  detail?: Record<string, string | number | boolean | null | undefined>;
};

export function logPhotoDiagnostic(
  routeId: string,
  event: string,
  detail?: PhotoDiagnosticEntry['detail'],
): void {
  if (typeof window === 'undefined') {
    return;
  }

  const entry: PhotoDiagnosticEntry = {
    at: new Date().toISOString(),
    routeId,
    event,
    ...(detail ? { detail } : {}),
  };

  try {
    const raw = window.sessionStorage.getItem(DIAG_KEY);
    const list = raw ? (JSON.parse(raw) as PhotoDiagnosticEntry[]) : [];
    list.push(entry);
    window.sessionStorage.setItem(DIAG_KEY, JSON.stringify(list.slice(-MAX_ENTRIES)));
  } catch {
    // diagnostics must never throw
  }
}

export function readPhotoDiagnostics(): PhotoDiagnosticEntry[] {
  if (typeof window === 'undefined') {
    return [];
  }
  try {
    const raw = window.sessionStorage.getItem(DIAG_KEY);
    return raw ? (JSON.parse(raw) as PhotoDiagnosticEntry[]) : [];
  } catch {
    return [];
  }
}

export function estimateSessionPhotoBytes(session: {
  parkMePhotos: { front: string | null; rear: string | null };
  sosPhotos: {
    front: string | null;
    rear: string | null;
    left: string | null;
    right: string | null;
  };
}): number {
  const urls = [
    session.parkMePhotos.front,
    session.parkMePhotos.rear,
    session.sosPhotos.front,
    session.sosPhotos.rear,
    session.sosPhotos.left,
    session.sosPhotos.right,
  ];
  return urls.reduce((sum, url) => sum + (url?.length ?? 0), 0);
}
