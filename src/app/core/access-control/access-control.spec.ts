import { TestBed } from '@angular/core/testing';
import { Router, UrlTree, provideRouter } from '@angular/router';
import { AuthService } from '../auth/auth.service';
import { StorageService } from '../storage/storage.service';
import { PasswordHasher } from '../auth/password-hasher';
import { roleGuard, roleHomeRedirectGuard, ROLE_HOME } from './access-control';

describe('AccessControl', () => {
  let authService: AuthService;
  let router: Router;

  beforeEach(async () => {
    localStorage.clear();
    const storage = new StorageService();
    const hasher = new PasswordHasher();
    authService = new AuthService(storage, hasher);

    await TestBed.configureTestingModule({
      providers: [
        provideRouter([{ path: 'login', children: [] }, { path: 'home', children: [] }, { path: 'employees', children: [] }]),
        { provide: AuthService, useValue: authService },
      ],
    }).compileComponents();

    router = TestBed.inject(Router);
  });

  it('should redirect unauthenticated to login', () => {
    const guard = roleGuard('rh');
    const result = TestBed.runInInjectionContext(() => guard({} as any, {} as any));
    expect(result).toBeInstanceOf(UrlTree);
    expect(router.serializeUrl(result as UrlTree)).toBe('/login');
  });

  it('should allow access when role is in allowed list', async () => {
    await authService.register('rh@test.fr', 'password123', 'rh');
    const guard = roleGuard('rh', 'manager');
    const result = TestBed.runInInjectionContext(() => guard({} as any, {} as any));
    expect(result).toBe(true);
  });

  it('should deny access and redirect to role home when role not allowed', async () => {
    await authService.register('emp@test.fr', 'password123', 'employe');
    const guard = roleGuard('rh');
    const result = TestBed.runInInjectionContext(() => guard({} as any, {} as any));
    expect(result).toBeInstanceOf(UrlTree);
    expect(router.serializeUrl(result as UrlTree)).toBe(ROLE_HOME.employe);
  });

  it('should redirect to role home via redirect guard', async () => {
    await authService.register('emp@test.fr', 'password123', 'employe');
    const result = TestBed.runInInjectionContext(() => roleHomeRedirectGuard({} as any, {} as any));
    expect(result).toBeInstanceOf(UrlTree);
    expect(router.serializeUrl(result as UrlTree)).toBe(ROLE_HOME.employe);

    authService.logout();
    await authService.register('rh@test.fr', 'password123', 'rh');
    const resultRh = TestBed.runInInjectionContext(() => roleHomeRedirectGuard({} as any, {} as any));
    expect(router.serializeUrl(resultRh as UrlTree)).toBe(ROLE_HOME.rh);
  });

  it('should redirect unauthenticated via home redirect', () => {
    const result = TestBed.runInInjectionContext(() => roleHomeRedirectGuard({} as any, {} as any));
    expect(result).toBeInstanceOf(UrlTree);
    expect(router.serializeUrl(result as UrlTree)).toBe('/login');
  });
});
