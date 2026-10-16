import { Component, computed, inject, signal } from '@angular/core';
import { NgForOf, NgIf } from '@angular/common';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { AuthService } from '../../core/auth/auth.service';
import { StoredUser } from '../../core/auth/auth.models';
import { Team } from '../../core/employees/employee.models';
import { TeamService } from '../../core/employees/team.service';
import { UserRepository } from '../../core/users/user.repository';
import { StorageService } from '../../core/storage/storage.service';
import { LeaveRequestService } from '../../core/leave-requests/leave-request.service';
import { buildMonthGrid, detectOverlaps } from '../../core/leave-requests/team-calendar.util';

interface CalendarSelection {
  year: number;
  month: number;
  teamId: string | null;
}

@Component({
  selector: 'app-team-calendar',
  imports: [NgIf, NgForOf],
  template: `
    <div class="p-8">
      <div class="max-w-5xl mx-auto">
        <div class="flex flex-wrap items-center justify-between gap-4 mb-6">
          <h1 class="text-2xl font-bold">Calendrier d'équipe</h1>
          <div *ngIf="isRh()" class="flex items-center gap-2">
            <label class="text-sm text-gray-600">Équipe</label>
            <select
              [value]="effectiveTeamId() ?? ''"
              (change)="onTeamChange($any($event.target).value)"
              class="border border-gray-300 rounded-md px-3 py-2"
            >
              <option value="">-- Sélectionner --</option>
              <option *ngFor="let team of teams()" [value]="team.id">{{ team.name }}</option>
            </select>
          </div>
          <div *ngIf="!isRh()" class="text-sm text-gray-600">
            Équipe : <span class="font-medium">{{ teamName() }}</span>
          </div>
        </div>

        <div class="flex items-center justify-between mb-4">
          <button (click)="previousMonth()" class="px-3 py-2 rounded border border-gray-300 hover:bg-gray-50">
            ← Mois précédent
          </button>
          <span class="text-lg font-semibold capitalize">{{ monthLabel() }}</span>
          <button (click)="nextMonth()" class="px-3 py-2 rounded border border-gray-300 hover:bg-gray-50">
            Mois suivant →
          </button>
        </div>

        <div *ngIf="members().length === 0" class="bg-white p-6 rounded shadow text-center text-gray-500">
          Aucun membre pour cette équipe
        </div>

        <table *ngIf="members().length > 0" class="w-full bg-white rounded shadow overflow-hidden table-fixed">
          <thead class="bg-gray-50 text-center text-sm text-gray-600">
            <tr>
              <th *ngFor="let label of weekDays" class="px-2 py-3">{{ label }}</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let week of weeks()">
              <td
                *ngFor="let day of week"
                class="border align-top h-24 px-1 py-1"
                [class.bg-gray-50]="!day.inMonth"
                [class.text-gray-300]="!day.inMonth"
              >
                <div class="flex items-center justify-between">
                  <span class="text-xs">{{ day.inMonth ? day.dayOfMonth : '' }}</span>
                  <span
                    *ngIf="overlapFor(day.date)?.hasOverlap"
                    class="text-[10px] font-semibold text-white bg-red-500 rounded px-1"
                    title="Chevauchement"
                  >
                    Chevauchement
                  </span>
                </div>
                <div *ngFor="let employeeId of overlapFor(day.date)?.employeeIds" class="mt-1 text-[11px] text-blue-700">
                  {{ initials(employeeId) }}
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `,
})
export class TeamCalendarComponent {
  private readonly auth = inject(AuthService);
  private readonly teamService = inject(TeamService);
  private readonly userRepository = inject(UserRepository);
  private readonly storage = inject(StorageService);
  private readonly leaveRequestService = inject(LeaveRequestService);

  private readonly selectionKey = 'teamCalendarSelection';
  readonly weekDays = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];

  readonly selection = signal<CalendarSelection>(this.loadSelection());

  readonly teams = computed<Team[]>(() => this.teamService.teams());

  readonly effectiveTeamId = computed(() => {
    const user = this.auth.currentUser();
    if (!user) {
      return null;
    }
    if (user.role === 'rh') {
      return this.selection().teamId;
    }
    return this.userRepository.findById(user.id)?.teamId ?? null;
  });

  readonly members = computed<StoredUser[]>(() => {
    const teamId = this.effectiveTeamId();
    if (!teamId) {
      return [];
    }
    return this.userRepository.list().filter((user) => user.teamId === teamId);
  });

  readonly teamName = computed(() => {
    const teamId = this.effectiveTeamId();
    return teamId ? this.teamService.findById(teamId)?.name ?? '—' : '—';
  });

  readonly weeks = computed(() => {
    const { year, month } = this.selection();
    return buildMonthGrid(year, month);
  });

  readonly monthLabel = computed(() => {
    const { year, month } = this.selection();
    return format(new Date(year, month - 1, 1), 'MMMM yyyy', { locale: fr });
  });

  readonly overlaps = computed(() =>
    detectOverlaps(this.leaveRequestService.list(), this.members(), this.selection())
  );

  isRh(): boolean {
    return this.auth.currentUser()?.role === 'rh';
  }

  overlapFor(date: string): { employeeIds: string[]; hasOverlap: boolean } | undefined {
    return this.overlaps().get(date);
  }

  initials(employeeId: string): string {
    const employee = this.userRepository.findById(employeeId);
    if (!employee) {
      return '?';
    }
    const first = employee.firstName?.[0] ?? '';
    const last = employee.lastName?.[0] ?? '';
    return (first + last).toUpperCase() || employee.email.slice(0, 2).toUpperCase();
  }

  previousMonth(): void {
    this.shiftMonth(-1);
  }

  nextMonth(): void {
    this.shiftMonth(1);
  }

  onTeamChange(teamId: string): void {
    this.updateSelection({ teamId: teamId || null });
  }

  private shiftMonth(delta: number): void {
    const { year, month } = this.selection();
    const shifted = new Date(year, month - 1 + delta, 1);
    this.updateSelection({ year: shifted.getFullYear(), month: shifted.getMonth() + 1 });
  }

  private updateSelection(partial: Partial<CalendarSelection>): void {
    const next = { ...this.selection(), ...partial };
    this.selection.set(next);
    this.storage.set(this.selectionKey, next);
  }

  private loadSelection(): CalendarSelection {
    const now = new Date();
    const saved = this.storage.get<CalendarSelection>(this.selectionKey);
    if (saved && typeof saved.year === 'number' && typeof saved.month === 'number') {
      return saved;
    }
    return { year: now.getFullYear(), month: now.getMonth() + 1, teamId: null };
  }
}
