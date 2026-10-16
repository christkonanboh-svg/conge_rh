import { Component, computed, inject } from '@angular/core';
import { NgForOf } from '@angular/common';
import { BaseChartDirective } from 'ng2-charts';
import { AuthService } from '../../core/auth/auth.service';
import { StoredUser } from '../../core/auth/auth.models';
import { UserRepository } from '../../core/users/user.repository';
import { LeaveRequestService } from '../../core/leave-requests/leave-request.service';
import { LeaveTypeService } from '../../core/leave-requests/leave-type.service';
import { LeaveRequest, LEAVE_STATUS_LABELS, LeaveStatus } from '../../core/leave-requests/leave-request.models';
import { buildCharts, computeKpis } from '../../core/leave-reporting/leave-reporting.util';

interface DashboardScope {
  requests: LeaveRequest[];
  employees: StoredUser[];
}

@Component({
  selector: 'app-dashboard',
  imports: [NgForOf, BaseChartDirective],
  template: `
    <div class="p-8">
      <div class="max-w-6xl mx-auto">
        <h1 class="text-2xl font-bold mb-6">Tableau de bord</h1>

        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div class="bg-white rounded shadow p-6">
            <p class="text-sm text-gray-500">Demandes</p>
            <p class="text-3xl font-bold">{{ totalRequests() }}</p>
          </div>
          <div class="bg-white rounded shadow p-6">
            <p class="text-sm text-gray-500">Jours approuvés</p>
            <p class="text-3xl font-bold">{{ kpis().approvedDays }}</p>
          </div>
          <div class="bg-white rounded shadow p-6">
            <p class="text-sm text-gray-500">Taux d'absence</p>
            <p class="text-3xl font-bold">{{ absenceRatePercent() }} %</p>
          </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-8">
          <div *ngFor="let row of statusRows()" class="bg-white rounded shadow p-4">
            <p class="text-sm text-gray-500">{{ row.label }}</p>
            <p class="text-2xl font-semibold">{{ row.count }}</p>
          </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div class="bg-white rounded shadow p-6">
            <h2 class="text-lg font-semibold mb-4">Congés par mois</h2>
            <canvas baseChart type="bar" [data]="charts().byMonth.data" [options]="charts().byMonth.options"></canvas>
          </div>
          <div class="bg-white rounded shadow p-6">
            <h2 class="text-lg font-semibold mb-4">Congés par type</h2>
            <canvas baseChart type="doughnut" [data]="charts().byType.data" [options]="charts().byType.options"></canvas>
          </div>
        </div>

        <div class="bg-white rounded shadow p-6">
          <h2 class="text-lg font-semibold mb-4">Taux d'absence</h2>
          <canvas baseChart type="line" [data]="charts().absenceRate.data" [options]="charts().absenceRate.options"></canvas>
        </div>
      </div>
    </div>
  `,
})
export class DashboardComponent {
  private readonly auth = inject(AuthService);
  private readonly userRepository = inject(UserRepository);
  private readonly leaveRequestService = inject(LeaveRequestService);
  private readonly leaveTypeService = inject(LeaveTypeService);

  private readonly period = (() => {
    const year = new Date().getFullYear();
    return { start: `${year}-01-01`, end: `${year}-12-31` };
  })();

  readonly scope = computed<DashboardScope>(() => {
    const user = this.auth.currentUser();
    if (!user) {
      return { requests: [], employees: [] };
    }
    const allEmployees = this.userRepository.list();
    const requests = this.leaveRequestService.visibleRequests(user);

    if (user.role === 'rh') {
      return { requests, employees: allEmployees };
    }
    if (user.role === 'manager') {
      const team = allEmployees.filter((employee) => employee.id === user.id || employee.managerId === user.id);
      return { requests, employees: team };
    }
    const self = allEmployees.filter((employee) => employee.id === user.id);
    return { requests, employees: self };
  });

  readonly kpis = computed(() =>
    computeKpis(this.scope().requests, this.scope().employees, this.period, this.leaveTypeService.list())
  );

  readonly charts = computed(() => buildCharts(this.kpis()));

  readonly totalRequests = computed(() => this.scope().requests.length);

  readonly absenceRatePercent = computed(() => Math.round(this.kpis().absenceRate * 1000) / 10);

  readonly statusRows = computed(() =>
    (Object.keys(this.kpis().statusCounts) as LeaveStatus[]).map((status) => ({
      status,
      label: LEAVE_STATUS_LABELS[status],
      count: this.kpis().statusCounts[status],
    }))
  );
}
