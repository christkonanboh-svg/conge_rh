import { describe, expect, it } from 'vitest';
import { buildCharts, computeKpis } from './leave-reporting.util';
import { LeaveRequest, LeaveType } from '../leave-requests/leave-request.models';
import { StoredUser } from '../auth/auth.models';

function employee(id: string): StoredUser {
  return {
    id,
    email: `${id}@test.fr`,
    role: 'employe',
    passwordHash: 'h',
    salt: 's',
    iterations: 1,
    createdAt: '2026-01-01T00:00:00.000Z',
    firstName: 'A',
    lastName: 'B',
    teamId: 't1',
    managerId: null,
  };
}

function type(id: string, name: string): LeaveType {
  return { id, name, color: '#000', requiresBalance: false, createdAt: '2026-01-01T00:00:00.000Z' };
}

function request(overrides: Partial<LeaveRequest>): LeaveRequest {
  return {
    id: 'r-' + Math.random().toString(36).slice(2),
    employeeId: 'e1',
    leaveTypeId: 't1',
    startDate: '2026-03-02',
    endDate: '2026-03-06',
    workingDays: 5,
    status: 'approuvee',
    createdAt: '2026-01-02T00:00:00.000Z',
    ...overrides,
  };
}

const year = { start: '2026-01-01', end: '2026-12-31' };

describe('computeKpis', () => {
  it('counts requests per status and approved days', () => {
    const kpis = computeKpis(
      [
        request({ status: 'approuvee', workingDays: 5 }),
        request({ status: 'approuvee', workingDays: 2, startDate: '2026-03-04', endDate: '2026-03-05' }),
        request({ status: 'en_attente' }),
        request({ status: 'refusee' }),
      ],
      [employee('e1'), employee('e2')],
      year,
      [type('t1', 'Congé payé')]
    );

    expect(kpis.statusCounts).toEqual({ en_attente: 1, approuvee: 2, refusee: 1, annulee: 0 });
    expect(kpis.approvedDays).toBe(7);
    expect(kpis.referenceWorkingDays).toBeGreaterThan(0);
    expect(kpis.absenceRate).toBeCloseTo(7 / kpis.referenceWorkingDays, 6);
  });

  it('computes the absence rate over the reference working days', () => {
    const kpis = computeKpis(
      [request({ workingDays: 5 })],
      [employee('e1')],
      { start: '2026-03-02', end: '2026-03-06' },
      [type('t1', 'Congé payé')]
    );
    expect(kpis.referenceWorkingDays).toBe(5);
    expect(kpis.absenceRate).toBe(1);
  });

  it('builds monthly and per-type breakdowns from approved requests', () => {
    const kpis = computeKpis(
      [
        request({ leaveTypeId: 't1', workingDays: 5 }),
        request({ leaveTypeId: 't2', workingDays: 2, startDate: '2026-03-04', endDate: '2026-03-05' }),
        request({ leaveTypeId: 't2', status: 'refusee' }),
      ],
      [employee('e1')],
      year,
      [type('t1', 'Congé payé'), type('t2', 'RTT')]
    );

    expect(kpis.monthly).toHaveLength(12);
    expect(kpis.monthly[2].days).toBe(7);
    expect(kpis.monthly[0].days).toBe(0);
    expect(kpis.typeBreakdown).toEqual([
      { label: 'Congé payé', days: 5 },
      { label: 'RTT', days: 2 },
    ]);
  });
});

describe('buildCharts', () => {
  it('maps the KPIs into chart configurations without rendering', () => {
    const kpis = computeKpis(
      [request({ workingDays: 5 })],
      [employee('e1')],
      year,
      [type('t1', 'Congé payé')]
    );
    const charts = buildCharts(kpis);

    expect(charts.byMonth.type).toBe('bar');
    expect(charts.byMonth.data.labels).toHaveLength(12);
    expect(charts.byMonth.data.datasets[0].data).toEqual(kpis.monthly.map((month) => month.days));

    expect(charts.byType.type).toBe('doughnut');
    expect(charts.byType.data.labels).toEqual(['Congé payé']);
    expect(charts.byType.data.datasets[0].data).toEqual([5]);

    expect(charts.absenceRate.type).toBe('line');
    expect(charts.absenceRate.data.datasets[0].data).toEqual(
      kpis.monthly.map((month) => Math.round(month.absenceRate * 1000) / 10)
    );
  });
});
