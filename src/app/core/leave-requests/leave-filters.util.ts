import { StoredUser } from '../auth/auth.models';
import { LeaveRequest, LeaveStatus } from './leave-request.models';

export interface LeaveRequestFilters {
  status?: LeaveStatus | '';
  leaveTypeId?: string;
  startDate?: string;
  endDate?: string;
  employeeId?: string;
  search?: string;
}

const isSet = (value: string | undefined): value is string => !!value && value.trim().length > 0;

export function applyLeaveFilters(
  requests: LeaveRequest[],
  filters: LeaveRequestFilters,
  employees: StoredUser[]
): LeaveRequest[] {
  const byId = new Map(employees.map((employee) => [employee.id, employee]));
  const search = filters.search?.trim().toLowerCase() ?? '';

  return requests.filter((request) => {
    if (isSet(filters.status) && request.status !== filters.status) {
      return false;
    }

    if (isSet(filters.leaveTypeId) && request.leaveTypeId !== filters.leaveTypeId) {
      return false;
    }

    if (isSet(filters.employeeId) && request.employeeId !== filters.employeeId) {
      return false;
    }

    if (isSet(filters.startDate) && request.endDate < filters.startDate) {
      return false;
    }

    if (isSet(filters.endDate) && request.startDate > filters.endDate) {
      return false;
    }

    if (search.length > 0) {
      const employee = byId.get(request.employeeId);
      const haystack = employee
        ? `${employee.firstName ?? ''} ${employee.lastName ?? ''} ${employee.email}`.toLowerCase()
        : '';
      if (!haystack.includes(search)) {
        return false;
      }
    }

    return true;
  });
}
