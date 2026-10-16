import { eachMonthOfInterval, endOfMonth, format, parseISO, startOfMonth } from 'date-fns';
import { fr } from 'date-fns/locale';
import type { ChartConfiguration } from 'chart.js';
import { StoredUser } from '../auth/auth.models';
import { LeaveRequest, LeaveStatus, LeaveType } from '../leave-requests/leave-request.models';
import { countWorkingDays } from '../leave-requests/leave-days.util';

export interface ReportingPeriod {
  start: string;
  end: string;
}

export interface MonthlyLeaveStat {
  label: string;
  days: number;
  absenceRate: number;
}

export interface LeaveKpis {
  statusCounts: Record<LeaveStatus, number>;
  approvedDays: number;
  referenceWorkingDays: number;
  absenceRate: number;
  monthly: MonthlyLeaveStat[];
  typeBreakdown: Array<{ label: string; days: number }>;
}

export interface LeaveChartsConfig {
  byMonth: ChartConfiguration<'bar'>;
  byType: ChartConfiguration<'doughnut'>;
  absenceRate: ChartConfiguration<'line'>;
}

const PALETTE = ['#3b82f6', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6'];

export function computeKpis(
  requests: LeaveRequest[],
  employees: StoredUser[],
  period: ReportingPeriod,
  leaveTypes: LeaveType[] = []
): LeaveKpis {
  const statusCounts = { en_attente: 0, approuvee: 0, refusee: 0, annulee: 0 } as Record<LeaveStatus, number>;
  for (const request of requests) {
    statusCounts[request.status] += 1;
  }

  const approved = requests.filter((request) => request.status === 'approuvee');
  const approvedDays = approved.reduce((total, request) => total + request.workingDays, 0);

  const employeeCount = employees.length;
  const referenceWorkingDays = countWorkingDays(period.start, period.end) * employeeCount;
  const absenceRate = referenceWorkingDays > 0 ? approvedDays / referenceWorkingDays : 0;

  const daysByMonth = new Map<string, number>();
  for (const request of approved) {
    const key = request.startDate.slice(0, 7);
    daysByMonth.set(key, (daysByMonth.get(key) ?? 0) + request.workingDays);
  }

  const periodStart = parseISO(period.start);
  const periodEnd = parseISO(period.end);
  const monthly: MonthlyLeaveStat[] = eachMonthOfInterval({ start: periodStart, end: periodEnd }).map((month) => {
    const from = startOfMonth(month).getTime() < periodStart.getTime() ? periodStart : startOfMonth(month);
    const to = endOfMonth(month).getTime() > periodEnd.getTime() ? periodEnd : endOfMonth(month);
    const workingDays = countWorkingDays(format(from, 'yyyy-MM-dd'), format(to, 'yyyy-MM-dd'));
    const reference = workingDays * employeeCount;
    const days = daysByMonth.get(format(month, 'yyyy-MM')) ?? 0;
    return { label: format(month, 'MMM', { locale: fr }), days, absenceRate: reference > 0 ? days / reference : 0 };
  });

  const typeBreakdown = leaveTypes.map((type) => ({
    label: type.name,
    days: approved
      .filter((request) => request.leaveTypeId === type.id)
      .reduce((total, request) => total + request.workingDays, 0),
  }));

  return { statusCounts, approvedDays, referenceWorkingDays, absenceRate, monthly, typeBreakdown };
}

export function buildCharts(kpis: LeaveKpis): LeaveChartsConfig {
  return {
    byMonth: {
      type: 'bar',
      data: {
        labels: kpis.monthly.map((month) => month.label),
        datasets: [{ label: 'Jours approuvés', data: kpis.monthly.map((month) => month.days), backgroundColor: '#3b82f6' }],
      },
      options: { responsive: true, plugins: { legend: { display: false } } },
    },
    byType: {
      type: 'doughnut',
      data: {
        labels: kpis.typeBreakdown.map((type) => type.label),
        datasets: [
          {
            data: kpis.typeBreakdown.map((type) => type.days),
            backgroundColor: kpis.typeBreakdown.map((_type, index) => PALETTE[index % PALETTE.length]),
          },
        ],
      },
      options: { responsive: true },
    },
    absenceRate: {
      type: 'line',
      data: {
        labels: kpis.monthly.map((month) => month.label),
        datasets: [
          {
            label: "Taux d'absence (%)",
            data: kpis.monthly.map((month) => Math.round(month.absenceRate * 1000) / 10),
            borderColor: '#ef4444',
            backgroundColor: 'rgba(239, 68, 68, 0.2)',
          },
        ],
      },
      options: { responsive: true },
    },
  };
}
