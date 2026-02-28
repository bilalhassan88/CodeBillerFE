import { useCallback, useEffect, useRef, useState } from 'react';
import api from '../api/client';
import type { PagedResult } from '../api/types';

const DEFAULT_PAGE_SIZE = 20;
const SEARCH_DEBOUNCE_MS = 300;
const EMPTY_PARAMS: Record<string, string | number | undefined> = {};

/**
 * Builds a query string from params (excludes undefined/empty).
 * Used for server-side list endpoints with search, sort, filters, pagination.
 */
export function buildListQueryString(params: Record<string, string | number | undefined>): string {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === '' || (typeof value === 'number' && Number.isNaN(value))) return;
    search.set(key, String(value));
  });
  const q = search.toString();
  return q ? `?${q}` : '';
}

export interface UseListQueryOptions {
  endpoint: string;
  defaultPageSize?: number;
  debounceSearchMs?: number;
  /** Extra query params (e.g. patientId, status) merged into every request. */
  extraParams?: Record<string, string | number | undefined>;
}

export interface UseListQueryResult<T> {
  data: PagedResult<T> | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
  /** Current page (1-based). */
  page: number;
  setPage: (p: number) => void;
  pageSize: number;
  setPageSize: (n: number) => void;
  search: string;
  setSearch: (s: string) => void;
  sortBy: string;
  setSortBy: (s: string) => void;
  sortDir: 'asc' | 'desc';
  setSortDir: (d: 'asc' | 'desc') => void;
  /** Total count from last response. */
  totalCount: number;
  /** Applied filters (e.g. patientId, status) - merge with setFilters. */
  filters: Record<string, string | number | undefined>;
  setFilters: (f: Record<string, string | number | undefined> | ((prev: Record<string, string | number | undefined>) => Record<string, string | number | undefined>)) => void;
}

/**
 * Hook for server-side list pages: pagination, search (debounced), sort, and optional filters.
 * Keeps backend and frontend in sync; all list requests go to the API with current params.
 */
export function useListQuery<T>(options: UseListQueryOptions): UseListQueryResult<T> {
  const {
    endpoint,
    defaultPageSize = DEFAULT_PAGE_SIZE,
    debounceSearchMs = SEARCH_DEBOUNCE_MS,
    extraParams = EMPTY_PARAMS,
  } = options;

  const [data, setData] = useState<PagedResult<T> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(defaultPageSize);
  const [search, setSearchState] = useState('');
  const [searchDebounced, setSearchDebounced] = useState('');
  const [sortBy, setSortBy] = useState('');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [filters, setFilters] = useState<Record<string, string | number | undefined>>({});
  const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    if (debounceSearchMs <= 0) {
      setSearchDebounced(search);
      return;
    }
    debounceRef.current = setTimeout(() => setSearchDebounced(search), debounceSearchMs);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [search, debounceSearchMs]);

  const refetch = useCallback(() => {
    setLoading(true);
    setError(null);
    const params: Record<string, string | number | undefined> = {
      page,
      pageSize,
      ...extraParams,
      ...filters,
    };
    if (searchDebounced.trim()) params.search = searchDebounced.trim();
    if (sortBy) params.sortBy = sortBy;
    if (sortDir) params.sortDir = sortDir;
    const query = buildListQueryString(params);
    const url = endpoint.startsWith('/') ? endpoint : endpoint;
    api.get<PagedResult<T>>(`${url}${query}`)
      .then((res) => setData(res.data))
      .catch((err) => setError(err?.response?.data?.error ?? err?.message ?? 'Failed to load'))
      .finally(() => setLoading(false));
  }, [endpoint, page, pageSize, searchDebounced, sortBy, sortDir, extraParams, filters]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  // Reset to page 1 when search or filters change
  useEffect(() => {
    setPage(1);
  }, [searchDebounced, sortBy, sortDir]);

  return {
    data,
    loading,
    error,
    refetch,
    page,
    setPage,
    pageSize,
    setPageSize,
    search,
    setSearch: setSearchState,
    sortBy,
    setSortBy,
    sortDir,
    setSortDir,
    totalCount: data?.totalCount ?? 0,
    filters,
    setFilters,
  };
}
