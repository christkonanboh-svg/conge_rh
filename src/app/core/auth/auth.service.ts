import { computed, Injectable, signal } from '@angular/core';
import { StorageService } from '../storage/storage.service';
import { PasswordHasher } from './password-hasher';
import { AuthResult, HashedPasswordInput, PublicUser, Session, StoredUser, UserRole } from './auth.models';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly usersKey = 'users';
  private readonly sessionKey = 'session';
  private readonly demoSeededKey = 'demo_seeded';

  private readonly _currentUser = signal<PublicUser | null>(null);

  readonly currentUser = this._currentUser.asReadonly();
  readonly isAuthenticated = computed(() => this._currentUser() !== null);

  constructor(
    private readonly storage: StorageService,
    private readonly hasher: PasswordHasher
  ) {
    this.restoreSession();
  }

  private get users(): StoredUser[] {
    const users = this.storage.get<StoredUser[]>(this.usersKey);
    return Array.isArray(users) ? users : [];
  }

  private setUsers(users: StoredUser[]): void {
    this.storage.set(this.usersKey, users);
  }

  private getSession(): Session | null {
    return this.storage.get<Session>(this.sessionKey);
  }

  private setSession(session: Session | null): void {
    if (session) {
      this.storage.set(this.sessionKey, session);
    } else {
      this.storage.remove(this.sessionKey);
    }
  }

  async register(email: string, password: string, role: UserRole = 'employe'): Promise<AuthResult> {
    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail || password.length < 4) {
      return { success: false, error: 'Données d\'inscription invalides' };
    }

    const existing = this.users.find((u) => u.email === normalizedEmail);
    if (existing) {
      return { success: false, error: 'Cet identifiant existe déjà' };
    }

    const hashed = await this.hasher.hash(password);
    const newUser: StoredUser = {
      id: crypto.randomUUID(),
      email: normalizedEmail,
      role,
      passwordHash: hashed.hash,
      salt: hashed.salt,
      iterations: hashed.iterations,
      createdAt: new Date().toISOString(),
    };

    const users = [...this.users, newUser];
    this.setUsers(users);

    const publicUser: PublicUser = { id: newUser.id, email: newUser.email, role: newUser.role };
    this.createSession(newUser.id);
    this._currentUser.set(publicUser);

    return { success: true, user: publicUser };
  }

  async login(email: string, password: string): Promise<AuthResult> {
    const normalizedEmail = email.trim().toLowerCase();
    const user = this.users.find((u) => u.email === normalizedEmail);
    if (!user) {
      return { success: false, error: 'Identifiants incorrects' };
    }

    const storedHash: HashedPasswordInput = {
      hash: user.passwordHash,
      salt: user.salt,
      iterations: user.iterations,
      algorithm: 'PBKDF2',
    };

    const isValid = await this.hasher.verify(password, storedHash);
    if (!isValid) {
      return { success: false, error: 'Identifiants incorrects' };
    }

    const publicUser: PublicUser = { id: user.id, email: user.email, role: user.role };
    this.createSession(user.id);
    this._currentUser.set(publicUser);

    return { success: true, user: publicUser };
  }

  logout(): void {
    this.setSession(null);
    this._currentUser.set(null);
  }

  private createSession(userId: string): void {
    this.setSession({
      userId,
      issuedAt: new Date().toISOString(),
    });
  }

  private restoreSession(): void {
    const session = this.getSession();
    if (!session) {
      return;
    }
    const user = this.users.find((u) => u.id === session.userId);
    if (!user) {
      this.setSession(null);
      return;
    }
    this._currentUser.set({
      id: user.id,
      email: user.email,
      role: user.role,
    });
  }

  async seedDemoAccounts(): Promise<void> {
    const users = this.users;
    if (users.length > 0) {
      this.storage.set(this.demoSeededKey, true);
      return;
    }

    const demoAccounts = this.getDemoCredentials();

    const seeded: StoredUser[] = [];
    for (const account of demoAccounts) {
      const hashed = await this.hasher.hash(account.password);
      seeded.push({
        id: crypto.randomUUID(),
        email: account.email,
        role: account.role,
        passwordHash: hashed.hash,
        salt: hashed.salt,
        iterations: hashed.iterations,
        createdAt: new Date().toISOString(),
      });
    }
    this.setUsers(seeded);
    this.storage.set(this.demoSeededKey, true);
  }

  isSeeded(): boolean {
    return this.users.length > 0;
  }

  getDemoCredentials(): Array<{ email: string; password: string; role: UserRole }> {
    return [
      { email: 'employe@demo.local', password: 'demo1234', role: 'employe' },
      { email: 'manager@demo.local', password: 'demo1234', role: 'manager' },
      { email: 'rh@demo.local', password: 'demo1234', role: 'rh' },
    ];
  }

  ensureSeed(): Promise<void> {
    return this.seedDemoAccounts();
  }
}
