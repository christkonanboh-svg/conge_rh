import { TestBed } from '@angular/core/testing';
import { Router, UrlTree, provideRouter } from '@angular/router';
import { AuthService } from './auth.service';
import { StorageService } from '../storage/storage.service';
import { PasswordHasher } from './password-hasher';
import { authGuard } from './auth.guards';

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
});
