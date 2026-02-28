import { useCallback, useEffect, useRef, useState } from 'react';
import api from '../api/client';
import type { CodeLookupResult } from '../api/types';

const DEBOUNCE_MS = 300;
const PAGE_SIZE = 15;

interface CodeLookupInputProps {
  value: string;
  onChange: (code: string) => void;
  type: 'icd10' | 'hcpcs';
  placeholder?: string;
  required?: boolean;
  className?: string;
  id?: string;
  disabled?: boolean;
  /** Label for dropdown hint when empty (e.g. "ICD-10-CM codes") */
  dropdownLabel?: string;
}

export default function CodeLookupInput({
  value,
  onChange,
  type,
  placeholder,
  required,
  className = 'input-field mt-1',
  id,
  disabled,
  dropdownLabel,
}: CodeLookupInputProps) {
  const [query, setQuery] = useState(value);
  const [results, setResults] = useState<CodeLookupResult[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const containerRef = useRef<HTMLDivElement>(null);
  const queryRef = useRef(query);

  const endpoint = type === 'icd10' ? '/codes/icd10' : '/codes/hcpcs';
  const hintLabel = dropdownLabel ?? (type === 'icd10' ? 'ICD-10-CM codes' : 'CPT / HCPCS codes');

  const fetchResults = useCallback(async (q: string, pageNum: number) => {
    if (!q.trim()) {
      setResults([]);
      setTotalCount(0);
      setFetchError(null);
      return;
    }
    setLoading(true);
    setFetchError(null);
    try {
      const offset = (pageNum - 1) * PAGE_SIZE;
      const { data } = await api.get(endpoint, {
        params: { q: q.trim(), limit: PAGE_SIZE, offset },
      });
      const raw = data as { items?: CodeLookupResult[]; Items?: CodeLookupResult[]; totalCount?: number; TotalCount?: number };
      const items = raw?.items ?? raw?.Items ?? [];
      setResults(Array.isArray(items) ? items : []);
      const total = raw?.totalCount ?? raw?.TotalCount;
      setTotalCount(typeof total === 'number' ? total : 0);
      setActiveIndex(-1);
    } catch (err: unknown) {
      setResults([]);
      setTotalCount(0);
      const status = err && typeof err === 'object' && 'response' in err && typeof (err as { response?: { status?: number } }).response?.status === 'number'
        ? (err as { response: { status: number } }).response.status
        : 0;
      setFetchError(status === 401 ? 'Please log in again.' : 'Could not load codes. Try again.');
    } finally {
      setLoading(false);
    }
  }, [endpoint]);

  useEffect(() => {
    setQuery(value);
  }, [value]);

  useEffect(() => {
    queryRef.current = query;
  }, [query]);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!query.trim()) {
      setResults([]);
      setTotalCount(0);
      setPage(1);
      return;
    }
    debounceRef.current = setTimeout(() => {
      setPage(1);
      fetchResults(query, 1);
      setOpen(true);
    }, DEBOUNCE_MS);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, fetchResults]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (item: CodeLookupResult) => {
    onChange(item.code);
    setQuery(item.code);
    setOpen(false);
    setResults([]);
    setActiveIndex(-1);
  };

  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));
  const hasPaging = totalCount > PAGE_SIZE;

  const goToPage = (p: number) => {
    const next = Math.max(1, Math.min(totalPages, p));
    setPage(next);
    fetchResults(queryRef.current, next);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setOpen(false);
      setActiveIndex(-1);
      return;
    }
    if (!open || results.length === 0) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((i) => (i < results.length - 1 ? i + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((i) => (i > 0 ? i - 1 : results.length - 1));
    } else if (e.key === 'Enter' && activeIndex >= 0 && results[activeIndex]) {
      e.preventDefault();
      handleSelect(results[activeIndex]);
    } else if (e.key === 'Escape') {
      setOpen(false);
      setActiveIndex(-1);
    }
  };

  const showDropdown = open && (results.length > 0 || loading || fetchError || !query.trim());

  return (
    <div ref={containerRef} className="relative">
      <div className="relative">
        <input
          type="text"
          id={id}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          required={required}
          className={`${className} pr-9`}
          disabled={disabled}
          autoComplete="off"
          role="combobox"
          aria-expanded={!!showDropdown}
          aria-haspopup="listbox"
        />
        <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
          {loading ? (
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary-500 border-t-transparent" />
          ) : (
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          )}
        </div>
      </div>
      {showDropdown && (
        <div className="absolute z-50 mt-1 w-full overflow-hidden rounded-lg border border-slate-200 bg-white shadow-lg">
          {loading && results.length === 0 ? (
            <div className="flex items-center justify-center py-8">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary-500 border-t-transparent" />
            </div>
          ) : fetchError ? (
            <div className="px-3 py-4 text-center text-sm text-amber-700">
              {fetchError}
            </div>
          ) : results.length > 0 ? (
            <>
              <ul className="max-h-60 overflow-auto py-1" role="listbox">
                {results.map((item, i) => {
                  const code = item.code ?? (item as { Code?: string }).Code ?? '';
                  const desc = item.description ?? (item as { Description?: string }).Description ?? code;
                  return (
                  <li
                    key={`${code}-${i}`}
                    role="option"
                    aria-selected={i === activeIndex}
                    className={`cursor-pointer px-3 py-2 text-sm ${
                      i === activeIndex ? 'bg-primary-50 text-primary-800' : 'text-slate-700 hover:bg-slate-50'
                    }`}
                    onMouseEnter={() => setActiveIndex(i)}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      handleSelect({ code, description: desc });
                    }}
                  >
                    <span className="font-medium text-slate-900">{code}</span>
                    <span className="ml-2 text-slate-600">{desc}</span>
                  </li>
                  );
                })}
              </ul>
              {hasPaging && (
                <div className="flex items-center justify-between border-t border-slate-200 bg-slate-50 px-3 py-2 text-xs">
                  <span className="text-slate-600">
                    Page {page} of {totalPages} ({totalCount} total)
                  </span>
                  <div className="flex gap-1">
                    <button
                      type="button"
                      className="rounded px-2 py-1 text-slate-600 hover:bg-slate-200 disabled:opacity-50"
                      disabled={page <= 1 || loading}
                      onMouseDown={(e) => {
                        e.preventDefault();
                        goToPage(page - 1);
                      }}
                    >
                      Prev
                    </button>
                    <button
                      type="button"
                      className="rounded px-2 py-1 text-slate-600 hover:bg-slate-200 disabled:opacity-50"
                      disabled={page >= totalPages || loading}
                      onMouseDown={(e) => {
                        e.preventDefault();
                        goToPage(page + 1);
                      }}
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="px-3 py-4 text-center text-sm text-slate-500">
              {query.trim() ? `No results for "${query.trim()}". Try different words.` : `Type to search ${hintLabel}`}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
