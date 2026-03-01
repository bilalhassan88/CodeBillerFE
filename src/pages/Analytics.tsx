import { useEffect, useState } from 'react';
import api from '../api/client';
import PageHeader from '../components/Layout/PageHeader';
import { Messages } from '../constants/messages';

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
      <PageHeader title={Messages.pageAnalytics} description={Messages.pageAnalyticsDesc} />
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
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Billing (last 30 days)</h2>
          {loading ? (
            <div className="mt-2 h-8 w-8 animate-spin rounded-full border-2 border-primary-600 border-t-transparent dark:border-primary-400" />
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
