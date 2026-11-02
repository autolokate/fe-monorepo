import { AlButton } from '@autolokate/ui';

/** "Load more" under a server-paginated table. Renders nothing once the server says there's no more. */
export function AdminLoadMore({
  hasMore,
  loading,
  onLoadMore,
  testId,
}: {
  hasMore: boolean;
  loading: boolean;
  onLoadMore: () => void;
  testId?: string;
}) {
  if (!hasMore) return null;
  return (
    <div className="admin-page-actions">
      <AlButton
        size="sm"
        variant="secondary"
        loading={loading}
        disabled={loading}
        data-testid={testId}
        onClick={onLoadMore}
      >
        Load more
      </AlButton>
    </div>
  );
}
