import { describe, it, expect, beforeEach } from 'vitest';
import { AuthService } from './auth.service';
import { StorageService } from '../storage/storage.service';
import { PasswordHasher } from './password-hasher';

describe('AuthService - persistence', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('should restore session after reload', async () => {
    const storage1 = new StorageService();
    const hasher1 = new PasswordHasher();
    const auth1 = new AuthService(storage1, hasher1);
    
    await auth1.register('test@demo.fr', 'password123');
    expect(auth1.isAuthenticated()).toBe(true);
    const userId = auth1.currentUser()?.id;
    expect(userId).toBeDefined();
    
    // Simulate reload - create new service with same storage
    const storage2 = new StorageService();
    const hasher2 = new PasswordHasher();
    const auth2 = new AuthService(storage2, hasher2);
    
    expect(auth2.isAuthenticated()).toBe(true);
    expect(auth2.currentUser()?.email).toBe('test@demo.fr');
  });

  it('should persist accounts after reload', async () => {
    const storage1 = new StorageService();
    const hasher1 = new PasswordHasher();
    const auth1 = new AuthService(storage1, hasher1);
    
    await auth1.register('test@demo.fr', 'password123');
    auth1.logout();
    
    const storage2 = new StorageService();
    const hasher2 = new PasswordHasher();
    const auth2 = new AuthService(storage2, hasher2);
    
    const result = await auth2.login('test@demo.fr', 'password123');
    expect(result.success).toBe(true);
  });
});
