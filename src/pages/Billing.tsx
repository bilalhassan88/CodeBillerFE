import { useEffect, useState } from 'react';
import { Plus, X } from 'lucide-react';
import api from '../api/client';
import type { Patient, PagedResult } from '../api/types';
import CodeLookupInput from '../components/CodeLookupInput';

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
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [form, setForm] = useState({ patientId: '', cptCode: '', icdCode: '', billedAmount: '', paidAmount: '0' });

  const load = () => {
    setLoading(true);
    api.get<PagedResult<BillingItem>>('/billing?page=1&pageSize=20')
      .then((res) => setItems(res.data?.items ?? []))
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  useEffect(() => {
    if (showAdd) {
      api.get<PagedResult<Patient>>('/patients?page=1&pageSize=100').then((res) => setPatients(res.data?.items ?? [])).catch(() => setPatients([]));
    }
  }, [showAdd]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    const billed = parseFloat(form.billedAmount);
    const paid = parseFloat(form.paidAmount || '0');
    if (!form.patientId || !form.cptCode.trim() || !form.icdCode.trim() || isNaN(billed) || billed < 0) {
      setSubmitError('Please select patient, enter CPT, ICD, and a valid billed amount.');
      return;
    }
    try {
      await api.post('/billing', {
        patientId: form.patientId,
        cptCode: form.cptCode.trim(),
        icdCode: form.icdCode.trim(),
        billedAmount: billed,
        paidAmount: isNaN(paid) || paid < 0 ? 0 : paid,
      });
      setShowAdd(false);
      setForm({ patientId: '', cptCode: '', icdCode: '', billedAmount: '', paidAmount: '0' });
      load();
    } catch (err: unknown) {
      const msg = err && typeof err === 'object' && 'response' in err && (err as { response?: { data?: { error?: string } } }).response?.data?.error;
      setSubmitError(typeof msg === 'string' ? msg : 'Failed to create billing record.');
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-900">Billing</h1>
          <p className="mt-1 text-slate-600">Billing records and codes</p>
        </div>
        <button type="button" className="btn-primary flex items-center gap-2" onClick={() => setShowAdd(true)}>
          <Plus className="h-4 w-4" />
          Add billing record
        </button>
      </div>
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

      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-200 pb-4">
              <h2 className="text-lg font-semibold text-slate-900">Add billing record</h2>
              <button type="button" className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600" onClick={() => { setShowAdd(false); setSubmitError(null); }}><X className="h-5 w-5" /></button>
            </div>
            <form onSubmit={handleAdd} className="mt-4 space-y-3">
              {submitError && <p className="text-sm text-red-600">{submitError}</p>}
              <div>
                <label className="block text-sm font-medium text-slate-700">Patient *</label>
                <select required className="input-field mt-1" value={form.patientId} onChange={(e) => setForm((f) => ({ ...f, patientId: e.target.value }))}>
                  <option value="">Select patient</option>
                  {patients.map((p) => (
                    <option key={p.id} value={p.id}>{p.firstName} {p.lastName}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">CPT / HCPCS code *</label>
                <CodeLookupInput
                  type="hcpcs"
                  value={form.cptCode}
                  onChange={(code) => setForm((f) => ({ ...f, cptCode: code }))}
                  placeholder="Select or search (e.g. 99214, J3301)"
                  required
                  dropdownLabel="CPT / HCPCS codes"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">ICD-10-CM code *</label>
                <CodeLookupInput
                  type="icd10"
                  value={form.icdCode}
                  onChange={(code) => setForm((f) => ({ ...f, icdCode: code }))}
                  placeholder="Select or search by code or diagnosis"
                  required
                  dropdownLabel="ICD-10-CM codes"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Billed amount ($) *</label>
                <input type="number" step="0.01" min="0" required className="input-field mt-1" value={form.billedAmount} onChange={(e) => setForm((f) => ({ ...f, billedAmount: e.target.value }))} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Paid amount ($)</label>
                <input type="number" step="0.01" min="0" className="input-field mt-1" value={form.paidAmount} onChange={(e) => setForm((f) => ({ ...f, paidAmount: e.target.value }))} />
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
