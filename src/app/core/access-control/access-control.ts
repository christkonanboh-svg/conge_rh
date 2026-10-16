import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../auth/auth.service';
import { UserRole } from '../auth/auth.models';

export const ROLE_HOME: Record<UserRole, string> = {
  employe: '/home',
  manager: '/home',
  rh: '/employees',
};

export const roleGuard = (...allowed: UserRole[]): CanActivateFn => {
  return () => {
    const auth = inject(AuthService);
    const router = inject(Router);
    const user = auth.currentUser();

    if (!user) {
      return router.createUrlTree(['/login']);
    }

    if (allowed.includes(user.role)) {
      return true;
    }

    return router.createUrlTree([ROLE_HOME[user.role]]);
  };
};

export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (auth.isAuthenticated()) {
    return true;
  }

  return router.createUrlTree(['/login']);
};

export const NAV_ITEMS: Array<{ label: string; route: string; roles: UserRole[] }> = [
  { label: 'Accueil', route: '/home', roles: ['employe', 'manager', 'rh'] },
  { label: 'Demandes', route: '/requests', roles: ['employe', 'manager', 'rh'] },
  { label: 'Employés', route: '/employees', roles: ['rh'] },
  { label: 'Équipes', route: '/teams', roles: ['rh'] },
  { label: 'Types de congé', route: '/leave-types', roles: ['rh'] },
];

export const roleHomeRedirectGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const user = auth.currentUser();

  if (!user) {
    return router.createUrlTree(['/login']);
  }

  return router.createUrlTree([ROLE_HOME[user.role]]);
};
