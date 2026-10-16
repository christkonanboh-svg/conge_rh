import { Routes } from '@angular/router';
import { authGuard } from './core/auth/auth.guards';

export const routes: Routes = [
  { path: 'login', loadComponent: () => import('./features/auth/login/login').then((m) => m.LoginComponent) },
  { path: 'register', loadComponent: () => import('./features/auth/register/register').then((m) => m.RegisterComponent) },
  { path: '', loadComponent: () => import('./features/home/home').then((m) => m.HomeComponent), canActivate: [authGuard] },
];
