import { Component, inject } from '@angular/core';
import { AuthService } from '../../core/auth/auth.service';
import { USER_ROLE_LABELS } from '../../core/auth/auth.models';

@Component({
  selector: 'app-home',
  template: `
    <div class="p-8">
      <div class="max-w-2xl mx-auto">
        <div class="bg-white p-6 rounded shadow">
          <p>Vous êtes connecté en tant que : <strong>{{ auth.currentUser()?.email }}</strong></p>
          <p>Rôle : <strong>{{ roleLabel() }}</strong></p>
        </div>
      </div>
    </div>
  `,
})
export class HomeComponent {
  readonly auth = inject(AuthService);

  roleLabel(): string {
    const user = this.auth.currentUser();
    return user ? USER_ROLE_LABELS[user.role] : '';
  }
}
