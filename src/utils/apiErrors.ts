/**
 * Get a user-friendly message from an API error response.
 * Handles: { error: string } or { errors: Array<{ propertyName?, errorMessage }> } or array of errors.
 */
export function getApiErrorMessage(
  err: unknown,
  fallback = 'Something went wrong. Please try again.'
): string {
  if (err == null || typeof err !== 'object' || !('response' in err)) return fallback;
  const res = (err as { response?: { data?: unknown } }).response?.data;
  if (res == null) return fallback;
  if (typeof res === 'object' && 'error' in res && typeof (res as { error: unknown }).error === 'string') {
    return (res as { error: string }).error;
  }
  const raw = Array.isArray(res) ? res : (res as { errors?: unknown })?.errors;
  if (Array.isArray(raw) && raw.length > 0) {
    const messages = raw
      .filter((e): e is { errorMessage?: string } => e != null && typeof e === 'object')
      .map((e) => (e.errorMessage != null ? String(e.errorMessage) : ''))
      .filter(Boolean);
    return messages.length > 0 ? messages.join(' ') : fallback;
  }
  return fallback;
}
