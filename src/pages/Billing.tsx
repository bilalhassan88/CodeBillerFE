import { useEffect, useState } from 'react';
import api from '../api/client';

interface BillingItem {
  id: string;
  patientId: string;
  cptCode: string;
  icdCode: string;
  billedAmount: number;
  paidAmount: number;
  status: number;
}

export default function Billing() {
  const [items, setItems] = useState<BillingItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get<{ items: BillingItem[] }>('/billing?page=1&pageSize=20')
      .then((res) => setItems(res.data.items ?? []))
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-slate-900">Billing</h1>
      <p className="mt-1 text-slate-600">Billing records and codes</p>
      <div className="card mt-8">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary-600 border-t-transparent" />
          </div>
        ) : items.length === 0 ? (
          <p className="py-12 text-center text-slate-500">No billing records.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500">
                  <th className="pb-3 font-medium">CPT</th>
                  <th className="pb-3 font-medium">ICD</th>
                  <th className="pb-3 font-medium">Billed</th>
                  <th className="pb-3 font-medium">Paid</th>
                </tr>
              </thead>
              <tbody>
                {items.map((r) => (
                  <tr key={r.id} className="border-b border-slate-100 hover:bg-slate-50/50">
                    <td className="py-3 font-medium text-slate-900">{r.cptCode}</td>
                    <td className="py-3 text-slate-600">{r.icdCode}</td>
                    <td className="py-3 text-slate-600">${r.billedAmount.toLocaleString()}</td>
                    <td className="py-3 text-slate-600">${r.paidAmount.toLocaleString()}</td>
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
