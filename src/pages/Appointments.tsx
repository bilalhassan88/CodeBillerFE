import { useEffect, useState } from 'react';
import { Plus, X } from 'lucide-react';
import api from '../api/client';
import type { PagedResult, Appointment, Patient, User } from '../api/types';

export default function Appointments() {
  const [data, setData] = useState<PagedResult<Appointment> | null>(null);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [clinicians, setClinicians] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [form, setForm] = useState({ patientId: '', clinicianId: '', appointmentDateTime: '', notes: '' });

  const load = () => {
    setLoading(true);
    api.get<PagedResult<Appointment>>('/appointments?page=1&pageSize=20')
      .then((res) => setData(res.data))
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    if (showAdd) {
      api.get<PagedResult<Patient>>('/patients?page=1&pageSize=100').then((res) => setPatients(res.data?.items ?? [])).catch(() => setPatients([]));
      api.get<PagedResult<User>>('/users?role=2&pageSize=50').then((res) => setClinicians(res.data?.items ?? [])).catch(() => setClinicians([]));
    }
  }, [showAdd]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    if (!form.patientId || !form.clinicianId || !form.appointmentDateTime) {
      setSubmitError('Please select patient, clinician, and date/time.');
      return;
    }
    const dt = new Date(form.appointmentDateTime);
    try {
      await api.post('/appointments', {
        patientId: form.patientId,
        clinicianId: form.clinicianId,
        appointmentDateTime: dt.toISOString(),
        notes: form.notes.trim() || undefined,
      });
      setShowAdd(false);
      setForm({ patientId: '', clinicianId: '', appointmentDateTime: '', notes: '' });
      load();
    } catch (err: unknown) {
      const msg = err && typeof err === 'object' && 'response' in err && (err as { response?: { data?: { error?: string } } }).response?.data?.error;
      setSubmitError(msg ?? 'Failed to create appointment.');
    }
  };

  const items = data?.items ?? [];
  const statusLabel = (s: number) => (s === 0 ? 'Scheduled' : s === 1 ? 'Canceled' : 'Completed');

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-900">Appointments</h1>
          <p className="mt-1 text-slate-600">Schedule and manage visits</p>
        </div>
        <button type="button" className="btn-primary flex items-center gap-2" onClick={() => setShowAdd(true)}>
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
                    <td className="py-3 font-medium text-slate-900">{new Date(a.appointmentDateTime).toLocaleString()}</td>
                    <td className="py-3">
                      <span className="rounded-full bg-primary-100 px-2 py-0.5 text-xs font-medium text-primary-700">{statusLabel(a.status)}</span>
                    </td>
                    <td className="py-3 text-slate-600">{a.notes ?? '—'}</td>
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
              <h2 className="text-lg font-semibold text-slate-900">New appointment</h2>
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
                <label className="block text-sm font-medium text-slate-700">Clinician *</label>
                <select required className="input-field mt-1" value={form.clinicianId} onChange={(e) => setForm((f) => ({ ...f, clinicianId: e.target.value }))}>
                  <option value="">Select clinician</option>
                  {clinicians.map((u) => (
                    <option key={u.id} value={u.id}>{u.email}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Date & time *</label>
                <input type="datetime-local" required className="input-field mt-1" value={form.appointmentDateTime} onChange={(e) => setForm((f) => ({ ...f, appointmentDateTime: e.target.value }))} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Notes</label>
                <textarea className="input-field mt-1" rows={2} value={form.notes} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} />
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
