import { describe, it, expect, beforeEach } from 'vitest';
import { LeaveRequestService } from './leave-request.service';
import { LeaveTypeService } from './leave-type.service';
import { LeaveBalanceService } from '../leave-balances/leave-balance.service';
import { StorageService } from '../storage/storage.service';
import { UserRepository } from '../users/user.repository';
import { PublicUser, StoredUser, UserRole } from '../auth/auth.models';

function makeUser(id: string, role: UserRole, managerId: string | null = null): StoredUser {
  return {
    id,
    email: `${id}@test.fr`,
    role,
    passwordHash: 'hash',
    salt: 'salt',
    iterations: 100000,
    createdAt: '2026-01-01T00:00:00.000Z',
    firstName: id,
    lastName: 'Test',
    teamId: null,
    managerId,
  };
}

describe('LeaveRequestService', () => {
  let storage: StorageService;
  let userRepository: UserRepository;
  let leaveTypeService: LeaveTypeService;
  let leaveBalanceService: LeaveBalanceService;
  let service: LeaveRequestService;

  const employee: PublicUser = { id: 'emp', email: 'emp@test.fr', role: 'employe' };
  const manager: PublicUser = { id: 'mgr', email: 'mgr@test.fr', role: 'manager' };
  const rh: PublicUser = { id: 'rh', email: 'rh@test.fr', role: 'rh' };

  beforeEach(() => {
    localStorage.clear();
    storage = new StorageService();
    userRepository = new UserRepository(storage);
    leaveTypeService = new LeaveTypeService(storage);
    leaveBalanceService = new LeaveBalanceService(storage);
    service = new LeaveRequestService(storage, userRepository, leaveTypeService, leaveBalanceService);

    userRepository.replaceAll([
      makeUser('emp', 'employe', 'mgr'),
      makeUser('other', 'employe', 'rh'),
      makeUser('mgr', 'manager', 'rh'),
      makeUser('rh', 'rh', 'mgr'),
    ]);
  });

  function seedType(requiresBalance = true): string {
    const result = leaveTypeService.create({ name: 'Congé payé', requiresBalance });
    return result.leaveType!.id;
  }

  it('should create a request with the pending status and computed working days', () => {
    const typeId = seedType();
    const result = service.submit({
      employeeId: 'emp',
      leaveTypeId: typeId,
      startDate: '2026-01-05',
      endDate: '2026-01-09',
    });
    expect(result.success).toBe(true);
    expect(result.request?.status).toBe('en_attente');
    expect(result.request?.workingDays).toBe(5);
  });

  it('should exclude weekends from working days', () => {
    const typeId = seedType();
    const result = service.submit({
      employeeId: 'emp',
      leaveTypeId: typeId,
      startDate: '2026-01-05',
      endDate: '2026-01-11',
    });
    expect(result.request?.workingDays).toBe(5);
  });

  it('should refuse an invalid period', () => {
    const typeId = seedType();
    const result = service.submit({
      employeeId: 'emp',
      leaveTypeId: typeId,
      startDate: '2026-01-10',
      endDate: '2026-01-05',
    });
    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
  });

  it('should refuse an unknown leave type', () => {
    const result = service.submit({
      employeeId: 'emp',
      leaveTypeId: 'missing',
      startDate: '2026-01-05',
      endDate: '2026-01-06',
    });
    expect(result.success).toBe(false);
  });

  it('should let a manager approve a team member request and record the decision', () => {
    const typeId = seedType();
    leaveBalanceService.setAllowance('emp', typeId, 2026, 10);
    const created = service.submit({
      employeeId: 'emp',
      leaveTypeId: typeId,
      startDate: '2026-01-05',
      endDate: '2026-01-06',
    });
    const approved = service.approve(created.request!.id, manager);
    expect(approved.success).toBe(true);
    expect(approved.request?.status).toBe('approuvee');
    expect(approved.request?.decidedBy).toBe('mgr');
    expect(approved.request?.decidedAt).toBeDefined();
  });

  it('should refuse a manager approving outside their scope', () => {
    const typeId = seedType();
    const created = service.submit({
      employeeId: 'other',
      leaveTypeId: typeId,
      startDate: '2026-01-05',
      endDate: '2026-01-06',
    });
    const approved = service.approve(created.request!.id, manager);
    expect(approved.success).toBe(false);
  });

  it('should let RH approve any request', () => {
    const typeId = seedType();
    leaveBalanceService.setAllowance('emp', typeId, 2026, 10);
    const created = service.submit({
      employeeId: 'emp',
      leaveTypeId: typeId,
      startDate: '2026-01-05',
      endDate: '2026-01-06',
    });
    const approved = service.approve(created.request!.id, rh);
    expect(approved.success).toBe(true);
    expect(approved.request?.status).toBe('approuvee');
  });

  it('should let the author cancel a pending request', () => {
    const typeId = seedType();
    const created = service.submit({
      employeeId: 'emp',
      leaveTypeId: typeId,
      startDate: '2026-01-05',
      endDate: '2026-01-06',
    });
    const cancelled = service.cancel(created.request!.id, employee);
    expect(cancelled.success).toBe(true);
    expect(cancelled.request?.status).toBe('annulee');
  });

  it('should refuse cancelling an already decided request', () => {
    const typeId = seedType();
    leaveBalanceService.setAllowance('emp', typeId, 2026, 10);
    const created = service.submit({
      employeeId: 'emp',
      leaveTypeId: typeId,
      startDate: '2026-01-05',
      endDate: '2026-01-06',
    });
    service.approve(created.request!.id, manager);
    const cancelled = service.cancel(created.request!.id, employee);
    expect(cancelled.success).toBe(false);
    expect(service.findById(created.request!.id)?.status).toBe('approuvee');
  });

  it('should scope visible requests by role', () => {
    const typeId = seedType();
    service.submit({ employeeId: 'emp', leaveTypeId: typeId, startDate: '2026-01-05', endDate: '2026-01-06' });
    service.submit({ employeeId: 'other', leaveTypeId: typeId, startDate: '2026-02-05', endDate: '2026-02-06' });
    service.submit({ employeeId: 'rh', leaveTypeId: typeId, startDate: '2026-03-05', endDate: '2026-03-06' });

    expect(service.visibleRequests(employee)).toHaveLength(1);
    expect(service.visibleRequests(manager).length).toBe(2);
    expect(service.visibleRequests(rh)).toHaveLength(3);
  });

  it('should refuse approval when the balance is insufficient', () => {
    const typeId = seedType(true);
    leaveBalanceService.setAllowance('emp', typeId, 2026, 1);
    const created = service.submit({
      employeeId: 'emp',
      leaveTypeId: typeId,
      startDate: '2026-01-05',
      endDate: '2026-01-09',
    });
    const approved = service.approve(created.request!.id, manager);
    expect(approved.success).toBe(false);
  });

  it('should not check the balance for types without balance tracking', () => {
    const typeId = seedType(false);
    const created = service.submit({
      employeeId: 'emp',
      leaveTypeId: typeId,
      startDate: '2026-01-05',
      endDate: '2026-01-09',
    });
    const approved = service.approve(created.request!.id, manager);
    expect(approved.success).toBe(true);
  });
});
