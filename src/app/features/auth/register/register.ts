import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { NgIf } from '@angular/common';
import { AuthService } from '../../../core/auth/auth.service';

@Component({
  selector: 'app-register',
  imports: [ReactiveFormsModule, RouterLink, NgIf],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-gray-100">
      <div class="bg-white p-8 rounded shadow-md w-full max-w-md">
        <h1 class="text-2xl font-bold mb-6 text-center">Inscription</h1>
        <form [formGroup]="form" (ngSubmit)="onSubmit()" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              formControlName="email"
              class="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
              autocomplete="email"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700">Mot de passe</label>
            <input
              type="password"
              formControlName="password"
              class="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
              autocomplete="new-password"
            />
          </div>
          <div *ngIf="error" class="text-red-600 text-sm">
            {{ error }}
          </div>
          <button
            type="submit"
            [disabled]="form.invalid || loading"
            class="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            S'inscrire
          </button>
        </form>
        <div class="mt-4 text-center">
          <a routerLink="/login" class="text-blue-600 hover:underline">Déjà un compte ? Se connecter</a>
        </div>
      </div>
    </div>
  `,
})
export class RegisterComponent {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(4)]],
  });

  loading = false;
  error = '';

  async onSubmit(): Promise<void> {
    if (this.form.invalid) return;
    this.loading = true;
    this.error = '';
    const { email, password } = this.form.value;
    const result = await this.auth.register(email || '', password || '');
    if (result.success) {
      await this.router.navigate(['/']);
    } else {
      this.error = result.error || 'Erreur d\'inscription';
    }
    this.loading = false;
  }
}
