export type LeaveStatus = 'en_attente' | 'approuvee' | 'refusee' | 'annulee';

export const LEAVE_STATUSES: readonly LeaveStatus[] = ['en_attente', 'approuvee', 'refusee', 'annulee'];

export const LEAVE_STATUS_LABELS: Record<LeaveStatus, string> = {
  en_attente: 'En attente',
  approuvee: 'Approuvée',
  refusee: 'Refusée',
  annulee: 'Annulée',
};

export const LEAVE_TYPES_STORAGE_KEY = 'leaveTypes';
export const LEAVE_REQUESTS_STORAGE_KEY = 'leaveRequests';

export const DEFAULT_LEAVE_TYPE_COLOR = '#3b82f6';

export interface LeaveType {
  id: string;
  name: string;
  color: string;
  requiresBalance: boolean;
  createdAt: string;
}

export interface LeaveRequest {
  id: string;
  employeeId: string;
  leaveTypeId: string;
  startDate: string;
  endDate: string;
  workingDays: number;
  status: LeaveStatus;
  createdAt: string;
  decidedAt?: string;
  decidedBy?: string;
  reason?: string;
}

export interface LeaveRequestInput {
  employeeId: string;
  leaveTypeId: string;
  startDate: string;
  endDate: string;
  reason?: string;
}
