import { useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import api from '../api/client';
import type { PagedResult, Appointment } from '../api/types';

export default function Appointments() {
  const [data, setData] = useState<PagedResult<Appointment> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get<PagedResult<Appointment>>('/appointments?page=1&pageSize=20')
      .then((res) => setData(res.data))
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, []);

  const items = data?.items ?? [];
  const statusLabel = (s: number) => (s === 0 ? 'Scheduled' : s === 1 ? 'Canceled' : 'Completed');

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-900">Appointments</h1>
          <p className="mt-1 text-slate-600">Schedule and manage visits</p>
        </div>
        <button type="button" className="btn-primary flex items-center gap-2">
          <Plus className="h-4 w-4" />
          New appointment
        </button>
      </div>
      <div className="card mt-8">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary-600 border-t-transparent" />
          </div>
        ) : items.length === 0 ? (
          <p className="py-12 text-center text-slate-500">No appointments.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500">
                  <th className="pb-3 font-medium">Date & time</th>
                  <th className="pb-3 font-medium">Status</th>
                  <th className="pb-3 font-medium">Notes</th>
                </tr>
              </thead>
              <tbody>
                {items.map((a) => (
                  <tr key={a.id} className="border-b border-slate-100 hover:bg-slate-50/50">
                    <td className="py-3 font-medium text-slate-900">
                      {new Date(a.appointmentDateTime).toLocaleString()}
                    </td>
                    <td className="py-3">
                      <span className="rounded-full bg-primary-100 px-2 py-0.5 text-xs font-medium text-primary-700">
                        {statusLabel(a.status)}
                      </span>
                    </td>
                    <td className="py-3 text-slate-600">{a.notes ?? '—'}</td>
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
