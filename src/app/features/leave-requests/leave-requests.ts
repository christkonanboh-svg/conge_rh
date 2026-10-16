import { Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgForOf, NgIf } from '@angular/common';
import { AuthService } from '../../core/auth/auth.service';
import { StoredUser } from '../../core/auth/auth.models';
import { UserRepository } from '../../core/users/user.repository';
import { LeaveRequestService } from '../../core/leave-requests/leave-request.service';
import { LeaveTypeService } from '../../core/leave-requests/leave-type.service';
import { LeaveBalanceService } from '../../core/leave-balances/leave-balance.service';
import { LeaveRequest, LEAVE_STATUS_LABELS, LEAVE_STATUSES, LeaveStatus } from '../../core/leave-requests/leave-request.models';
import { applyLeaveFilters, LeaveRequestFilters } from '../../core/leave-requests/leave-filters.util';

@Component({
  selector: 'app-leave-requests',
  imports: [ReactiveFormsModule, NgIf, NgForOf],
  template: `
    <div class="p-8">
      <div class="max-w-5xl mx-auto">
        <h1 class="text-2xl font-bold mb-6">Demandes de congé</h1>

        <div *ngIf="error()" class="bg-red-50 text-red-700 p-3 rounded mb-4">{{ error() }}</div>
        <div *ngIf="success()" class="bg-green-50 text-green-700 p-3 rounded mb-4">{{ success() }}</div>

        <div class="bg-white p-6 rounded shadow mb-6">
          <h2 class="text-lg font-semibold mb-4">Nouvelle demande</h2>
          <form [formGroup]="form" (ngSubmit)="onSubmit()" class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700">Type de congé</label>
              <select formControlName="leaveTypeId" class="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2">
                <option value="">-- Sélectionner --</option>
                <option *ngFor="let type of leaveTypeService.types()" [value]="type.id">{{ type.name }}</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700">Motif (facultatif)</label>
              <input type="text" formControlName="reason" class="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700">Date de début</label>
              <input type="date" formControlName="startDate" class="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700">Date de fin</label>
              <input type="date" formControlName="endDate" class="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2" />
            </div>
            <div class="md:col-span-2">
              <button
                type="submit"
                [disabled]="form.invalid || loading()"
                class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
              >
                Envoyer la demande
              </button>
            </div>
          </form>
        </div>

        <div class="bg-white p-6 rounded shadow mb-6" [formGroup]="filterForm">
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-lg font-semibold">Recherche et filtres</h2>
            <button type="button" (click)="resetFilters()" class="text-sm text-blue-600 hover:underline">
              Réinitialiser
            </button>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700">Statut</label>
              <select formControlName="status" class="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2">
                <option value="">Tous les statuts</option>
                <option *ngFor="let status of statuses" [value]="status">{{ statusLabels[status] }}</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700">Type</label>
              <select formControlName="leaveTypeId" class="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2">
                <option value="">Tous les types</option>
                <option *ngFor="let type of leaveTypeService.types()" [value]="type.id">{{ type.name }}</option>
              </select>
            </div>
            <div *ngIf="filterEmployees().length > 1">
              <label class="block text-sm font-medium text-gray-700">Employé</label>
              <select formControlName="employeeId" class="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2">
                <option value="">Tous les employés</option>
                <option *ngFor="let employee of filterEmployees()" [value]="employee.id">{{ fullName(employee) }}</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700">Du</label>
              <input type="date" formControlName="startDate" class="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700">Au</label>
              <input type="date" formControlName="endDate" class="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700">Recherche (nom, prénom)</label>
              <input type="text" formControlName="search" class="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2" />
            </div>
          </div>
        </div>

        <table class="w-full bg-white rounded shadow overflow-hidden mb-6">
          <thead class="bg-gray-50 text-left text-sm text-gray-600">
            <tr>
              <th class="px-4 py-3">Employé</th>
              <th class="px-4 py-3">Type</th>
              <th class="px-4 py-3">Période</th>
              <th class="px-4 py-3">Jours</th>
              <th class="px-4 py-3">Statut</th>
              <th class="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let request of filteredRequests()" class="border-t">
              <td class="px-4 py-3">{{ employeeName(request.employeeId) }}</td>
              <td class="px-4 py-3">{{ typeName(request.leaveTypeId) }}</td>
              <td class="px-4 py-3">{{ request.startDate }} → {{ request.endDate }}</td>
              <td class="px-4 py-3">{{ request.workingDays }}</td>
              <td class="px-4 py-3">{{ statusLabels[request.status] }}</td>
              <td class="px-4 py-3 flex gap-2">
                <button *ngIf="canDecide(request)" (click)="approve(request)" class="text-green-700 hover:underline">
                  Approuver
                </button>
                <button *ngIf="canDecide(request)" (click)="refuse(request)" class="text-red-600 hover:underline">
                  Refuser
                </button>
                <button *ngIf="isAuthor(request)" (click)="cancel(request)" class="text-gray-600 hover:underline">
                  Annuler
                </button>
              </td>
            </tr>
            <tr *ngIf="filteredRequests().length === 0">
              <td colspan="6" class="px-4 py-6 text-center text-gray-500">Aucune demande</td>
            </tr>
          </tbody>
        </table>

        <h2 class="text-lg font-semibold mb-3">Soldes {{ currentYear }}</h2>
        <table class="w-full bg-white rounded shadow overflow-hidden">
          <thead class="bg-gray-50 text-left text-sm text-gray-600">
            <tr>
              <th *ngIf="isRh()" class="px-4 py-3">Employé</th>
              <th class="px-4 py-3">Type</th>
              <th class="px-4 py-3">Droit annuel</th>
              <th class="px-4 py-3">Consommé</th>
              <th class="px-4 py-3">Restant</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let row of balanceRows()" class="border-t">
              <td *ngIf="isRh()" class="px-4 py-3">{{ employeeName(row.employeeId) }}</td>
              <td class="px-4 py-3">{{ typeName(row.leaveTypeId) }}</td>
              <td class="px-4 py-3">{{ row.allowance }}</td>
              <td class="px-4 py-3">{{ row.used }}</td>
              <td class="px-4 py-3">{{ row.remaining }}</td>
            </tr>
            <tr *ngIf="balanceRows().length === 0">
              <td [attr.colspan]="isRh() ? 5 : 4" class="px-4 py-6 text-center text-gray-500">
                Aucun solde enregistré
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `,
})
export class LeaveRequestsComponent {
  readonly auth = inject(AuthService);
  readonly leaveRequestService = inject(LeaveRequestService);
  readonly leaveTypeService = inject(LeaveTypeService);
  readonly leaveBalanceService = inject(LeaveBalanceService);
  private readonly userRepository = inject(UserRepository);
  private readonly fb = inject(FormBuilder);

  readonly statusLabels: Record<LeaveStatus, string> = LEAVE_STATUS_LABELS;
  readonly statuses = LEAVE_STATUSES;
  readonly currentYear = new Date().getFullYear();

  readonly loading = signal(false);
  readonly error = signal('');
  readonly success = signal('');

  form = this.fb.group({
    leaveTypeId: ['', Validators.required],
    startDate: ['', Validators.required],
    endDate: ['', Validators.required],
    reason: [''],
  });

  readonly filterForm = this.fb.group({
    status: [''],
    leaveTypeId: [''],
    startDate: [''],
    endDate: [''],
    employeeId: [''],
    search: [''],
  });

  private readonly filterState = signal<LeaveRequestFilters>({});

  constructor() {
    this.filterForm.valueChanges.subscribe((value) => {
      this.filterState.set({
        status: (value.status as LeaveStatus | null) ?? '',
        leaveTypeId: value.leaveTypeId ?? '',
        startDate: value.startDate ?? '',
        endDate: value.endDate ?? '',
        employeeId: value.employeeId ?? '',
        search: value.search ?? '',
      });
    });
  }

  readonly visibleRequests = computed(() => {
    const user = this.auth.currentUser();
    return user ? this.leaveRequestService.visibleRequests(user) : [];
  });

  readonly filteredRequests = computed(() =>
    applyLeaveFilters(this.visibleRequests(), this.filterState(), this.userRepository.list())
  );

  readonly filterEmployees = computed(() => {
    const user = this.auth.currentUser();
    if (!user) {
      return [];
    }
    const all = this.userRepository.list();
    if (user.role === 'rh') {
      return all;
    }
    if (user.role === 'manager') {
      return all.filter((candidate) => candidate.id === user.id || candidate.managerId === user.id);
    }
    return all.filter((candidate) => candidate.id === user.id);
  });

  readonly balanceRows = computed(() => {
    const user = this.auth.currentUser();
    if (!user) {
      return [];
    }
    return this.leaveBalanceService.visibleSummaries(user, this.currentYear, this.leaveRequestService.requests());
  });

  isRh(): boolean {
    return this.auth.currentUser()?.role === 'rh';
  }

  canDecide(request: LeaveRequest): boolean {
    const user = this.auth.currentUser();
    return !!user && request.status === 'en_attente' && this.leaveRequestService.canDecide(request, user);
  }

  isAuthor(request: LeaveRequest): boolean {
    const user = this.auth.currentUser();
    return !!user && request.status === 'en_attente' && request.employeeId === user.id;
  }

  employeeName(id: string): string {
    const employee = this.userRepository.findById(id);
    if (!employee) {
      return id;
    }
    return this.fullName(employee);
  }

  fullName(employee: StoredUser): string {
    const name = `${employee.firstName ?? ''} ${employee.lastName ?? ''}`.trim();
    return name || employee.email;
  }

  resetFilters(): void {
    this.filterForm.reset({
      status: '',
      leaveTypeId: '',
      startDate: '',
      endDate: '',
      employeeId: '',
      search: '',
    });
  }

  typeName(id: string): string {
    return this.leaveTypeService.findById(id)?.name ?? '—';
  }

  onSubmit(): void {
    const user = this.auth.currentUser();
    if (!user || this.form.invalid) {
      return;
    }
    this.loading.set(true);
    this.error.set('');
    this.success.set('');

    const value = this.form.getRawValue();
    const result = this.leaveRequestService.submit({
      employeeId: user.id,
      leaveTypeId: value.leaveTypeId ?? '',
      startDate: value.startDate ?? '',
      endDate: value.endDate ?? '',
      reason: value.reason ?? undefined,
    });

    this.loading.set(false);
    if (result.success) {
      this.success.set('Demande créée');
      this.form.reset({ leaveTypeId: '', startDate: '', endDate: '', reason: '' });
    } else {
      this.error.set(result.error ?? 'Une erreur est survenue');
    }
  }

  approve(request: LeaveRequest): void {
    this.applyDecision(this.leaveRequestService.approve(request.id, this.requireUser()), 'Demande approuvée');
  }

  refuse(request: LeaveRequest): void {
    this.applyDecision(this.leaveRequestService.refuse(request.id, this.requireUser()), 'Demande refusée');
  }

  cancel(request: LeaveRequest): void {
    this.applyDecision(this.leaveRequestService.cancel(request.id, this.requireUser()), 'Demande annulée');
  }

  private requireUser() {
    const user = this.auth.currentUser();
    if (!user) {
      throw new Error('Aucun utilisateur connecté');
    }
    return user;
  }

  private applyDecision(result: { success: boolean; error?: string }, successMessage: string): void {
    this.error.set('');
    this.success.set('');
    if (result.success) {
      this.success.set(successMessage);
    } else {
      this.error.set(result.error ?? 'Une erreur est survenue');
    }
  }
}
