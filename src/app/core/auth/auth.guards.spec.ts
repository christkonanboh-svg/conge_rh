import { TestBed } from '@angular/core/testing';
import { Router, UrlTree, provideRouter } from '@angular/router';
import { AuthService } from './auth.service';
import { StorageService } from '../storage/storage.service';
import { PasswordHasher } from './password-hasher';
import { authGuard, roleGuard } from './auth.guards';

describe('Auth Guards', () => {
  let authService: AuthService;
  let router: Router;

  beforeEach(async () => {
    localStorage.clear();
    const storage = new StorageService();
    const hasher = new PasswordHasher();
    authService = new AuthService(storage, hasher);

    await TestBed.configureTestingModule({
      providers: [
        provideRouter([{ path: 'login', children: [] }]),
        { provide: AuthService, useValue: authService },
      ],
    }).compileComponents();

    router = TestBed.inject(Router);
  });

  describe('authGuard', () => {
    it('should allow access when authenticated', async () => {
      await authService.register('test@test.fr', 'password123');
      const result = TestBed.runInInjectionContext(() => authGuard({} as any, {} as any));
      expect(result).toBe(true);
    });

    it('should redirect to login when not authenticated', () => {
      const result = TestBed.runInInjectionContext(() => authGuard({} as any, {} as any));
      expect(result).toBeInstanceOf(UrlTree);
      expect(router.serializeUrl(result as UrlTree)).toBe('/login');
    });
  });

  describe('roleGuard', () => {
    it('should redirect to login when not authenticated', () => {
      const guard = roleGuard('rh');
      const result = TestBed.runInInjectionContext(() => guard({} as any, {} as any));
      expect(result).toBeInstanceOf(UrlTree);
      expect(router.serializeUrl(result as UrlTree)).toBe('/login');
    });

    it('should redirect when role does not match', async () => {
      await authService.register('user@test.fr', 'password123', 'employe');
      const guard = roleGuard('rh');
      const result = TestBed.runInInjectionContext(() => guard({} as any, {} as any));
      expect(result).toBeInstanceOf(UrlTree);
      expect(router.serializeUrl(result as UrlTree)).toBe('/login');
    });

    it('should allow access when role matches', async () => {
      await authService.register('admin@test.fr', 'password123', 'rh');
      const guard = roleGuard('rh');
      const result = TestBed.runInInjectionContext(() => guard({} as any, {} as any));
      expect(result).toBe(true);
    });
  });
});
