export type UserRole = 'employe' | 'manager' | 'rh';

export const USER_ROLES: readonly UserRole[] = ['employe', 'manager', 'rh'];

export const USER_ROLE_LABELS: Record<UserRole, string> = {
  employe: 'Employé',
  manager: 'Manager',
  rh: 'RH/Admin',
};

export interface StoredUser {
  id: string;
  email: string;
  role: UserRole;
  passwordHash: string;
  salt: string;
  iterations: number;
  createdAt: string;
}

export interface Session {
  userId: string;
  issuedAt: string;
}

export interface PublicUser {
  id: string;
  email: string;
  role: UserRole;
}

export interface AuthResult {
  success: boolean;
  error?: string;
  user?: PublicUser;
}

export interface HashedPasswordInput {
  hash: string;
  salt: string;
  iterations: number;
  algorithm: 'PBKDF2';
}
