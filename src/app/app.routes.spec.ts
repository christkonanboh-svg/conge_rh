import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { AuthService } from './core/auth/auth.service';
import { StorageService } from './core/storage/storage.service';
import { PasswordHasher } from './core/auth/password-hasher';
import { ROLE_HOME } from './core/access-control/access-control';

describe('app routes', () => {
  let router: Router;
  let authService: AuthService;

  beforeEach(async () => {
    localStorage.clear();
    const storage = new StorageService();
    const hasher = new PasswordHasher();
    authService = new AuthService(storage, hasher);

    await TestBed.configureTestingModule({
      providers: [provideRouter(routes), { provide: AuthService, useValue: authService }],
    }).compileComponents();

    router = TestBed.inject(Router);
  });

  it('should redirect unauthenticated users to login', async () => {
    await router.navigateByUrl('/home');
    expect(router.url).toBe('/login');
  });

  it('should send RH to /employees landing', async () => {
    await authService.register('rh@test.fr', 'password123', 'rh');
    await router.navigateByUrl('/');
    expect(router.url).toBe(ROLE_HOME.rh);
  });

  it('should redirect an Employé away from /employees to /home', async () => {
    await authService.register('emp@test.fr', 'password123', 'employe');
    await router.navigateByUrl('/employees');
    expect(router.url).toBe(ROLE_HOME.employe);
  });

  it('should allow an Employé to reach /home', async () => {
    await authService.register('emp@test.fr', 'password123', 'employe');
    await router.navigateByUrl('/home');
    expect(router.url).toBe('/home');
  });

  it('should allow any authenticated role to reach /requests', async () => {
    await authService.register('emp@test.fr', 'password123', 'employe');
    await router.navigateByUrl('/requests');
    expect(router.url).toBe('/requests');
  });

  it('should redirect an Employé away from /leave-types to /home', async () => {
    await authService.register('emp@test.fr', 'password123', 'employe');
    await router.navigateByUrl('/leave-types');
    expect(router.url).toBe(ROLE_HOME.employe);
  });

  it('should allow RH to reach /leave-types', async () => {
    await authService.register('rh@test.fr', 'password123', 'rh');
    await router.navigateByUrl('/leave-types');
    expect(router.url).toBe('/leave-types');
  });
});
