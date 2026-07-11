import { formatAuditField } from '@/platform/utils/audit-field';

export function actionTone(action: string): 'active' | 'pending' | 'inactive' {
  if (action.includes('APPROVED') || action.includes('PAID') || action.includes('MINTED')) {
    return 'active';
  }
  if (action.includes('REJECTED') || action.includes('SCRAPPED') || action.includes('ERASURE')) {
    return 'inactive';
  }
  return 'pending';
}

export function formatRelativeTime(value: string): string {
  const date = new Date(value);
  const deltaMs = Date.now() - date.getTime();
  const minutes = Math.floor(deltaMs / 60_000);
  if (minutes < 1) {
    return 'Just now';
  }
  if (minutes < 60) {
    return `${String(minutes)}m ago`;
  }
  const hours = Math.floor(minutes / 60);
  if (hours < 24) {
    return `${String(hours)}h ago`;
  }
  return date.toLocaleDateString();
}

export function formatActivityDetail(targetType: object | null, _targetId: object | null): string {
  const target = formatAuditField(targetType);
  if (target !== '—') {
    return target;
  }
  return 'System';
}
