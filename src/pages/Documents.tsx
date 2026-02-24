import { useEffect, useState } from 'react';
import { Upload } from 'lucide-react';
import api from '../api/client';

interface Doc {
  id: string;
  fileName: string;
  contentType: string;
  uploadedAtUtc: string;
}

export default function Documents() {
  const [items, setItems] = useState<Doc[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get<{ items: Doc[] }>('/documents?page=1&pageSize=20')
      .then((res) => setItems(res.data.items ?? []))
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-900">Documents</h1>
          <p className="mt-1 text-slate-600">Uploaded files and records</p>
        </div>
        <button type="button" className="btn-primary flex items-center gap-2">
          <Upload className="h-4 w-4" />
          Upload
        </button>
      </div>
      <div className="card mt-8">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary-600 border-t-transparent" />
          </div>
        ) : items.length === 0 ? (
          <p className="py-12 text-center text-slate-500">No documents.</p>
        ) : (
          <ul className="divide-y divide-slate-100">
            {items.map((d) => (
              <li key={d.id} className="flex items-center justify-between py-3">
                <span className="font-medium text-slate-900">{d.fileName}</span>
                <span className="text-sm text-slate-500">
                  {new Date(d.uploadedAtUtc).toLocaleDateString()}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
