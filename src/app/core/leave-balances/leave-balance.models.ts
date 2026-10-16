export const LEAVE_BALANCES_STORAGE_KEY = 'leaveBalances';

export interface LeaveBalance {
  id: string;
  employeeId: string;
  leaveTypeId: string;
  year: number;
  allowance: number;
}

export interface LeaveBalanceSummary {
  employeeId: string;
  leaveTypeId: string;
  year: number;
  allowance: number;
  used: number;
  remaining: number;
}
