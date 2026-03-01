import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { FileText } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Messages } from '../constants/messages';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname ?? '/';

  if (isAuthenticated) {
    navigate(from, { replace: true });
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate(from, { replace: true });
    } catch (err: unknown) {
      const msg = err && typeof err === 'object' && 'response' in err
        ? (err as { response?: { data?: { error?: string } } }).response?.data?.error
        : Messages.authLoginFailed;
      setError(msg ?? Messages.authLoginFailed);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 via-primary-50/30 to-slate-100 px-4 dark:from-slate-900 dark:via-slate-900 dark:to-dark-surface">
      <div className="w-full max-w-md">
        <div className="card text-center">
          <div className="mb-8 flex justify-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-600 text-white shadow-glow dark:bg-primary-500">
              <FileText className="h-8 w-8" />
            </div>
          </div>
          <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-slate-100">{Messages.appName}</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{Messages.appTagline}</p>
          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            {error && (
              <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-900/30 dark:text-red-300">{error}</div>
            )}
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-field"
              required
              autoComplete="email"
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-field"
              required
              autoComplete="current-password"
            />
            <button type="submit" className="btn-primary w-full" disabled={loading}>
              {loading ? Messages.actionSigningIn : Messages.actionSignIn}
            </button>
          </form>
          <p className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
            {Messages.authDefaultHint} —{' '}
            <Link to="/signup" className="font-medium text-primary-600 hover:underline dark:text-primary-400">
              {Messages.actionCreateAccount}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
