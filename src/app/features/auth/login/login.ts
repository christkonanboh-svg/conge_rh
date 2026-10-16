import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { NgIf } from '@angular/common';
import { AuthService } from '../../../core/auth/auth.service';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, RouterLink, NgIf],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-gray-100">
      <div class="bg-white p-8 rounded shadow-md w-full max-w-md">
        <h1 class="text-2xl font-bold mb-6 text-center">Connexion</h1>
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
              autocomplete="current-password"
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
            Se connecter
          </button>
        </form>
        <div class="mt-4 text-center">
          <a routerLink="/register" class="text-blue-600 hover:underline">Créer un compte</a>
        </div>
        <div class="mt-6 text-sm text-gray-600 border-t pt-4">
          <p class="font-semibold mb-2">Comptes de démonstration :</p>
          <ul class="space-y-1">
            <li>Employé : <code class="bg-gray-100 px-1">employe@demo.local</code> / <code class="bg-gray-100 px-1">demo1234</code></li>
            <li>Manager : <code class="bg-gray-100 px-1">manager@demo.local</code> / <code class="bg-gray-100 px-1">demo1234</code></li>
            <li>RH/Admin : <code class="bg-gray-100 px-1">rh@demo.local</code> / <code class="bg-gray-100 px-1">demo1234</code></li>
          </ul>
        </div>
      </div>
    </div>
  `,
})
export class LoginComponent {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
  });

  loading = false;
  error = '';

  async onSubmit(): Promise<void> {
    if (this.form.invalid) return;
    this.loading = true;
    this.error = '';
    const { email, password } = this.form.value;
    const result = await this.auth.login(email || '', password || '');
    if (result.success) {
      await this.router.navigate(['/']);
    } else {
      this.error = result.error || 'Erreur de connexion';
    }
    this.loading = false;
  }
}
