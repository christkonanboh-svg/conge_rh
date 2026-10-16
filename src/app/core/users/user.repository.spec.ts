import { describe, it, expect, beforeEach } from 'vitest';
import { UserRepository } from './user.repository';
import { StorageService } from '../storage/storage.service';
import { StoredUser } from '../auth/auth.models';

function makeUser(overrides: Partial<StoredUser> = {}): StoredUser {
  return {
    id: 'user-1',
    email: 'user1@test.fr',
    role: 'employe',
    passwordHash: 'hash',
    salt: 'salt',
    iterations: 100000,
    createdAt: '2026-01-01T00:00:00.000Z',
    ...overrides,
  };
}

describe('UserRepository', () => {
  let storage: StorageService;
  let repository: UserRepository;

  beforeEach(() => {
    localStorage.clear();
    storage = new StorageService();
    repository = new UserRepository(storage);
  });

  it('should return an empty list when nothing is stored', () => {
    expect(repository.list()).toEqual([]);
  });

  it('should add and list users', () => {
    repository.add(makeUser());
    repository.add(makeUser({ id: 'user-2', email: 'user2@test.fr' }));
    expect(repository.list()).toHaveLength(2);
  });

  it('should find a user by id', () => {
    repository.add(makeUser({ id: 'user-42' }));
    expect(repository.findById('user-42')?.email).toBe('user1@test.fr');
    expect(repository.findById('missing')).toBeNull();
  });

  it('should find a user by normalized email', () => {
    repository.add(makeUser({ email: 'mixed@test.fr' }));
    expect(repository.findByEmail('  MIXED@TEST.FR ')?.id).toBe('user-1');
    expect(repository.findByEmail('other@test.fr')).toBeNull();
  });

  it('should update an existing user', () => {
    repository.add(makeUser());
    const updated = makeUser({ email: 'updated@test.fr' });
    expect(repository.update(updated)).toBe(true);
    expect(repository.findById('user-1')?.email).toBe('updated@test.fr');
  });

  it('should refuse to update a missing user', () => {
    expect(repository.update(makeUser({ id: 'missing' }))).toBe(false);
  });

  it('should remove a user', () => {
    repository.add(makeUser());
    expect(repository.remove('user-1')).toBe(true);
    expect(repository.list()).toEqual([]);
    expect(repository.remove('user-1')).toBe(false);
  });

  it('should persist users via the centralized storage key', () => {
    repository.add(makeUser());
    const reloaded = new UserRepository(new StorageService());
    expect(reloaded.list()).toHaveLength(1);
    expect(storage.get<StoredUser[]>('users')).toHaveLength(1);
  });
});
