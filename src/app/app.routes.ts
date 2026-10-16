import { Routes } from '@angular/router';
import { authGuard } from './core/auth/auth.guards';
import { roleGuard, roleHomeRedirectGuard } from './core/access-control/access-control';

export const routes: Routes = [
  { path: 'login', loadComponent: () => import('./features/auth/login/login').then((m) => m.LoginComponent) },
  { path: 'register', loadComponent: () => import('./features/auth/register/register').then((m) => m.RegisterComponent) },
  {
    path: '',
    loadComponent: () => import('./features/shell/shell').then((m) => m.ShellComponent),
    canActivate: [authGuard],
    children: [
      { path: '', canActivate: [roleHomeRedirectGuard], children: [] },
      { path: 'home', loadComponent: () => import('./features/home/home').then((m) => m.HomeComponent) },
      {
        path: 'employees',
        canActivate: [roleGuard('rh')],
        loadComponent: () => import('./features/employees/employees').then((m) => m.EmployeesComponent),
      },
      {
        path: 'teams',
        canActivate: [roleGuard('rh')],
        loadComponent: () => import('./features/teams/teams').then((m) => m.TeamsComponent),
      },
      {
        path: 'requests',
        loadComponent: () =>
          import('./features/leave-requests/leave-requests').then((m) => m.LeaveRequestsComponent),
      },
      {
        path: 'calendar',
        loadComponent: () => import('./features/team-calendar/team-calendar').then((m) => m.TeamCalendarComponent),
      },
      {
        path: 'dashboard',
        loadComponent: () => import('./features/dashboard/dashboard').then((m) => m.DashboardComponent),
      },
      {
        path: 'leave-types',
        canActivate: [roleGuard('rh')],
        loadComponent: () => import('./features/leave-types/leave-types').then((m) => m.LeaveTypesComponent),
      },
    ],
  },
];
