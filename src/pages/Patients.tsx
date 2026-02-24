import { useEffect, useState } from 'react';
import { Plus, Search } from 'lucide-react';
import api from '../api/client';
import type { PagedResult, Patient } from '../api/types';

export default function Patients() {
  const [data, setData] = useState<PagedResult<Patient> | null>(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    api.get<PagedResult<Patient>>(`/patients?page=${page}&pageSize=10`)
      .then((res) => { if (!cancelled) setData(res.data); })
      .catch(() => { if (!cancelled) setData(null); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [page]);

  const items = data?.items ?? [];
  const total = data?.totalCount ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / 10));

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-900">Patients</h1>
          <p className="mt-1 text-slate-600">Manage patient demographics</p>
        </div>
        <button type="button" className="btn-primary flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add patient
        </button>
      </div>
      <div className="card mt-8">
        <div className="mb-4 flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input type="search" placeholder="Search patients..." className="input-field pl-10" />
          </div>
        </div>
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary-600 border-t-transparent" />
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500">
                    <th className="pb-3 font-medium">Name</th>
                    <th className="pb-3 font-medium">DOB</th>
                    <th className="pb-3 font-medium">Phone</th>
                    <th className="pb-3 font-medium">Email</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((p) => (
                    <tr key={p.id} className="border-b border-slate-100 hover:bg-slate-50/50">
                      <td className="py-3 font-medium text-slate-900">{p.firstName} {p.lastName}</td>
                      <td className="py-3 text-slate-600">{new Date(p.dateOfBirth).toLocaleDateString()}</td>
                      <td className="py-3 text-slate-600">{p.phone ?? '—'}</td>
                      <td className="py-3 text-slate-600">{p.email ?? '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {items.length === 0 && (
              <p className="py-12 text-center text-slate-500">No patients yet.</p>
            )}
            {totalPages > 1 && (
              <div className="mt-4 flex items-center justify-between border-t border-slate-200 pt-4">
                <p className="text-sm text-slate-500">{total} total</p>
                <div className="flex gap-2">
                  <button
                    type="button"
                    className="btn-secondary"
                    disabled={page <= 1}
                    onClick={() => setPage((p) => p - 1)}
                  >
                    Previous
                  </button>
                  <button
                    type="button"
                    className="btn-secondary"
                    disabled={page >= totalPages}
                    onClick={() => setPage((p) => p + 1)}
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
