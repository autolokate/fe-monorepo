import type { PropRow } from '../types';

export function PropsTable({ rows }: { rows: PropRow[] }) {
  return (
    <div className="ds-table-wrap">
      <table className="ds-table">
      <thead>
        <tr>
          <th>Prop</th>
          <th>Type</th>
          <th>Default</th>
          <th>Description</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr key={row.name}>
            <td>{row.name}</td>
            <td>{row.type}</td>
            <td>{row.defaultValue ?? '-'}</td>
            <td>{row.description}</td>
          </tr>
        ))}
      </tbody>
    </table>
    </div>
  );
}
