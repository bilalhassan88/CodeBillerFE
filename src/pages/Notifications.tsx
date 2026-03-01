import { useEffect, useState } from 'react';
import api from '../api/client';
import PageHeader from '../components/Layout/PageHeader';
import { Messages } from '../constants/messages';

interface Notif {
  id: string;
  subject: string;
  body: string;
  type: number;
  deliveryStatus: number;
  createdAtUtc: string;
}

export default function Notifications() {
  const [items, setItems] = useState<Notif[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get<{ items: Notif[] }>('/notifications?page=1&pageSize=20')
      .then((res) => setItems(res.data.items ?? []))
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <PageHeader title={Messages.pageNotifications} description={Messages.pageNotificationsDesc} />
      <div className="card mt-8">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary-600 border-t-transparent dark:border-primary-400" />
          </div>
        ) : items.length === 0 ? (
          <p className="py-12 text-center text-slate-500 dark:text-slate-400">{Messages.emptyNotifications}</p>
        ) : (
          <ul className="divide-y divide-slate-100">
            {items.map((n) => (
              <li key={n.id} className="py-3">
                <p className="font-medium text-slate-900">{n.subject}</p>
                <p className="mt-0.5 text-sm text-slate-600">{n.body}</p>
                <p className="mt-1 text-xs text-slate-400">{new Date(n.createdAtUtc).toLocaleString()}</p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
