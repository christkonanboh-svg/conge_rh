import { describe, it, expect, beforeEach } from 'vitest';
import { EmployeeService } from './employee.service';
import { UserRepository } from '../users/user.repository';
import { StorageService } from '../storage/storage.service';
import { PasswordHasher } from '../auth/password-hasher';

function seedManagers(repo: UserRepository, hasher: PasswordHasher) {
  const now = new Date().toISOString();
  return Promise.all([
    repo.add({
      id: 'mgr-1',
      email: 'mgr1@test.fr',
      role: 'manager',
      passwordHash: '',
      salt: '',
      iterations: 100000,
      createdAt: now,
      firstName: 'Mgr',
      lastName: 'One',
      teamId: null,
      managerId: null,
    }),
    repo.add({
      id: 'rh-1',
      email: 'rh1@test.fr',
      role: 'rh',
      passwordHash: '',
      salt: '',
      iterations: 100000,
      createdAt: now,
      firstName: 'Rh',
      lastName: 'One',
      teamId: null,
      managerId: null,
    }),
  ]);
}

describe('EmployeeService', () => {
  let storage: StorageService;
  let userRepository: UserRepository;
  let hasher: PasswordHasher;
  let service: EmployeeService;

  beforeEach(async () => {
    localStorage.clear();
    storage = new StorageService();
    userRepository = new UserRepository(storage);
    hasher = new PasswordHasher();
    await seedManagers(userRepository, hasher);
    service = new EmployeeService(userRepository, hasher);
  });

  it('should create an employee with valid manager', async () => {
    const result = await service.create({
      email: 'emp1@test.fr',
      firstName: 'John',
      lastName: 'Doe',
      role: 'employe',
      teamId: null,
      managerId: 'mgr-1',
      password: 'pass1234',
    });
    expect(result.success).toBe(true);
    expect(result.employee?.email).toBe('emp1@test.fr');
  });

  it('should reject creation when email already exists', async () => {
    await service.create({
      email: 'emp1@test.fr',
      firstName: 'John',
      lastName: 'Doe',
      role: 'employe',
      teamId: null,
      managerId: 'mgr-1',
      password: 'pass1234',
    });
    const duplicate = await service.create({
      email: 'emp1@test.fr',
      firstName: 'Jane',
      lastName: 'Smith',
      role: 'employe',
      teamId: null,
      managerId: 'mgr-1',
      password: 'pass5678',
    });
    expect(duplicate.success).toBe(false);
    expect(duplicate.error).toBeDefined();
  });

  it('should reject creation when profile is incomplete', async () => {
    const result = await service.create({
      email: '   ',
      firstName: 'John',
      lastName: 'Doe',
      role: 'employe',
      teamId: null,
      managerId: 'mgr-1',
      password: 'pass1234',
    });
    expect(result.success).toBe(false);
  });

  it('should reject creation without manager', async () => {
    const result = await service.create({
      email: 'emp2@test.fr',
      firstName: 'John',
      lastName: 'Doe',
      role: 'employe',
      teamId: null,
      managerId: '',
      password: 'pass1234',
    });
    expect(result.success).toBe(false);
    expect(result.error).toContain('manager');
  });

  it('should reject creation when manager does not exist', async () => {
    const result = await service.create({
      email: 'emp2@test.fr',
      firstName: 'John',
      lastName: 'Doe',
      role: 'employe',
      teamId: null,
      managerId: 'nope',
      password: 'pass1234',
    });
    expect(result.success).toBe(false);
  });

  it('should reject creation when manager has incompatible role', async () => {
    const emp = await service.create({
      email: 'emp1@test.fr',
      firstName: 'John',
      lastName: 'Doe',
      role: 'employe',
      teamId: null,
      managerId: 'mgr-1',
      password: 'pass1234',
    });
    const result = await service.create({
      email: 'emp2@test.fr',
      firstName: 'Jane',
      lastName: 'Doe',
      role: 'employe',
      teamId: null,
      managerId: emp.employee!.id,
      password: 'pass1234',
    });
    expect(result.success).toBe(false);
  });

  it('should reject assigning self as manager', async () => {
    const emp = await service.create({
      email: 'emp1@test.fr',
      firstName: 'John',
      lastName: 'Doe',
      role: 'employe',
      teamId: null,
      managerId: 'mgr-1',
      password: 'pass1234',
    });
    const assign = service.assignManager(emp.employee!.id, emp.employee!.id);
    expect(assign.success).toBe(false);
  });

  it('should remove employee and clear manager references', async () => {
    const mgr = await service.create({
      email: 'mgr2@test.fr',
      firstName: 'Mgr',
      lastName: 'Two',
      role: 'manager',
      teamId: null,
      managerId: 'rh-1',
      password: 'pass1234',
    });
    const emp = await service.create({
      email: 'emp1@test.fr',
      firstName: 'John',
      lastName: 'Doe',
      role: 'manager',
      teamId: null,
      managerId: mgr.employee!.id,
      password: 'pass1234',
    });
    const emp2 = await service.create({
      email: 'emp2@test.fr',
      firstName: 'Jane',
      lastName: 'Doe',
      role: 'employe',
      teamId: null,
      managerId: emp.employee!.id,
      password: 'pass1234',
    });
    expect(mgr.success).toBe(true);
    expect(emp.success).toBe(true);
    expect(emp2.success).toBe(true);
    const removed = service.remove(emp.employee!.id);
    expect(removed).toBe(true);
    const emp2Reloaded = service.findById(emp2.employee!.id);
    expect(emp2Reloaded?.managerId).toBeNull();
  });

  it('should update employee and persist changes', async () => {
    const emp = await service.create({
      email: 'emp1@test.fr',
      firstName: 'John',
      lastName: 'Doe',
      role: 'employe',
      teamId: null,
      managerId: 'mgr-1',
      password: 'pass1234',
    });
    const update = await service.update(emp.employee!.id, {
      firstName: 'Johnny',
      managerId: 'rh-1',
    });
    expect(update.success).toBe(true);
    expect(update.employee?.firstName).toBe('Johnny');
    expect(update.employee?.managerId).toBe('rh-1');
  });
});
