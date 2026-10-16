import { describe, it, expect } from 'vitest';
import { buildMonthGrid, detectOverlaps } from './team-calendar.util';
import { LeaveRequest } from './leave-request.models';

function makeRequest(overrides: Partial<LeaveRequest>): LeaveRequest {
  return {
    id: 'r-' + Math.random().toString(36).slice(2),
    employeeId: 'e1',
    leaveTypeId: 't1',
    startDate: '2026-03-02',
    endDate: '2026-03-06',
    workingDays: 5,
    status: 'approuvee',
    createdAt: '2026-01-01T00:00:00.000Z',
    ...overrides,
  };
}

describe('buildMonthGrid', () => {
  it('aligns weeks from Monday to Sunday', () => {
    const grid = buildMonthGrid(2026, 3);
    expect(grid.every((week) => week.length === 7)).toBe(true);
    expect(grid[0][0].date).toBe('2026-02-23');
    expect(grid[0][0].isWeekend).toBe(false);
    expect(grid[grid.length - 1][6].date).toBe('2026-04-05');
    expect(grid[grid.length - 1][6].isWeekend).toBe(true);
  });

  it('flags all days of the month and weekends', () => {
    const flat = buildMonthGrid(2026, 3).flat();
    expect(flat.filter((day) => day.inMonth)).toHaveLength(31);
    const saturday = flat.find((day) => day.date === '2026-03-07');
    expect(saturday?.isWeekend).toBe(true);
    expect(saturday?.inMonth).toBe(true);
  });
});

describe('detectOverlaps', () => {
  const employees = [{ id: 'e1' }, { id: 'e2' }];
  const month = { year: 2026, month: 3 };

  it('does not flag a single absent employee', () => {
    const result = detectOverlaps([makeRequest({ employeeId: 'e1' })], employees, month);
    expect(result.get('2026-03-02')?.hasOverlap).toBe(false);
    expect(result.get('2026-03-02')?.employeeIds).toEqual(['e1']);
  });

  it('flags days shared by two employees', () => {
    const result = detectOverlaps(
      [
        makeRequest({ employeeId: 'e1', startDate: '2026-03-02', endDate: '2026-03-06' }),
        makeRequest({ employeeId: 'e2', startDate: '2026-03-04', endDate: '2026-03-05' }),
      ],
      [{ id: 'e1' }, { id: 'e2' }],
      { year: 2026, month: 3 }
    );
    expect(result.get('2026-03-04')?.hasOverlap).toBe(true);
    expect(result.get('2026-03-05')?.hasOverlap).toBe(true);
    expect(result.get('2026-03-02')?.hasOverlap).toBe(false);
    expect(result.get('2026-03-06')?.hasOverlap).toBe(false);
  });

  it('ignores non-approved requests and out-of-team employees', () => {
    const result = detectOverlaps(
      [makeRequest({ employeeId: 'e1', status: 'en_attente' }), makeRequest({ employeeId: 'e3' })],
      [{ id: 'e1' }, { id: 'e2' }],
      { year: 2026, month: 3 }
    );
    expect(result.size).toBe(0);
  });

  it('excludes weekend days from overlap detection', () => {
    const result = detectOverlaps(
      [makeRequest({ employeeId: 'e1', startDate: '2026-03-06', endDate: '2026-03-09' })],
      [{ id: 'e1' }],
      { year: 2026, month: 3 }
    );
    expect(result.has('2026-03-06')).toBe(true);
    expect(result.has('2026-03-07')).toBe(false);
    expect(result.has('2026-03-08')).toBe(false);
    expect(result.has('2026-03-09')).toBe(true);
  });
});
