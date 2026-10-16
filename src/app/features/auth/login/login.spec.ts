import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { LoginComponent } from './login';
import { AuthService } from '../../../core/auth/auth.service';
import { StorageService } from '../../../core/storage/storage.service';
import { PasswordHasher } from '../../../core/auth/password-hasher';

describe('LoginComponent', () => {
  let fixture: ComponentFixture<LoginComponent>;
  let component: LoginComponent;

  beforeEach(async () => {
    localStorage.clear();
    const storage = new StorageService();
    const hasher = new PasswordHasher();
    const authService = new AuthService(storage, hasher);

    await TestBed.configureTestingModule({
      imports: [LoginComponent],
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: authService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have invalid form when empty', () => {
    expect(component.form.valid).toBe(false);
  });

  it('should enable submit when form is valid', () => {
    component.form.setValue({ email: 'test@test.fr', password: 'pass1234' });
    expect(component.form.valid).toBe(true);
  });
});
