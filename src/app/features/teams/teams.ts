import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgForOf, NgIf } from '@angular/common';
import { TeamService, TeamMutationResult } from '../../core/employees/team.service';
import { Team } from '../../core/employees/employee.models';

@Component({
  selector: 'app-teams',
  imports: [ReactiveFormsModule, NgIf, NgForOf],
  template: `
    <div class="p-8">
      <div class="max-w-3xl mx-auto">
        <div class="flex items-center justify-between mb-6">
          <h1 class="text-2xl font-bold">Gestion des équipes</h1>
        </div>

        <div *ngIf="error()" class="bg-red-50 text-red-700 p-3 rounded mb-4">{{ error() }}</div>
        <div *ngIf="success()" class="bg-green-50 text-green-700 p-3 rounded mb-4">{{ success() }}</div>

        <form [formGroup]="form" (ngSubmit)="onSubmit()" class="flex gap-3 mb-6">
          <input
            type="text"
            formControlName="name"
            placeholder="Nom de l'équipe"
            class="flex-1 border border-gray-300 rounded-md px-3 py-2"
          />
          <button
            type="submit"
            [disabled]="form.invalid"
            class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {{ editingId() ? 'Renommer' : 'Créer' }}
          </button>
          <button *ngIf="editingId()" type="button" (click)="cancelRename()" class="bg-gray-300 text-gray-800 px-4 py-2 rounded">
            Annuler
          </button>
        </form>

        <ul class="bg-white rounded shadow divide-y">
          <li *ngFor="let team of teamService.teams()" class="flex items-center justify-between px-4 py-3">
            <span>{{ team.name }}</span>
            <div class="flex gap-3 text-sm">
              <button (click)="startRename(team)" class="text-blue-600 hover:underline">Renommer</button>
              <button (click)="remove(team)" class="text-red-600 hover:underline">Supprimer</button>
            </div>
          </li>
          <li *ngIf="teamService.teams().length === 0" class="px-4 py-6 text-center text-gray-500">
            Aucune équipe enregistrée
          </li>
        </ul>
      </div>
    </div>
  `,
})
export class TeamsComponent {
  readonly teamService = inject(TeamService);
  private readonly fb = inject(FormBuilder);

  readonly editingId = signal<string | null>(null);
  readonly error = signal('');
  readonly success = signal('');

  form = this.fb.group({
    name: ['', Validators.required],
  });

  startRename(team: Team): void {
    this.editingId.set(team.id);
    this.form.setValue({ name: team.name });
    this.error.set('');
    this.success.set('');
  }

  cancelRename(): void {
    this.editingId.set(null);
    this.form.reset({ name: '' });
  }

  onSubmit(): void {
    if (this.form.invalid) {
      return;
    }
    this.error.set('');
    this.success.set('');
    const name = this.form.getRawValue().name ?? '';
    const editingId = this.editingId();

    let result: TeamMutationResult;
    if (editingId) {
      result = this.teamService.rename(editingId, name);
    } else {
      result = this.teamService.create(name);
    }

    if (result.success) {
      this.success.set(editingId ? 'Équipe renommée' : 'Équipe créée');
      this.cancelRename();
    } else {
      this.error.set(result.error ?? 'Une erreur est survenue');
    }
  }

  remove(team: Team): void {
    this.error.set('');
    this.success.set('');
    if (this.teamService.remove(team.id)) {
      this.success.set('Équipe supprimée');
    } else {
      this.error.set("Impossible de supprimer cette équipe");
    }
  }
}
