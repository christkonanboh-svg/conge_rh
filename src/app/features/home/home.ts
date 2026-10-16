import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';

@Component({
  selector: 'app-home',
  template: `
    <div class="p-8">
      <div class="max-w-2xl mx-auto">
        <div class="flex justify-between items-center mb-6">
          <h1 class="text-2xl font-bold">Application Congé RH</h1>
          <button (click)="logout()" class="bg-red-600 text-white px-4 py-2 rounded">Déconnexion</button>
        </div>
        <div class="bg-white p-6 rounded shadow">
          <p>Vous êtes connecté en tant que : <strong>{{ auth.currentUser()?.email }}</strong></p>
          <p>Rôle : <strong>{{ auth.currentUser()?.role }}</strong></p>
        </div>
      </div>
    </div>
  `,
})
export class HomeComponent {
  readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  async logout(): Promise<void> {
    this.auth.logout();
    await this.router.navigate(['/login']);
  }
}
