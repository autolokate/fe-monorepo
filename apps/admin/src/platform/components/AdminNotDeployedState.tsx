export type AdminNotDeployedStateProps = {
  title: string;
  /** The route the server is missing, e.g. `GET /admin/v1/taxi/bookings`. */
  endpoint: string;
  description?: string;
};

/**
 * Honest state for a module whose backend route answers 404 on this environment. Shows no rows
 * and no fake numbers — it names the missing route so ops know what to ask for.
 */
export function AdminNotDeployedState({
  title,
  endpoint,
  description,
}: AdminNotDeployedStateProps) {
  return (
    <div className="admin-panel admin-panel--empty" role="status" data-testid="admin-not-deployed">
      <h2 className="admin-panel__title">{title}</h2>
      <p className="admin-panel__subtitle">
        {description ?? 'Not available on this server yet.'} The backend route{' '}
        <code>{endpoint}</code> is not deployed here.
      </p>
    </div>
  );
}
