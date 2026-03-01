import { useEffect, useState } from 'react';
import type { AgingArResponse } from '../api/types';
import api from '../api/client';
import PageHeader from '../components/Layout/PageHeader';
import { Messages } from '../constants/messages';

export default function Revenue() {
  const [data, setData] = useState<AgingArResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get<AgingArResponse>('/revenue/aging-ar')
      .then((res) => setData(res.data))
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, []);

  const b = data?.buckets;

  return (
    <div>
      <PageHeader title={Messages.pageRevenue} description={Messages.pageRevenueDesc} />
      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <div className="card">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Aging AR</h2>
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary-600 border-t-transparent dark:border-primary-400" />
            </div>
          ) : b ? (
            <dl className="mt-4 space-y-3">
              <div className="flex justify-between">
                <dt className="text-slate-600 dark:text-slate-400">0–30 days</dt>
                <dd className="font-medium text-slate-900 dark:text-slate-100">${(b.amount0To30 ?? 0).toLocaleString()}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-600 dark:text-slate-400">31–60 days</dt>
                <dd className="font-medium text-slate-900 dark:text-slate-100">${(b.amount31To60 ?? 0).toLocaleString()}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-600 dark:text-slate-400">61–90 days</dt>
                <dd className="font-medium text-slate-900 dark:text-slate-100">${(b.amount61To90 ?? 0).toLocaleString()}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-600 dark:text-slate-400">90+ days</dt>
                <dd className="font-medium text-slate-900 dark:text-slate-100">${(b.amount90Plus ?? 0).toLocaleString()}</dd>
              </div>
              <div className="flex justify-between border-t border-slate-200 dark:border-slate-600 pt-3 font-semibold text-slate-900 dark:text-slate-100">
                <dt>Total outstanding</dt>
                <dd>${(b.totalOutstanding ?? 0).toLocaleString()}</dd>
              </div>
            </dl>
          ) : (
            <p className="py-6 text-slate-500 dark:text-slate-400">{Messages.emptyRevenue}</p>
          )}
        </div>
      </div>
    </div>
  );
}
