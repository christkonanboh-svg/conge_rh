import { describe, it, expect, beforeEach } from 'vitest';
import { AuthService } from './auth.service';
import { StorageService } from '../storage/storage.service';
import { PasswordHasher } from './password-hasher';

describe('AuthService', () => {
  let authService: AuthService;
  let storage: StorageService;
  let hasher: PasswordHasher;

  beforeEach(() => {
    localStorage.clear();
    storage = new StorageService();
    hasher = new PasswordHasher();
    authService = new AuthService(storage, hasher);
  });

  it('should register and login user', async () => {
    const registerResult = await authService.register('test@demo.fr', 'password123');
    expect(registerResult.success).toBe(true);
    expect(authService.isAuthenticated()).toBe(true);

    authService.logout();
    expect(authService.isAuthenticated()).toBe(false);

    const loginResult = await authService.login('test@demo.fr', 'password123');
    expect(loginResult.success).toBe(true);
    expect(authService.isAuthenticated()).toBe(true);
  });

  it('should reject login with wrong password', async () => {
    await authService.register('test@demo.fr', 'password123');
    authService.logout();

    const result = await authService.login('test@demo.fr', 'wrongpass');
    expect(result.success).toBe(false);
    expect(authService.isAuthenticated()).toBe(false);
  });

  it('should reject duplicate registration', async () => {
    await authService.register('test@demo.fr', 'password123');
    authService.logout();

    const result = await authService.register('test@demo.fr', 'password123');
    expect(result.success).toBe(false);
  });
});
