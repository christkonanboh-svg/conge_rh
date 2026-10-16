import { computed, Injectable, signal } from '@angular/core';
import { StoredUser, UserRole } from '../auth/auth.models';
import { UserRepository } from '../users/user.repository';
import { PasswordHasher } from '../auth/password-hasher';
import { EmployeeInput, EmployeeProfile, isManagerRole } from './employee.models';

export interface EmployeeMutationResult {
  success: boolean;
  error?: string;
  employee?: EmployeeProfile;
}

function toProfile(user: StoredUser): EmployeeProfile {
  return {
    id: user.id,
    email: user.email,
    firstName: user.firstName ?? '',
    lastName: user.lastName ?? '',
    role: user.role,
    teamId: user.teamId ?? null,
    managerId: user.managerId ?? null,
  };
}

@Injectable({ providedIn: 'root' })
export class EmployeeService {
  private readonly _employees = signal<EmployeeProfile[]>([]);
  readonly employees = this._employees.asReadonly();
  readonly count = computed(() => this._employees().length);

  constructor(
    private readonly userRepository: UserRepository,
    private readonly hasher: PasswordHasher
  ) {
    this.reload();
  }

  reload(): void {
    this._employees.set(this.userRepository.list().map((user) => toProfile(user)));
  }

  list(): EmployeeProfile[] {
    return this._employees();
  }

  findById(id: string): EmployeeProfile | null {
    const user = this.userRepository.findById(id);
    return user ? toProfile(user) : null;
  }

  private findUserById(id: string): StoredUser | null {
    return this.userRepository.findById(id);
  }

  async create(input: EmployeeInput): Promise<EmployeeMutationResult> {
    const email = input.email.trim().toLowerCase();
    const firstName = input.firstName.trim();
    const lastName = input.lastName.trim();
    const password = input.password;

    if (!email || !firstName || !lastName || !password) {
      return { success: false, error: "Tous les champs obligatoires doivent être renseignés" };
    }

    if (password.length < 4) {
      return { success: false, error: "Le mot de passe doit contenir au moins 4 caractères" };
    }

    if (this.userRepository.findByEmail(email)) {
      return { success: false, error: "Cet identifiant existe déjà" };
    }

    if (!input.managerId) {
      return { success: false, error: "Un manager doit être affecté à chaque employé" };
    }

    const manager = this.findUserById(input.managerId);
    if (!manager) {
      return { success: false, error: "Le manager sélectionné n'existe pas" };
    }

    if (!isManagerRole(manager.role)) {
      return { success: false, error: "Le manager doit avoir le rôle Manager ou RH/Admin" };
    }

    const hashed = await this.hasher.hash(password);
    const user: StoredUser = {
      id: crypto.randomUUID(),
      email,
      role: input.role,
      passwordHash: hashed.hash,
      salt: hashed.salt,
      iterations: hashed.iterations,
      createdAt: new Date().toISOString(),
      firstName,
      lastName,
      teamId: input.teamId ?? null,
      managerId: manager.id,
    };

    this.userRepository.add(user);
    const profile = toProfile(user);
    this.reload();
    return { success: true, employee: profile };
  }

  async update(id: string, changes: Partial<Omit<EmployeeInput, 'password'>> & { password?: string }): Promise<EmployeeMutationResult> {
    const user = this.findUserById(id);
    if (!user) {
      return { success: false, error: "L'employé n'existe pas" };
    }

    const next: StoredUser = { ...user };

    if (changes.email !== undefined) {
      const email = changes.email.trim().toLowerCase();
      if (!email) {
        return { success: false, error: "L'identifiant de connexion est obligatoire" };
      }
      const existing = this.userRepository.findByEmail(email);
      if (existing && existing.id !== id) {
        return { success: false, error: "Cet identifiant existe déjà" };
      }
      next.email = email;
    }

    if (changes.firstName !== undefined) {
      next.firstName = changes.firstName.trim();
    }
    if (changes.lastName !== undefined) {
      next.lastName = changes.lastName.trim();
    }
    if (changes.role !== undefined) {
      next.role = changes.role;
    }
    if (changes.teamId !== undefined) {
      next.teamId = changes.teamId ?? null;
    }
    if (changes.managerId !== undefined) {
      if (!changes.managerId) {
        return { success: false, error: "Un manager doit être affecté à chaque employé" };
      }
      if (changes.managerId === id) {
        return { success: false, error: "Un employé ne peut pas être son propre manager" };
      }
      const manager = this.findUserById(changes.managerId);
      if (!manager) {
        return { success: false, error: "Le manager sélectionné n'existe pas" };
      }
      if (!isManagerRole(manager.role)) {
        return { success: false, error: "Le manager doit avoir le rôle Manager ou RH/Admin" };
      }
      next.managerId = manager.id;
    } else if (next.managerId === id) {
      return { success: false, error: "Un employé ne peut pas être son propre manager" };
    }

    if (!next.email || !next.firstName || !next.lastName) {
      return { success: false, error: "Tous les champs obligatoires doivent être renseignés" };
    }

    if (changes.password !== undefined && changes.password.length > 0) {
      if (changes.password.length < 4) {
        return { success: false, error: "Le mot de passe doit contenir au moins 4 caractères" };
      }
      const hashed = await this.hasher.hash(changes.password);
      next.passwordHash = hashed.hash;
      next.salt = hashed.salt;
      next.iterations = hashed.iterations;
    }

    this.userRepository.update(next);
    this.reload();
    return { success: true, employee: toProfile(next) };
  }

  remove(id: string): boolean {
    const removed = this.userRepository.remove(id);
    if (!removed) {
      return false;
    }

    const users = this.userRepository.list();
    let changed = false;
    const updated = users.map((user) => {
      if (user.managerId === id) {
        changed = true;
        return { ...user, managerId: null };
      }
      return user;
    });

    if (changed) {
      this.userRepository.replaceAll(updated);
    }

    this.reload();
    return true;
  }

  assignManager(employeeId: string, managerId: string): EmployeeMutationResult {
    const employee = this.findUserById(employeeId);
    if (!employee) {
      return { success: false, error: "L'employé n'existe pas" };
    }
    if (!managerId) {
      return { success: false, error: "Un manager doit être affecté à chaque employé" };
    }
    if (managerId === employeeId) {
      return { success: false, error: "Un employé ne peut pas être son propre manager" };
    }
    const manager = this.findUserById(managerId);
    if (!manager) {
      return { success: false, error: "Le manager sélectionné n'existe pas" };
    }
    if (!isManagerRole(manager.role)) {
      return { success: false, error: "Le manager doit avoir le rôle Manager ou RH/Admin" };
    }

    const next: StoredUser = { ...employee, managerId: manager.id };
    this.userRepository.update(next);
    this.reload();
    return { success: true, employee: toProfile(next) };
  }
}
