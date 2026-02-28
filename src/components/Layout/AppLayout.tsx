import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Calendar,
  FileText,
  Receipt,
  CreditCard,
  TrendingUp,
  FolderOpen,
  BarChart3,
  Bell,
  Shield,
  LogOut,
  Moon,
  Sun,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { USER_ROLE } from '../../constants/lookups';

const nav = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/patients', icon: Users, label: 'Patients' },
  { to: '/appointments', icon: Calendar, label: 'Appointments' },
  { to: '/billing', icon: Receipt, label: 'Billing' },
  { to: '/claims', icon: CreditCard, label: 'Claims' },
  { to: '/revenue', icon: TrendingUp, label: 'Revenue' },
  { to: '/documents', icon: FolderOpen, label: 'Documents' },
  { to: '/analytics', icon: BarChart3, label: 'Analytics' },
  { to: '/notifications', icon: Bell, label: 'Notifications' },
  { to: '/audit', icon: Shield, label: 'Audit', adminOnly: true },
];

export default function AppLayout() {
  const { email, logout, role } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const isAdmin = role === USER_ROLE.Admin;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="flex min-h-screen bg-surface dark:bg-dark-surface">
      <aside className="fixed left-0 top-0 z-30 flex h-full w-64 flex-col border-r border-slate-200 bg-white dark:border-slate-700 dark:bg-dark-card">
        <div className="flex h-16 items-center gap-2 border-b border-slate-200 px-5 dark:border-slate-700">
          <FileText className="h-8 w-8 text-primary-600 dark:text-primary-400" />
          <span className="font-display text-xl font-semibold text-slate-800 dark:text-slate-100">Code Biller</span>
        </div>
        <nav className="flex-1 space-y-0.5 overflow-y-auto p-3">
          {nav.map(({ to, icon: Icon, label, adminOnly }) => {
            if (adminOnly && !isAdmin) return null;
            return (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                    isActive
                      ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-dark-muted dark:hover:text-slate-100'
                  }`
                }
              >
                <Icon className="h-5 w-5 shrink-0" />
                {label}
              </NavLink>
            );
          })}
        </nav>
      </aside>
      <div className="flex flex-1 flex-col pl-64">
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-slate-200 bg-white/95 px-8 backdrop-blur dark:border-slate-700 dark:bg-dark-card/95">
          <div className="flex-1" />
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={toggleTheme}
              className="rounded-xl p-2 text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-dark-muted dark:hover:text-slate-100"
              title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>
            <span className="text-sm text-slate-600 dark:text-slate-400">{email}</span>
            <button
              type="button"
              onClick={handleLogout}
              className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-dark-muted dark:hover:text-slate-100"
            >
              <LogOut className="h-4 w-4" />
              Sign out
            </button>
          </div>
        </header>
        <main className="flex-1 p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
