import { describe, it, expect } from 'vitest';
import { applyLeaveFilters } from './leave-filters.util';
import { LeaveRequest } from './leave-request.models';
import { StoredUser } from '../auth/auth.models';

function makeRequest(overrides: Partial<LeaveRequest>): LeaveRequest {
  return {
    id: 'r-' + Math.random().toString(36).slice(2),
    employeeId: 'e1',
    leaveTypeId: 't1',
    startDate: '2026-03-02',
    endDate: '2026-03-06',
    workingDays: 5,
    status: 'en_attente',
    createdAt: '2026-01-01T00:00:00.000Z',
    ...overrides,
  };
}

function makeUser(id: string, firstName: string, lastName: string): StoredUser {
  return {
    id,
    email: `${firstName.toLowerCase()}@test.fr`,
    role: 'employe',
    passwordHash: 'h',
    salt: 's',
    iterations: 1,
    createdAt: '2026-01-01T00:00:00.000Z',
    firstName,
    lastName,
  };
}

const employees: StoredUser[] = [makeUser('e1', 'Alice', 'Martin'), makeUser('e2', 'Bob', 'Durand')];

describe('applyLeaveFilters', () => {
  it('filters by status', () => {
    const requests = [makeRequest({ status: 'approuvee' }), makeRequest({ status: 'refusee' })];
    const result = applyLeaveFilters(requests, { status: 'approuvee' }, []);
    expect(result).toHaveLength(1);
    expect(result[0].status).toBe('approuvee');
  });

  it('filters by leave type', () => {
    const requests = [makeRequest({ leaveTypeId: 't1' }), makeRequest({ leaveTypeId: 't2' })];
    const result = applyLeaveFilters(requests, { leaveTypeId: 't2' }, []);
    expect(result).toHaveLength(1);
    expect(result[0].leaveTypeId).toBe('t2');
  });

  it('filters by period using intersection', () => {
    const requests = [
      makeRequest({ startDate: '2026-03-02', endDate: '2026-03-06' }),
      makeRequest({ startDate: '2026-04-01', endDate: '2026-04-03' }),
    ];
    expect(applyLeaveFilters(requests, { startDate: '2026-03-01', endDate: '2026-03-31' }, [])).toHaveLength(1);
    expect(applyLeaveFilters(requests, { startDate: '2026-05-01', endDate: '2026-05-31' }, [])).toHaveLength(0);
    expect(applyLeaveFilters(requests, { endDate: '2026-03-01' }, [])).toHaveLength(0);
    expect(applyLeaveFilters(requests, { startDate: '2026-04-03', endDate: '2026-04-03' }, [])).toHaveLength(1);
  });

  it('filters by employee', () => {
    const requests = [makeRequest({ employeeId: 'e1' }), makeRequest({ employeeId: 'e2' })];
    const result = applyLeaveFilters(requests, { employeeId: 'e2' }, []);
    expect(result).toHaveLength(1);
    expect(result[0].employeeId).toBe('e2');
  });

  it('searches text on employee first or last name', () => {
    const requests = [makeRequest({ employeeId: 'e1' }), makeRequest({ employeeId: 'e2' })];
    expect(applyLeaveFilters(requests, { search: 'alice' }, employees)).toHaveLength(1);
    expect(applyLeaveFilters(requests, { search: 'DURAND' }, employees)).toHaveLength(1);
    expect(applyLeaveFilters(requests, { search: 'zzz' }, employees)).toHaveLength(0);
  });

  it('combines filters and search', () => {
    const requests = [
      makeRequest({ employeeId: 'e1', leaveTypeId: 't1', status: 'approuvee' }),
      makeRequest({ employeeId: 'e1', leaveTypeId: 't2', status: 'approuvee' }),
      makeRequest({ employeeId: 'e2', leaveTypeId: 't1', status: 'approuvee' }),
    ];
    const result = applyLeaveFilters(requests, { leaveTypeId: 't1', search: 'alice' }, employees);
    expect(result).toHaveLength(1);
    expect(result[0].employeeId).toBe('e1');
  });

  it('returns every request once filters are reset', () => {
    const requests = [makeRequest({}), makeRequest({ status: 'refusee' }), makeRequest({ employeeId: 'e2' })];
    expect(applyLeaveFilters(requests, {}, [])).toHaveLength(3);
  });
});
