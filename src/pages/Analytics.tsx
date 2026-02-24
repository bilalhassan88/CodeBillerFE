import { useEffect, useState } from 'react';
import api from '../api/client';

export default function Analytics() {
  const [summary, setSummary] = useState<{ totalAppointments?: number; totalBilled?: number } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const from = new Date();
    from.setMonth(from.getMonth() - 1);
    const to = new Date();
    const fromStr = from.toISOString().slice(0, 10);
    const toStr = to.toISOString().slice(0, 10);
    Promise.all([
      api.get(`/analytics/appointments-summary?fromDate=${fromStr}&toDate=${toStr}`).catch(() => ({ data: {} })),
      api.get(`/analytics/billing-summary?fromDate=${fromStr}&toDate=${toStr}`).catch(() => ({ data: {} })),
    ])
      .then(([a, b]) => setSummary({
        totalAppointments: (a.data as { totalCount?: number }).totalCount,
        totalBilled: (b.data as { totalBilled?: number }).totalBilled,
      }))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-slate-900">Analytics</h1>
      <p className="mt-1 text-slate-600">Reports and insights</p>
      <div className="mt-8 grid gap-6 sm:grid-cols-2">
        <div className="card">
          <h2 className="text-lg font-semibold text-slate-900">Appointments (last 30 days)</h2>
          {loading ? (
            <div className="mt-2 h-8 w-8 animate-spin rounded-full border-2 border-primary-600 border-t-transparent" />
          ) : (
            <p className="mt-2 text-2xl font-bold text-primary-600">{summary?.totalAppointments ?? 0}</p>
          )}
        </div>
        <div className="card">
          <h2 className="text-lg font-semibold text-slate-900">Billing (last 30 days)</h2>
          {loading ? (
            <div className="mt-2 h-8 w-8 animate-spin rounded-full border-2 border-primary-600 border-t-transparent" />
          ) : (
            <p className="mt-2 text-2xl font-bold text-primary-600">
              ${(summary?.totalBilled ?? 0).toLocaleString()}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
