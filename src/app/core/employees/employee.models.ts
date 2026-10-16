import { UserRole } from '../auth/auth.models';

export const TEAMS_STORAGE_KEY = 'teams';

export interface Team {
  id: string;
  name: string;
  createdAt: string;
}

export interface EmployeeProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  teamId: string | null;
  managerId: string | null;
}

export interface EmployeeInput {
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  teamId: string | null;
  managerId: string | null;
  password: string;
}

export const MANAGER_ROLES: readonly UserRole[] = ['manager', 'rh'];

export function isManagerRole(role: UserRole): boolean {
  return MANAGER_ROLES.includes(role);
}
