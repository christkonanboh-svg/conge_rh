import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgForOf, NgIf } from '@angular/common';
import { EmployeeService, EmployeeMutationResult } from '../../core/employees/employee.service';
import { TeamService } from '../../core/employees/team.service';
import { EmployeeProfile, EmployeeInput, MANAGER_ROLES } from '../../core/employees/employee.models';
import { USER_ROLE_LABELS, USER_ROLES, UserRole } from '../../core/auth/auth.models';

@Component({
  selector: 'app-employees',
  imports: [ReactiveFormsModule, NgIf, NgForOf],
  template: `
    <div class="p-8">
      <div class="max-w-5xl mx-auto">
        <div class="flex items-center justify-between mb-6">
          <h1 class="text-2xl font-bold">Gestion des employés</h1>
          <button (click)="startCreate()" class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
            + Ajouter un employé
          </button>
        </div>

        <div *ngIf="error()" class="bg-red-50 text-red-700 p-3 rounded mb-4">{{ error() }}</div>
        <div *ngIf="success()" class="bg-green-50 text-green-700 p-3 rounded mb-4">{{ success() }}</div>

        <div *ngIf="formVisible()" class="bg-white p-6 rounded shadow mb-6">
          <h2 class="text-lg font-semibold mb-4">{{ editingId() ? "Modifier l'employé" : "Nouvel employé" }}</h2>
          <form [formGroup]="form" (ngSubmit)="onSubmit()" class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700">Prénom</label>
              <input type="text" formControlName="firstName" class="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700">Nom</label>
              <input type="text" formControlName="lastName" class="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700">Email</label>
              <input type="email" formControlName="email" class="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700">Mot de passe</label>
              <input
                type="password"
                formControlName="password"
                class="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                autocomplete="new-password"
              />
              <span *ngIf="editingId()" class="text-xs text-gray-500">Laisser vide pour conserver le mot de passe actuel</span>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700">Rôle</label>
              <select formControlName="role" class="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2">
                <option *ngFor="let r of roles" [value]="r">{{ roleLabels[r] }}</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700">Équipe</label>
              <select formControlName="teamId" class="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2">
                <option [ngValue]="null">-- Aucune équipe --</option>
                <option *ngFor="let team of teamService.teams()" [ngValue]="team.id">{{ team.name }}</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700">Manager</label>
              <select formControlName="managerId" class="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2">
                <option [ngValue]="null">-- Aucun manager --</option>
                <option *ngFor="let m of eligibleManagers()" [ngValue]="m.id">
                  {{ m.firstName }} {{ m.lastName }} ({{ roleLabels[m.role] }})
                </option>
              </select>
            </div>
            <div class="md:col-span-2 flex gap-3">
              <button
                type="submit"
                [disabled]="form.invalid || loading()"
                class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
              >
                {{ editingId() ? "Enregistrer" : "Créer" }}
              </button>
              <button type="button" (click)="cancel()" class="bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400">
                Annuler
              </button>
            </div>
          </form>
        </div>

        <table class="w-full bg-white rounded shadow overflow-hidden">
          <thead class="bg-gray-50 text-left text-sm text-gray-600">
            <tr>
              <th class="px-4 py-3">Employé</th>
              <th class="px-4 py-3">Rôle</th>
              <th class="px-4 py-3">Équipe</th>
              <th class="px-4 py-3">Manager</th>
              <th class="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let e of employeeService.employees()" class="border-t">
              <td class="px-4 py-3">
                <div class="font-medium">{{ e.firstName }} {{ e.lastName }}</div>
                <div class="text-sm text-gray-500">{{ e.email }}</div>
              </td>
              <td class="px-4 py-3">{{ roleLabels[e.role] }}</td>
              <td class="px-4 py-3">{{ teamName(e.teamId) }}</td>
              <td class="px-4 py-3">{{ managerName(e.managerId) }}</td>
              <td class="px-4 py-3 flex gap-2">
                <button (click)="startEdit(e)" class="text-blue-600 hover:underline">Modifier</button>
                <button (click)="remove(e)" class="text-red-600 hover:underline">Supprimer</button>
              </td>
            </tr>
            <tr *ngIf="employeeService.employees().length === 0">
              <td colspan="5" class="px-4 py-6 text-center text-gray-500">Aucun employé enregistré</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `,
})
export class EmployeesComponent {
  readonly employeeService = inject(EmployeeService);
  readonly teamService = inject(TeamService);
  private readonly fb = inject(FormBuilder);

  readonly roleLabels = USER_ROLE_LABELS;
  readonly roles: readonly UserRole[] = USER_ROLES;

  readonly formVisible = signal(false);
  readonly editingId = signal<string | null>(null);
  readonly loading = signal(false);
  readonly error = signal('');
  readonly success = signal('');

  form = this.fb.group({
    firstName: ['', Validators.required],
    lastName: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    password: [''],
    role: ['employe' as UserRole, Validators.required],
    teamId: [null as string | null],
    managerId: [null as string | null],
  });

  eligibleManagers(): EmployeeProfile[] {
    const currentId = this.editingId();
    return this.employeeService
      .list()
      .filter((e) => MANAGER_ROLES.includes(e.role) && e.id !== currentId);
  }

  teamName(teamId: string | null): string {
    if (!teamId) {
      return '—';
    }
    return this.teamService.findById(teamId)?.name ?? '—';
  }

  managerName(managerId: string | null): string {
    if (!managerId) {
      return '—';
    }
    const manager = this.employeeService.findById(managerId);
    return manager ? `${manager.firstName} ${manager.lastName}` : '—';
  }

  startCreate(): void {
    this.editingId.set(null);
    this.form.reset({
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      role: 'employe',
      teamId: null,
      managerId: null,
    });
    this.error.set('');
    this.success.set('');
    this.formVisible.set(true);
  }

  startEdit(employee: EmployeeProfile): void {
    this.editingId.set(employee.id);
    this.form.setValue({
      firstName: employee.firstName,
      lastName: employee.lastName,
      email: employee.email,
      password: '',
      role: employee.role,
      teamId: employee.teamId,
      managerId: employee.managerId,
    });
    this.error.set('');
    this.success.set('');
    this.formVisible.set(true);
  }

  cancel(): void {
    this.formVisible.set(false);
  }

  async onSubmit(): Promise<void> {
    if (this.form.invalid) {
      return;
    }
    this.loading.set(true);
    this.error.set('');
    this.success.set('');

    const value = this.form.getRawValue();
    let result: EmployeeMutationResult;

    if (this.editingId()) {
      const changes: Partial<Omit<EmployeeInput, 'password'>> & { password?: string } = {
        firstName: value.firstName ?? '',
        lastName: value.lastName ?? '',
        email: value.email ?? '',
        role: value.role ?? 'employe',
        teamId: value.teamId ?? null,
        managerId: value.managerId ?? null,
      };
      if (value.password) {
        changes.password = value.password;
      }
      result = await this.employeeService.update(this.editingId()!, changes);
    } else {
      result = await this.employeeService.create({
        email: value.email ?? '',
        firstName: value.firstName ?? '',
        lastName: value.lastName ?? '',
        role: value.role ?? 'employe',
        teamId: value.teamId ?? null,
        managerId: value.managerId ?? null,
        password: value.password ?? '',
      });
    }

    this.loading.set(false);

    if (result.success) {
      this.success.set(this.editingId() ? 'Employé modifié' : 'Employé créé');
      this.formVisible.set(false);
    } else {
      this.error.set(result.error ?? 'Une erreur est survenue');
    }
  }

  remove(employee: EmployeeProfile): void {
    this.error.set('');
    this.success.set('');
    if (this.employeeService.remove(employee.id)) {
      this.success.set('Employé supprimé');
    } else {
      this.error.set("Impossible de supprimer cet employé");
    }
  }
}
