export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  expiresAt: string;
  userId: string;
  email: string;
  role: number;
  clinicId: string;
}

export interface PagedResult<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
}

export interface Patient {
  id: string;
  clinicId: string;
  mrn?: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  phone?: string;
  email?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  createdAtUtc: string;
}

/** Query params for server-side list endpoints (search, sort, pagination). */
export interface ListQueryParams {
  search?: string;
  sortBy?: string;
  sortDir?: 'asc' | 'desc';
  page?: number;
  pageSize?: number;
  [key: string]: string | number | undefined;
}

export interface Appointment {
  id: string;
  patientId: string;
  clinicianId: string;
  appointmentDateTime: string;
  status: number;
  notes?: string;
  createdAtUtc: string;
}

export interface Claim {
  id: string;
  clinicId: string;
  patientId: string;
  insuranceId: string;
  claimStatus: number;
  totalBilled: number;
  totalPaid: number;
  submittedAt?: string;
  processedAt?: string;
  createdAtUtc: string;
}

export interface AgingArResponse {
  clinicId: string;
  asOfDate: string;
  buckets: { amount0To30: number; amount31To60: number; amount61To90: number; amount90Plus: number; totalOutstanding: number };
  claims: Array<{ claimId: string; patientId: string; outstandingAmount: number; daysOutstanding: number }>;
}

export interface Insurance {
  id: string;
  clinicId: string;
  payerName: string;
  payerType: number;
}

export interface User {
  id: string;
  email: string;
  role: number;
  clinicId: string;
}

/** From GET /api/v1/lookups — coding and UI lookups aligned with backend Domain enums. */
export interface LookupItem {
  value: number;
  label: string;
}

export interface CodeLookupResult {
  code: string;
  description: string;
}

export interface PagedCodeLookupResponse {
  items: CodeLookupResult[];
  totalCount: number;
}

export interface LookupsResponse {
  userRoles: LookupItem[];
  claimStatuses: LookupItem[];
  appointmentStatuses: LookupItem[];
  payerTypes: LookupItem[];
  billingRecordStatuses: LookupItem[];
  notificationTypes: LookupItem[];
  notificationDeliveryStatuses: LookupItem[];
  paymentSources: LookupItem[];
}
