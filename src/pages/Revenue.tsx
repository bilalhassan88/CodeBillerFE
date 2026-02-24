import { useEffect, useState } from 'react';
import type { AgingArResponse } from '../api/types';
import api from '../api/client';

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
      <h1 className="font-display text-2xl font-bold text-slate-900">Revenue</h1>
      <p className="mt-1 text-slate-600">Aging AR and revenue cycle</p>
      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <div className="card">
          <h2 className="text-lg font-semibold text-slate-900">Aging AR</h2>
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary-600 border-t-transparent" />
            </div>
          ) : b ? (
            <dl className="mt-4 space-y-3">
              <div className="flex justify-between">
                <dt className="text-slate-600">0–30 days</dt>
                <dd className="font-medium">${(b.amount0To30 ?? 0).toLocaleString()}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-600">31–60 days</dt>
                <dd className="font-medium">${(b.amount31To60 ?? 0).toLocaleString()}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-600">61–90 days</dt>
                <dd className="font-medium">${(b.amount61To90 ?? 0).toLocaleString()}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-600">90+ days</dt>
                <dd className="font-medium">${(b.amount90Plus ?? 0).toLocaleString()}</dd>
              </div>
              <div className="flex justify-between border-t border-slate-200 pt-3 font-semibold">
                <dt>Total outstanding</dt>
                <dd>${(b.totalOutstanding ?? 0).toLocaleString()}</dd>
              </div>
            </dl>
          ) : (
            <p className="py-6 text-slate-500">Unable to load aging data.</p>
          )}
        </div>
      </div>
    </div>
  );
}
