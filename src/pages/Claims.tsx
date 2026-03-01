import { useEffect, useState } from 'react';
import { Plus, X } from 'lucide-react';
import api from '../api/client';
import type { PagedResult, Claim, Patient, Insurance } from '../api/types';
import { getClaimStatusLabel } from '../constants/lookups';
import { getApiErrorMessage } from '../utils/apiErrors';

export default function Claims() {
  const [data, setData] = useState<PagedResult<Claim> | null>(null);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [insurances, setInsurances] = useState<Insurance[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [form, setForm] = useState({ patientId: '', insuranceId: '', totalBilled: '' });

  const load = () => {
    setLoading(true);
    api.get<PagedResult<Claim>>('/claims?page=1&pageSize=20')
      .then((res) => setData(res.data))
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  useEffect(() => {
    if (showAdd) {
      api.get<PagedResult<Patient>>('/patients?page=1&pageSize=100').then((res) => setPatients(res.data?.items ?? [])).catch(() => setPatients([]));
      api.get<PagedResult<Insurance>>('/insurances?page=1&pageSize=50').then((res) => setInsurances(res.data?.items ?? [])).catch(() => setInsurances([]));
    }
  }, [showAdd]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    const amount = parseFloat(form.totalBilled);
    if (!form.patientId || !form.insuranceId || isNaN(amount) || amount < 0) {
      setSubmitError('Please select patient, insurance, and enter a valid amount.');
      return;
    }
    try {
      await api.post('/claims', {
        patientId: form.patientId,
        insuranceId: form.insuranceId,
        totalBilled: amount,
      });
      setShowAdd(false);
      setForm({ patientId: '', insuranceId: '', totalBilled: '' });
      load();
    } catch (err: unknown) {
      setSubmitError(getApiErrorMessage(err, 'Failed to create claim.'));
    }
  };

  const items = data?.items ?? [];

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-slate-100">Claims</h1>
          <p className="mt-1 text-slate-600 dark:text-slate-300">Insurance claims and status</p>
        </div>
        <button type="button" className="btn-primary flex items-center gap-2" onClick={() => setShowAdd(true)}>
          <Plus className="h-4 w-4" />
          New claim
        </button>
      </div>
      <div className="card mt-8">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary-600 border-t-transparent dark:border-primary-400" />
          </div>
        ) : items.length === 0 ? (
          <p className="py-12 text-center text-slate-500 dark:text-slate-400">No claims.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 dark:border-slate-600 dark:text-slate-400">
                  <th className="pb-3 font-medium">Status</th>
                  <th className="pb-3 font-medium">Billed</th>
                  <th className="pb-3 font-medium">Paid</th>
                  <th className="pb-3 font-medium">Submitted</th>
                </tr>
              </thead>
              <tbody>
                {items.map((c) => (
                  <tr key={c.id} className="border-b border-slate-100 hover:bg-slate-50/50 dark:border-slate-600 dark:hover:bg-slate-700/30">
                    <td className="py-3">
                      <span className="rounded-full bg-primary-100 px-2 py-0.5 text-xs font-medium text-primary-700 dark:bg-primary-900/40 dark:text-primary-300">{getClaimStatusLabel(c.claimStatus)}</span>
                    </td>
                    <td className="py-3 font-medium text-slate-900 dark:text-slate-100">${c.totalBilled.toLocaleString()}</td>
                    <td className="py-3 text-slate-600 dark:text-slate-300">${(c.totalPaid ?? 0).toLocaleString()}</td>
                    <td className="py-3 text-slate-600 dark:text-slate-300">{c.submittedAt ? new Date(c.submittedAt).toLocaleDateString() : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl dark:bg-dark-card dark:border dark:border-slate-600">
            <div className="flex items-center justify-between border-b border-slate-200 pb-4 dark:border-slate-600">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">New claim</h2>
              <button type="button" className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-dark-muted dark:hover:text-slate-200" onClick={() => { setShowAdd(false); setSubmitError(null); }}><X className="h-5 w-5" /></button>
            </div>
            <form onSubmit={handleAdd} className="mt-4 space-y-3">
              {submitError && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-900/30 dark:text-red-300">{submitError}</p>}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Patient *</label>
                <select required className="input-field mt-1" value={form.patientId} onChange={(e) => setForm((f) => ({ ...f, patientId: e.target.value }))}>
                  <option value="">Select patient</option>
                  {patients.map((p) => (
                    <option key={p.id} value={p.id}>{p.firstName} {p.lastName}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Insurance *</label>
                <select required className="input-field mt-1" value={form.insuranceId} onChange={(e) => setForm((f) => ({ ...f, insuranceId: e.target.value }))}>
                  <option value="">Select insurance</option>
                  {insurances.map((i) => (
                    <option key={i.id} value={i.id}>{i.payerName}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Total billed ($) *</label>
                <input type="number" step="0.01" min="0" required className="input-field mt-1" value={form.totalBilled} onChange={(e) => setForm((f) => ({ ...f, totalBilled: e.target.value }))} />
              </div>
              <div className="flex gap-2 pt-4">
                <button type="submit" className="btn-primary flex-1">Save</button>
                <button type="button" className="btn-secondary" onClick={() => { setShowAdd(false); setSubmitError(null); }}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
