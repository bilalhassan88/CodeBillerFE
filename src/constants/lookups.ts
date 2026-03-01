/**
 * Coding and UI lookups — mirror backend Domain enums (HealthcarePracticeApi.Domain.Common).
 * Use these instead of hardcoded numbers/strings. For dynamic values, consider fetching from GET /api/v1/lookups.
 */

/** UserRole — align with backend Domain.Common.UserRole (0=Admin, 1=Biller, 2=Provider, 3=Auditor, 4=Staff, 5=Clinician). */
export const USER_ROLE = {
  Admin: 0,
  Biller: 1,
  Provider: 2,
  Auditor: 3,
  Staff: 4,
  Clinician: 5,
} as const;
export type UserRoleValue = (typeof USER_ROLE)[keyof typeof USER_ROLE];

export const USER_ROLE_LABELS: Record<number, string> = {
  [USER_ROLE.Admin]: 'Admin',
  [USER_ROLE.Biller]: 'Biller',
  [USER_ROLE.Provider]: 'Provider',
  [USER_ROLE.Auditor]: 'Auditor',
  [USER_ROLE.Staff]: 'Staff',
  [USER_ROLE.Clinician]: 'Clinician',
};

/** ClaimStatus */
export const CLAIM_STATUS = {
  Created: 0,
  Submitted: 1,
  Denied: 2,
  Paid: 3,
  PartiallyPaid: 4,
} as const;

export const CLAIM_STATUS_LABELS: Record<number, string> = {
  [CLAIM_STATUS.Created]: 'Created',
  [CLAIM_STATUS.Submitted]: 'Submitted',
  [CLAIM_STATUS.Denied]: 'Denied',
  [CLAIM_STATUS.Paid]: 'Paid',
  [CLAIM_STATUS.PartiallyPaid]: 'Partially Paid',
};

/** AppointmentStatus */
export const APPOINTMENT_STATUS = {
  Scheduled: 0,
  Canceled: 1,
  Completed: 2,
} as const;

export const APPOINTMENT_STATUS_LABELS: Record<number, string> = {
  [APPOINTMENT_STATUS.Scheduled]: 'Scheduled',
  [APPOINTMENT_STATUS.Canceled]: 'Canceled',
  [APPOINTMENT_STATUS.Completed]: 'Completed',
};

/** PayerType */
export const PAYER_TYPE = {
  Insurance: 0,
  Patient: 1,
  Government: 2,
} as const;

export const PAYER_TYPE_LABELS: Record<number, string> = {
  [PAYER_TYPE.Insurance]: 'Insurance',
  [PAYER_TYPE.Patient]: 'Patient',
  [PAYER_TYPE.Government]: 'Government',
};

/** BillingRecordStatus */
export const BILLING_RECORD_STATUS = {
  Pending: 0,
  Submitted: 1,
  Paid: 2,
  PartiallyPaid: 3,
  Denied: 4,
} as const;

export const BILLING_RECORD_STATUS_LABELS: Record<number, string> = {
  [BILLING_RECORD_STATUS.Pending]: 'Pending',
  [BILLING_RECORD_STATUS.Submitted]: 'Submitted',
  [BILLING_RECORD_STATUS.Paid]: 'Paid',
  [BILLING_RECORD_STATUS.PartiallyPaid]: 'Partially Paid',
  [BILLING_RECORD_STATUS.Denied]: 'Denied',
};

/** NotificationType */
export const NOTIFICATION_TYPE = {
  Email: 0,
  Sms: 1,
} as const;

export const NOTIFICATION_TYPE_LABELS: Record<number, string> = {
  [NOTIFICATION_TYPE.Email]: 'Email',
  [NOTIFICATION_TYPE.Sms]: 'SMS',
};

/** NotificationDeliveryStatus */
export const NOTIFICATION_DELIVERY_STATUS = {
  Pending: 0,
  Sent: 1,
  Failed: 2,
  Delivered: 3,
  DeadLetter: 4,
} as const;

export const NOTIFICATION_DELIVERY_STATUS_LABELS: Record<number, string> = {
  [NOTIFICATION_DELIVERY_STATUS.Pending]: 'Pending',
  [NOTIFICATION_DELIVERY_STATUS.Sent]: 'Sent',
  [NOTIFICATION_DELIVERY_STATUS.Failed]: 'Failed',
  [NOTIFICATION_DELIVERY_STATUS.Delivered]: 'Delivered',
  [NOTIFICATION_DELIVERY_STATUS.DeadLetter]: 'Dead letter',
};

/** PaymentSource */
export const PAYMENT_SOURCE = {
  Insurance: 0,
  Patient: 1,
} as const;

export const PAYMENT_SOURCE_LABELS: Record<number, string> = {
  [PAYMENT_SOURCE.Insurance]: 'Insurance',
  [PAYMENT_SOURCE.Patient]: 'Patient',
};

/** Helpers */
export function getClaimStatusLabel(value: number): string {
  return CLAIM_STATUS_LABELS[value] ?? String(value);
}
export function getAppointmentStatusLabel(value: number): string {
  return APPOINTMENT_STATUS_LABELS[value] ?? String(value);
}
export function getPayerTypeLabel(value: number): string {
  return PAYER_TYPE_LABELS[value] ?? String(value);
}
export function getBillingRecordStatusLabel(value: number): string {
  return BILLING_RECORD_STATUS_LABELS[value] ?? String(value);
}
export function getUserRoleLabel(value: number): string {
  return USER_ROLE_LABELS[value] ?? String(value);
}
