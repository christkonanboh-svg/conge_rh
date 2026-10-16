import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { ShellComponent } from './shell';
import { AuthService } from '../../core/auth/auth.service';
import { StorageService } from '../../core/storage/storage.service';
import { PasswordHasher } from '../../core/auth/password-hasher';

describe('ShellComponent', () => {
  let fixture: ComponentFixture<ShellComponent>;
  let element: HTMLElement;

  async function setup(role: 'employe' | 'manager' | 'rh'): Promise<void> {
    localStorage.clear();
    const storage = new StorageService();
    const hasher = new PasswordHasher();
    const authService = new AuthService(storage, hasher);
    await authService.register(`user-${role}@test.fr`, 'password123', role);

    await TestBed.configureTestingModule({
      imports: [ShellComponent],
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: authService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ShellComponent);
    element = fixture.nativeElement as HTMLElement;
    fixture.detectChanges();
  }

  it('should show Employees and Teams entries for RH', async () => {
    await setup('rh');
    const text = element.textContent ?? '';
    expect(text).toContain('Employés');
    expect(text).toContain('Équipes');
  });

  it('should hide Employees and Teams entries for Employé', async () => {
    await setup('employe');
    const text = element.textContent ?? '';
    expect(text).not.toContain('Employés');
    expect(text).not.toContain('Équipes');
    expect(text).toContain('Accueil');
  });

  it('should hide Employees and Teams entries for Manager', async () => {
    await setup('manager');
    const text = element.textContent ?? '';
    expect(text).not.toContain('Employés');
    expect(text).not.toContain('Équipes');
    expect(text).toContain('Accueil');
  });
});
