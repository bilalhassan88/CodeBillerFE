import { useEffect, useState } from 'react';
import api from '../api/client';

interface AuditEntry {
  id: string;
  timestamp: string;
  entityType: string;
  entityId: string;
  action: string;
  details?: string;
}

export default function Audit() {
  const [items, setItems] = useState<AuditEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const to = new Date();
    const from = new Date();
    from.setMonth(from.getMonth() - 1);
    const fromStr = from.toISOString().slice(0, 10);
    const toStr = to.toISOString().slice(0, 10);
    api.get<AuditEntry[]>(`/audit/export?fromDate=${fromStr}&toDate=${toStr}&limit=100`)
      .then((res) => setItems(Array.isArray(res.data) ? res.data : []))
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-slate-900">Audit log</h1>
      <p className="mt-1 text-slate-600">Admin-only activity export</p>
      <div className="card mt-8">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary-600 border-t-transparent" />
          </div>
        ) : items.length === 0 ? (
          <p className="py-12 text-center text-slate-500">No audit entries in range.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500">
                  <th className="pb-3 font-medium">Time</th>
                  <th className="pb-3 font-medium">Entity</th>
                  <th className="pb-3 font-medium">Action</th>
                  <th className="pb-3 font-medium">Details</th>
                </tr>
              </thead>
              <tbody>
                {items.map((e) => (
                  <tr key={e.id} className="border-b border-slate-100">
                    <td className="py-3 text-slate-600">{new Date(e.timestamp).toLocaleString()}</td>
                    <td className="py-3 font-medium text-slate-900">{e.entityType} / {e.entityId}</td>
                    <td className="py-3">{e.action}</td>
                    <td className="py-3 text-slate-600">{e.details ?? '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
