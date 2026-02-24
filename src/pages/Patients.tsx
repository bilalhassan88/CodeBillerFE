import { useEffect, useState } from 'react';
import { Plus, Search, X } from 'lucide-react';
import api from '../api/client';
import type { PagedResult, Patient } from '../api/types';
import { useAuth } from '../context/AuthContext';

export default function Patients() {
  const { clinicId } = useAuth();
  const [data, setData] = useState<PagedResult<Patient> | null>(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    phone: '',
    email: '',
    addressLine1: '',
    city: '',
    state: '',
    zipCode: '',
  });

  const load = () => {
    setLoading(true);
    api.get<PagedResult<Patient>>(`/patients?page=${page}&pageSize=10`)
      .then((res) => setData(res.data))
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, [page]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    if (!clinicId) {
      setSubmitError('Not authenticated with a clinic.');
      return;
    }
    const dateOfBirth = form.dateOfBirth ? new Date(form.dateOfBirth) : new Date();
    try {
      await api.post('/patients', {
        clinicId,
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        dateOfBirth: dateOfBirth.toISOString(),
        phone: form.phone.trim() || undefined,
        email: form.email.trim() || undefined,
        addressLine1: form.addressLine1.trim() || undefined,
        city: form.city.trim() || undefined,
        state: form.state.trim() || undefined,
        zipCode: form.zipCode.trim() || undefined,
      });
      setShowAdd(false);
      setForm({ firstName: '', lastName: '', dateOfBirth: '', phone: '', email: '', addressLine1: '', city: '', state: '', zipCode: '' });
      load();
    } catch (err: unknown) {
      const msg = err && typeof err === 'object' && 'response' in err && (err as { response?: { data?: { error?: string } } }).response?.data?.error;
      setSubmitError(msg ?? 'Failed to add patient.');
    }
  };

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
        <button type="button" className="btn-primary flex items-center gap-2" onClick={() => setShowAdd(true)}>
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
                  <button type="button" className="btn-secondary" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>Previous</button>
                  <button type="button" className="btn-secondary" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>Next</button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-200 pb-4">
              <h2 className="text-lg font-semibold text-slate-900">Add patient</h2>
              <button type="button" className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600" onClick={() => { setShowAdd(false); setSubmitError(null); }}><X className="h-5 w-5" /></button>
            </div>
            <form onSubmit={handleAdd} className="mt-4 space-y-3">
              {submitError && <p className="text-sm text-red-600">{submitError}</p>}
              <div>
                <label className="block text-sm font-medium text-slate-700">First name *</label>
                <input type="text" required className="input-field mt-1" value={form.firstName} onChange={(e) => setForm((f) => ({ ...f, firstName: e.target.value }))} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Last name *</label>
                <input type="text" required className="input-field mt-1" value={form.lastName} onChange={(e) => setForm((f) => ({ ...f, lastName: e.target.value }))} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Date of birth *</label>
                <input type="date" required className="input-field mt-1" value={form.dateOfBirth} onChange={(e) => setForm((f) => ({ ...f, dateOfBirth: e.target.value }))} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Phone</label>
                <input type="tel" className="input-field mt-1" value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Email</label>
                <input type="email" className="input-field mt-1" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Address</label>
                <input type="text" className="input-field mt-1" placeholder="Street" value={form.addressLine1} onChange={(e) => setForm((f) => ({ ...f, addressLine1: e.target.value }))} />
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-sm font-medium text-slate-700">City</label>
                  <input type="text" className="input-field mt-1" value={form.city} onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700">State</label>
                  <input type="text" className="input-field mt-1" value={form.state} onChange={(e) => setForm((f) => ({ ...f, state: e.target.value }))} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700">ZIP</label>
                  <input type="text" className="input-field mt-1" value={form.zipCode} onChange={(e) => setForm((f) => ({ ...f, zipCode: e.target.value }))} />
                </div>
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
