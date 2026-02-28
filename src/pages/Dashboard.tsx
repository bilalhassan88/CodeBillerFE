import { useEffect, useState } from 'react';
import { Users, Calendar, Receipt, TrendingUp } from 'lucide-react';
import api from '../api/client';
import type { PagedResult } from '../api/types';

interface Stats {
  patients: number;
  appointments: number;
  claims: number;
  revenue: number;
}

export default function Dashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [p, a, c, r] = await Promise.all([
          api.get<PagedResult<unknown>>('/patients?page=1&pageSize=1'),
          api.get<PagedResult<unknown>>('/appointments?page=1&pageSize=1'),
          api.get<PagedResult<unknown>>('/claims?page=1&pageSize=1'),
          api.get<{ buckets: { totalOutstanding: number } }>('/revenue/aging-ar').catch(() => ({ data: { buckets: { totalOutstanding: 0 } } })),
        ]);
        setStats({
          patients: p.data.totalCount ?? 0,
          appointments: a.data.totalCount ?? 0,
          claims: c.data.totalCount ?? 0,
          revenue: r.data?.buckets?.totalOutstanding ?? 0,
        });
      } catch {
        setStats({ patients: 0, appointments: 0, claims: 0, revenue: 0 });
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary-600 border-t-transparent dark:border-primary-400" />
      </div>
    );
  }

  const cards = [
    { label: 'Patients', value: stats?.patients ?? 0, icon: Users, color: 'bg-primary-500' },
    { label: 'Appointments', value: stats?.appointments ?? 0, icon: Calendar, color: 'bg-blue-500' },
    { label: 'Claims', value: stats?.claims ?? 0, icon: Receipt, color: 'bg-emerald-500' },
    { label: 'AR Outstanding', value: `$${(stats?.revenue ?? 0).toLocaleString()}`, icon: TrendingUp, color: 'bg-violet-500' },
  ];

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-slate-100">Dashboard</h1>
      <p className="mt-1 text-slate-600 dark:text-slate-400">Overview of your practice</p>
      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="card flex items-center gap-4">
            <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${color} text-white`}>
              <Icon className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{label}</p>
              <p className="text-xl font-semibold text-slate-900 dark:text-slate-100">{value}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
