import { Component, computed, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';
import { NAV_ITEMS } from '../../core/access-control/access-control';
import { USER_ROLE_LABELS } from '../../core/auth/auth.models';

@Component({
  selector: 'app-shell',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <div class="min-h-screen flex flex-col bg-gray-100">
      <header class="bg-white shadow">
        <div class="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between flex-wrap gap-2">
          <nav class="flex gap-4 flex-wrap">
            @for (item of navItems(); track item.route) {
              <a
                [routerLink]="item.route"
                routerLinkActive="text-blue-700 font-semibold"
                [routerLinkActiveOptions]="{ exact: true }"
                class="text-gray-700 hover:text-blue-600"
              >
                {{ item.label }}
              </a>
            }
          </nav>
          <div class="flex items-center gap-3 text-sm">
            <span class="text-gray-600">
              {{ auth.currentUser()?.email }} ({{ roleLabel() }})
            </span>
            <button (click)="logout()" class="bg-red-600 text-white px-3 py-1.5 rounded hover:bg-red-700">
              Déconnexion
            </button>
          </div>
        </div>
      </header>
      <main class="flex-1">
        <router-outlet />
      </main>
    </div>
  `,
})
export class ShellComponent {
  readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  readonly navItems = computed(() => {
    const user = this.auth.currentUser();
    if (!user) {
      return [];
    }
    return NAV_ITEMS.filter((item) => item.roles.includes(user.role));
  });

  readonly roleLabel = computed(() => {
    const user = this.auth.currentUser();
    return user ? USER_ROLE_LABELS[user.role] : '';
  });

  async logout(): Promise<void> {
    this.auth.logout();
    await this.router.navigate(['/login']);
  }
}
