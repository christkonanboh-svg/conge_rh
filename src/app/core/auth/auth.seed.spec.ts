import { describe, it, expect, beforeEach } from 'vitest';
import { AuthService } from './auth.service';
import { StorageService } from '../storage/storage.service';
import { PasswordHasher } from './password-hasher';
import { StoredUser } from './auth.models';

describe('AuthService - seed', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('should seed demo accounts on first launch if no accounts exist', async () => {
    const storage = new StorageService();
    const hasher = new PasswordHasher();
    const auth = new AuthService(storage, hasher);

    await auth.seedDemoAccounts();

    const loginResult = await auth.login('employe@demo.local', 'demo1234');
    expect(loginResult.success).toBe(true);
    expect(auth.currentUser()?.role).toBe('employe');

    const managerResult = await auth.login('manager@demo.local', 'demo1234');
    expect(managerResult.success).toBe(true);
    expect(auth.currentUser()?.role).toBe('manager');

    const rhResult = await auth.login('rh@demo.local', 'demo1234');
    expect(rhResult.success).toBe(true);
    expect(auth.currentUser()?.role).toBe('rh');
  });

  it('should not reseed if accounts already exist', async () => {
    const storage = new StorageService();
    const hasher = new PasswordHasher();
    const auth1 = new AuthService(storage, hasher);

    await auth1.register('user1@test.fr', 'password123');
    const userCount1 = (storage.get<StoredUser[]>('users') ?? []).length;

    const auth2 = new AuthService(storage, hasher);
    await auth2.seedDemoAccounts();

    const userCount2 = (storage.get<StoredUser[]>('users') ?? []).length;
    expect(userCount2).toBe(userCount1);
  });

  it('should hash demo account passwords', async () => {
    const storage = new StorageService();
    const hasher = new PasswordHasher();
    const auth = new AuthService(storage, hasher);

    await auth.seedDemoAccounts();

    const users = storage.get<StoredUser[]>('users');
    expect(users).toBeDefined();
    expect(Array.isArray(users)).toBe(true);
    expect(users!.length).toBeGreaterThan(0);
    expect(users![0].passwordHash).toBeDefined();
    expect(users![0].salt).toBeDefined();
    expect(users![0].passwordHash).not.toBe('demo1234');
    users!.forEach((user) => {
      expect(user.passwordHash).not.toBe('demo1234');
      expect(user.salt).toBeTruthy();
    });
  });
});
