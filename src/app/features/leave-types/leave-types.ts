import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgForOf, NgIf } from '@angular/common';
import { LeaveTypeService } from '../../core/leave-requests/leave-type.service';
import { LeaveType } from '../../core/leave-requests/leave-request.models';

@Component({
  selector: 'app-leave-types',
  imports: [ReactiveFormsModule, NgIf, NgForOf],
  template: `
    <div class="p-8">
      <div class="max-w-3xl mx-auto">
        <h1 class="text-2xl font-bold mb-6">Types de congé</h1>

        <div *ngIf="error()" class="bg-red-50 text-red-700 p-3 rounded mb-4">{{ error() }}</div>
        <div *ngIf="success()" class="bg-green-50 text-green-700 p-3 rounded mb-4">{{ success() }}</div>

        <div class="bg-white p-6 rounded shadow mb-6">
          <h2 class="text-lg font-semibold mb-4">{{ editingId() ? 'Modifier le type' : 'Nouveau type' }}</h2>
          <form [formGroup]="form" (ngSubmit)="onSubmit()" class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div class="md:col-span-2">
              <label class="block text-sm font-medium text-gray-700">Nom</label>
              <input type="text" formControlName="name" class="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700">Couleur</label>
              <input type="color" formControlName="color" class="mt-1 block w-full h-10 border border-gray-300 rounded-md" />
            </div>
            <div class="md:col-span-3 flex items-center gap-2">
              <input id="requiresBalance" type="checkbox" formControlName="requiresBalance" class="h-4 w-4" />
              <label for="requiresBalance" class="text-sm text-gray-700">Décompte un solde annuel</label>
            </div>
            <div class="md:col-span-3 flex gap-3">
              <button
                type="submit"
                [disabled]="form.invalid"
                class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
              >
                {{ editingId() ? 'Enregistrer' : 'Ajouter' }}
              </button>
              <button *ngIf="editingId()" type="button" (click)="resetForm()" class="text-gray-600 px-4 py-2">
                Annuler
              </button>
            </div>
          </form>
        </div>

        <table class="w-full bg-white rounded shadow overflow-hidden">
          <thead class="bg-gray-50 text-left text-sm text-gray-600">
            <tr>
              <th class="px-4 py-3">Nom</th>
              <th class="px-4 py-3">Couleur</th>
              <th class="px-4 py-3">Solde</th>
              <th class="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let type of leaveTypeService.types()" class="border-t">
              <td class="px-4 py-3">{{ type.name }}</td>
              <td class="px-4 py-3">
                <span class="inline-block w-5 h-5 rounded" [style.background]="type.color"></span>
              </td>
              <td class="px-4 py-3">{{ type.requiresBalance ? 'Oui' : 'Non' }}</td>
              <td class="px-4 py-3 flex gap-3">
                <button (click)="edit(type)" class="text-blue-600 hover:underline">Modifier</button>
                <button (click)="remove(type)" class="text-red-600 hover:underline">Supprimer</button>
              </td>
            </tr>
            <tr *ngIf="leaveTypeService.types().length === 0">
              <td colspan="4" class="px-4 py-6 text-center text-gray-500">Aucun type de congé</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `,
})
export class LeaveTypesComponent {
  readonly leaveTypeService = inject(LeaveTypeService);
  private readonly fb = inject(FormBuilder);

  readonly editingId = signal<string | null>(null);
  readonly error = signal('');
  readonly success = signal('');

  form = this.fb.group({
    name: ['', Validators.required],
    color: ['#3b82f6'],
    requiresBalance: [true],
  });

  onSubmit(): void {
    this.error.set('');
    this.success.set('');
    const { name, color, requiresBalance } = this.form.getRawValue();
    const input = { name: name ?? '', color: color ?? undefined, requiresBalance: requiresBalance ?? true };

    const editingId = this.editingId();
    const result = editingId
      ? this.leaveTypeService.update(editingId, input)
      : this.leaveTypeService.create(input);

    if (result.success) {
      this.success.set(editingId ? 'Type mis à jour' : 'Type créé');
      this.resetForm();
    } else {
      this.error.set(result.error ?? 'Une erreur est survenue');
    }
  }

  edit(type: LeaveType): void {
    this.editingId.set(type.id);
    this.form.setValue({ name: type.name, color: type.color, requiresBalance: type.requiresBalance });
  }

  remove(type: LeaveType): void {
    this.error.set('');
    this.success.set('');
    if (this.leaveTypeService.remove(type.id)) {
      this.success.set('Type supprimé');
      if (this.editingId() === type.id) {
        this.resetForm();
      }
    } else {
      this.error.set('Suppression impossible');
    }
  }

  resetForm(): void {
    this.editingId.set(null);
    this.form.reset({ name: '', color: '#3b82f6', requiresBalance: true });
  }
}
