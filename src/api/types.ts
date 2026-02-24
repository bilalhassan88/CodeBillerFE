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
