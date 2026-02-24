import { useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import api from '../api/client';
import type { PagedResult, Claim } from '../api/types';

const statusMap: Record<number, string> = {
  0: 'Created',
  1: 'Submitted',
  2: 'Denied',
  3: 'Paid',
  4: 'Partially Paid',
};

export default function Claims() {
  const [data, setData] = useState<PagedResult<Claim> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get<PagedResult<Claim>>('/claims?page=1&pageSize=20')
      .then((res) => setData(res.data))
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, []);

  const items = data?.items ?? [];

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-900">Claims</h1>
          <p className="mt-1 text-slate-600">Insurance claims and status</p>
        </div>
        <button type="button" className="btn-primary flex items-center gap-2">
          <Plus className="h-4 w-4" />
          New claim
        </button>
      </div>
      <div className="card mt-8">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary-600 border-t-transparent" />
          </div>
        ) : items.length === 0 ? (
          <p className="py-12 text-center text-slate-500">No claims.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500">
                  <th className="pb-3 font-medium">Status</th>
                  <th className="pb-3 font-medium">Billed</th>
                  <th className="pb-3 font-medium">Paid</th>
                  <th className="pb-3 font-medium">Submitted</th>
                </tr>
              </thead>
              <tbody>
                {items.map((c) => (
                  <tr key={c.id} className="border-b border-slate-100 hover:bg-slate-50/50">
                    <td className="py-3">
                      <span className="rounded-full bg-primary-100 px-2 py-0.5 text-xs font-medium text-primary-700">
                        {statusMap[c.claimStatus] ?? c.claimStatus}
                      </span>
                    </td>
                    <td className="py-3 font-medium text-slate-900">${c.totalBilled.toLocaleString()}</td>
                    <td className="py-3 text-slate-600">${c.totalPaid.toLocaleString()}</td>
                    <td className="py-3 text-slate-600">
                      {c.submittedAt ? new Date(c.submittedAt).toLocaleDateString() : '—'}
                    </td>
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
