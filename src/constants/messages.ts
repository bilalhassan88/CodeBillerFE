/**
 * Reusable user-facing and validation messages across the app.
 * Use these instead of inline strings for consistency and easier updates.
 */

export const Messages = {
  // —— Generic / API ——
  errorGeneric: 'Something went wrong. Please try again.',
  errorLoad: 'Failed to load data. Please refresh the page.',
  errorLoadOptions: 'Failed to load options.',
  errorSave: 'Failed to save. Please try again.',
  errorNetwork: 'Network error. Check your connection and try again.',
  errorUnauthorized: 'Session expired or invalid. Please sign in again.',
  errorForbidden: 'You don’t have permission to do this.',

  // —— Auth ——
  authInvalidCredentials: 'Invalid email or password. Please try again.',
  authLoginFailed: 'Sign in failed. Check your email and password.',
  authSignupFailed: 'Sign up failed. Please try again.',
  authSignupOptionsFailed: 'Failed to load signup options.',
  authDefaultHint: 'Default: admin@example.com / Admin123!',

  // —— Validation (forms) ——
  validationRequired: 'This field is required.',
  validationRequiredField: (name: string) => `${name} is required.`,
  validationSelectPatient: 'Please select a patient.',
  validationSelectClinician: 'Please select a clinician.',
  validationSelectInsurance: 'Please select an insurance.',
  validationEnterAmount: 'Please enter a valid amount.',
  validationEnterDate: 'Please enter a valid date and time.',
  validationPatientClinicianDate: 'Please select patient, clinician, and date/time.',
  validationPatientCptIcdAmount: 'Please select patient, enter CPT, ICD, and a valid billed amount.',
  validationPatientInsuranceAmount: 'Please select patient, insurance, and enter a valid amount.',
  validationEmailInvalid: 'Please enter a valid email address.',
  validationPasswordMin: 'Password must be at least 8 characters.',
  validationClinicNameRequired: 'Clinic name is required.',
  validationMockPaymentRequired: 'Please confirm payment to continue.',

  // —— Empty states ——
  emptyPatients: 'No patients found.',
  emptyAppointments: 'No appointments.',
  emptyClaims: 'No claims.',
  emptyBilling: 'No billing records.',
  emptyInsurances: 'No insurances.',
  emptyEncounters: 'No encounters.',
  emptyDocuments: 'No documents.',
  emptyNotifications: 'No notifications.',
  emptyWorkQueues: 'No work queues.',
  emptyAudit: 'No audit entries.',
  emptyReports: 'No report data.',
  emptyRevenue: 'No revenue data.',
  emptyAnalytics: 'No analytics data.',

  // —— Page titles & descriptions ——
  pageDashboard: 'Dashboard',
  pageDashboardDesc: 'Overview of your practice',
  pagePatients: 'Patients',
  pagePatientsDesc: 'Manage patient demographics (HIPAA-compliant)',
  pageAppointments: 'Appointments',
  pageAppointmentsDesc: 'Schedule and manage visits',
  pageBilling: 'Billing',
  pageBillingDesc: 'Charges and billing records',
  pageClaims: 'Claims',
  pageClaimsDesc: 'Claims and submission status',
  pageRevenue: 'Revenue',
  pageRevenueDesc: 'Revenue and aging AR',
  pageReports: 'Reports',
  pageReportsDesc: 'Collection and performance reports',
  pageDocuments: 'Documents',
  pageDocumentsDesc: 'Patient and claim documents',
  pageNotifications: 'Notifications',
  pageNotificationsDesc: 'Alerts and reminders',
  pageAudit: 'Audit',
  pageAuditDesc: 'Audit log and compliance',
  pageAnalytics: 'Analytics',
  pageAnalyticsDesc: 'Appointments and billing analytics',

  // —— Actions ——
  actionAddPatient: 'Add patient',
  actionNewAppointment: 'New appointment',
  actionAddBilling: 'Add charge',
  actionNewClaim: 'New claim',
  actionSave: 'Save',
  actionCancel: 'Cancel',
  actionSignIn: 'Sign in',
  actionSigningIn: 'Signing in…',
  actionCreateAccount: 'Create account',
  actionRefresh: 'Refresh',

  // —— Pagination ——
  paginationPrevious: 'Previous',
  paginationNext: 'Next',
  paginationPage: (current: number, total: number) => `Page ${current} of ${total}`,
  paginationTotal: (count: number) => `${count} total`,

  // —— Misc ——
  notAuthenticatedWithClinic: 'Not authenticated with a clinic.',
  appName: 'Code Biller',
  appTagline: 'Healthcare Practice Management',
} as const;

export type MessagesType = typeof Messages;
