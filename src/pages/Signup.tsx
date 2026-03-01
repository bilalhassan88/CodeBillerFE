import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FileText, Building2, User, Layers, CreditCard, Check } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../api/client';
import type {
  LookupsResponse,
  SignupRequest,
  SignupPlanOption,
  SignupAddOnOption,
  LookupItem,
} from '../api/types';

const DEFAULT_TIMEZONE = 'America/New_York';

export default function Signup() {
  const [step, setStep] = useState(1);
  const [lookups, setLookups] = useState<LookupsResponse | null>(null);
  const [loadingLookups, setLoadingLookups] = useState(true);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const [clinicName, setClinicName] = useState('');
  const [timezone, setTimezone] = useState(DEFAULT_TIMEZONE);
  const [adminEmail, setAdminEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<number>(0);
  const [plan, setPlan] = useState<string>('');
  const [addOns, setAddOns] = useState<string[]>([]);
  const [mockPaymentConfirmed, setMockPaymentConfirmed] = useState(false);

  const { signup, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    api
      .get<LookupsResponse>('/lookups')
      .then((res) => {
        setLookups(res.data);
        if (res.data.userRoles?.length) setRole((res.data.userRoles[0] as LookupItem).value);
        if (res.data.signupPlans?.length) setPlan(res.data.signupPlans[0].value);
      })
      .catch(() => setError('Failed to load signup options.'))
      .finally(() => setLoadingLookups(false));
  }, []);

  if (isAuthenticated) {
    navigate('/', { replace: true });
    return null;
  }

  const handleAddOnToggle = (value: string) => {
    setAddOns((prev) =>
      prev.includes(value) ? prev.filter((x) => x !== value) : [...prev, value]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const payload: SignupRequest = {
        clinicName: clinicName.trim(),
        timezone: timezone.trim() || undefined,
        adminEmail: adminEmail.trim(),
        password,
        role,
        plan: plan || 'FrontOffice',
        addOnModules: addOns.length > 0 ? addOns : undefined,
        mockPaymentConfirmed,
      };
      await signup(payload);
      navigate('/', { replace: true });
    } catch (err: unknown) {
      const res = err && typeof err === 'object' && 'response' in err ? (err as { response?: { data?: { error?: string } } }).response : undefined;
      const msg = res?.data?.error ?? (Array.isArray((res?.data as { errors?: unknown[] })?.errors)
        ? (res?.data as { errors?: { ErrorMessage?: string }[] }).errors?.[0]?.ErrorMessage
        : 'Signup failed.');
      setError(msg ?? 'Signup failed. Try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const steps = [
    { n: 1, label: 'Clinic', icon: Building2 },
    { n: 2, label: 'Your account', icon: User },
    { n: 3, label: 'Plan & modules', icon: Layers },
    { n: 4, label: 'Payment', icon: CreditCard },
  ];

  if (loadingLookups || !lookups) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 via-primary-50/30 to-slate-100 dark:from-slate-900 dark:via-slate-900 dark:to-dark-surface">
        <div className="text-slate-600 dark:text-slate-400">Loading…</div>
      </div>
    );
  }

  const plans = lookups.signupPlans ?? [];
  const addOnOptions = lookups.signupAddOns ?? [];
  const userRoles = lookups.userRoles ?? [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-primary-50/30 to-slate-100 px-4 py-8 dark:from-slate-900 dark:via-slate-900 dark:to-dark-surface">
      <div className="mx-auto max-w-2xl">
        <div className="mb-8 flex justify-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-600 text-white shadow-glow dark:bg-primary-500">
            <FileText className="h-8 w-8" />
          </div>
        </div>
        <h1 className="font-display text-center text-2xl font-bold text-slate-900 dark:text-slate-100">
          Code Biller — Sign up
        </h1>
        <p className="mt-1 text-center text-sm text-slate-500 dark:text-slate-400">
          Create your clinic and choose your modules
        </p>

        <div className="mt-6 flex justify-center gap-2">
          {steps.map(({ n, label, icon: Icon }) => (
            <button
              key={n}
              type="button"
              onClick={() => setStep(n)}
              className={`flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-medium transition ${
                step === n
                  ? 'bg-primary-600 text-white dark:bg-primary-500'
                  : 'bg-white text-slate-600 dark:bg-dark-card dark:text-slate-400'
              }`}
            >
              <Icon className="h-4 w-4" />
              {label}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="card mt-6 space-y-6">
          {error && (
            <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-900/30 dark:text-red-300">
              {error}
            </div>
          )}

          {step === 1 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-200">Clinic details</h2>
              <label className="block">
                <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Clinic name</span>
                <input
                  type="text"
                  value={clinicName}
                  onChange={(e) => setClinicName(e.target.value)}
                  className="input-field mt-1 w-full"
                  placeholder="e.g. Main Street Family Practice"
                  required
                />
              </label>
              <label className="block">
                <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Timezone (optional)</span>
                <input
                  type="text"
                  value={timezone}
                  onChange={(e) => setTimezone(e.target.value)}
                  className="input-field mt-1 w-full"
                  placeholder="America/New_York"
                />
              </label>
              <button type="button" onClick={() => setStep(2)} className="btn-primary">
                Next — Your account
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-200">Your account</h2>
              <label className="block">
                <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Email</span>
                <input
                  type="email"
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  className="input-field mt-1 w-full"
                  required
                  autoComplete="email"
                />
              </label>
              <label className="block">
                <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Password (min 8 characters)</span>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-field mt-1 w-full"
                  required
                  minLength={8}
                  autoComplete="new-password"
                />
              </label>
              <label className="block">
                <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Your role</span>
                <select
                  value={role}
                  onChange={(e) => setRole(Number(e.target.value))}
                  className="input-field mt-1 w-full"
                >
                  {userRoles.map((r) => (
                    <option key={r.value} value={r.value}>
                      {r.label}
                    </option>
                  ))}
                </select>
              </label>
              <div className="flex gap-2">
                <button type="button" onClick={() => setStep(1)} className="btn-secondary">
                  Back
                </button>
                <button type="button" onClick={() => setStep(3)} className="btn-primary">
                  Next — Plan & modules
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-200">Plan & modules</h2>
              <div>
                <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Base plan</span>
                <div className="mt-2 grid gap-2 sm:grid-cols-2">
                  {plans.map((p: SignupPlanOption) => (
                    <label
                      key={p.value}
                      className={`flex cursor-pointer flex-col rounded-xl border-2 p-3 transition ${
                        plan === p.value
                          ? 'border-primary-600 bg-primary-50 dark:border-primary-500 dark:bg-primary-900/20'
                          : 'border-slate-200 dark:border-slate-600'
                      }`}
                    >
                      <input
                        type="radio"
                        name="plan"
                        value={p.value}
                        checked={plan === p.value}
                        onChange={() => setPlan(p.value)}
                        className="sr-only"
                      />
                      <span className="font-medium text-slate-800 dark:text-slate-200">{p.label}</span>
                      <span className="mt-1 text-xs text-slate-500 dark:text-slate-400">{p.description}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Optional add-ons</span>
                <div className="mt-2 flex flex-wrap gap-3">
                  {addOnOptions.map((a: SignupAddOnOption) => (
                    <label key={a.value} className="flex cursor-pointer items-center gap-2">
                      <input
                        type="checkbox"
                        checked={addOns.includes(a.value)}
                        onChange={() => handleAddOnToggle(a.value)}
                        className="rounded border-slate-300 text-primary-600"
                      />
                      <span className="text-sm text-slate-700 dark:text-slate-300">{a.label}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="flex gap-2">
                <button type="button" onClick={() => setStep(2)} className="btn-secondary">
                  Back
                </button>
                <button type="button" onClick={() => setStep(4)} className="btn-primary">
                  Next — Payment
                </button>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-200">Payment</h2>
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-600 dark:bg-slate-800/50">
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Payment is simulated for now. In production, Stripe will be integrated here.
                </p>
                <button
                  type="button"
                  onClick={() => setMockPaymentConfirmed(true)}
                  className="mt-3 flex items-center gap-2 rounded-xl bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 dark:bg-primary-500"
                >
                  {mockPaymentConfirmed ? <Check className="h-4 w-4" /> : null}
                  {mockPaymentConfirmed ? 'Payment confirmed' : 'Pay with card (demo)'}
                </button>
              </div>
              <div className="flex gap-2">
                <button type="button" onClick={() => setStep(3)} className="btn-secondary">
                  Back
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={submitting || !mockPaymentConfirmed}
                >
                  {submitting ? 'Creating account…' : 'Complete signup'}
                </button>
              </div>
            </div>
          )}
        </form>

        <p className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-primary-600 hover:underline dark:text-primary-400">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
