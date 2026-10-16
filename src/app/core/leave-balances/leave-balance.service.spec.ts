import { describe, it, expect, beforeEach } from 'vitest';
import { LeaveBalanceService } from './leave-balance.service';
import { StorageService } from '../storage/storage.service';
import { LeaveRequest } from '../leave-requests/leave-request.models';

function makeRequest(overrides: Partial<LeaveRequest> = {}): LeaveRequest {
  return {
    id: crypto.randomUUID(),
    employeeId: 'emp',
    leaveTypeId: 'type-1',
    startDate: '2026-01-05',
    endDate: '2026-01-06',
    workingDays: 2,
    status: 'en_attente',
    createdAt: '2026-01-01T00:00:00.000Z',
    ...overrides,
  };
}

describe('LeaveBalanceService', () => {
  let storage: StorageService;
  let service: LeaveBalanceService;

  beforeEach(() => {
    localStorage.clear();
    storage = new StorageService();
    service = new LeaveBalanceService(storage);
  });

  it('should create and update a balance allowance', () => {
    const created = service.setAllowance('emp', 'type-1', 2026, 10);
    expect(created.success).toBe(true);
    expect(service.getFor('emp', 'type-1', 2026)?.allowance).toBe(10);

    service.setAllowance('emp', 'type-1', 2026, 15);
    expect(service.getFor('emp', 'type-1', 2026)?.allowance).toBe(15);
    expect(service.list()).toHaveLength(1);
  });

  it('should refuse a negative allowance', () => {
    const result = service.setAllowance('emp', 'type-1', 2026, -3);
    expect(result.success).toBe(false);
  });

  it('should count only approved requests of the matching year', () => {
    const requests: LeaveRequest[] = [
      makeRequest({ status: 'approuvee', workingDays: 3 }),
      makeRequest({ status: 'en_attente', workingDays: 5 }),
      makeRequest({ status: 'refusee', workingDays: 2 }),
      makeRequest({ status: 'approuvee', workingDays: 4, startDate: '2025-12-30' }),
      makeRequest({ status: 'approuvee', workingDays: 1, leaveTypeId: 'type-2' }),
      makeRequest({ status: 'approuvee', workingDays: 1, employeeId: 'other' }),
    ];
    expect(service.computeUsed('emp', 'type-1', 2026, requests)).toBe(3);
  });

  it('should compute the remaining balance', () => {
    service.setAllowance('emp', 'type-1', 2026, 10);
    const summary = service.summarize('emp', 'type-1', 2026, [makeRequest({ status: 'approuvee', workingDays: 4 })]);
    expect(summary.allowance).toBe(10);
    expect(summary.used).toBe(4);
    expect(summary.remaining).toBe(6);
  });

  it('should expose summaries for an employee', () => {
    service.setAllowance('emp', 'type-1', 2026, 10);
    service.setAllowance('emp', 'type-2', 2026, 5);
    service.setAllowance('emp', 'type-1', 2025, 10);
    const summaries = service.summariesForEmployee('emp', 2026, []);
    expect(summaries).toHaveLength(2);
  });

  it('should scope visible summaries by role', () => {
    service.setAllowance('emp', 'type-1', 2026, 10);
    service.setAllowance('other', 'type-1', 2026, 8);

    const employeeView = service.visibleSummaries({ id: 'emp', email: 'emp@test.fr', role: 'employe' }, 2026, []);
    expect(employeeView).toHaveLength(1);
    expect(employeeView[0].employeeId).toBe('emp');

    const rhView = service.visibleSummaries({ id: 'rh', email: 'rh@test.fr', role: 'rh' }, 2026, []);
    expect(rhView).toHaveLength(2);
  });

  it('should persist balances between reloads', () => {
    service.setAllowance('emp', 'type-1', 2026, 10);
    const reloaded = new LeaveBalanceService(new StorageService());
    expect(reloaded.list()).toHaveLength(1);
  });
});
