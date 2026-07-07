import { AlSkeleton, AlStack } from '@autolokate/ui';

export function MetricSkeleton() {
  return (
    <div className="al-admin-surface" style={{ padding: 'var(--al-space-5)' }}>
      <AlStack gap="sm">
        <AlSkeleton width="40%" height={12} />
        <AlSkeleton width="55%" height={28} />
        <AlSkeleton width="70%" height={10} />
      </AlStack>
    </div>
  );
}
