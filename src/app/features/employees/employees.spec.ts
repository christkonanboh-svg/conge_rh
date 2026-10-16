import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { EmployeesComponent } from './employees';
import { AuthService } from '../../core/auth/auth.service';
import { StorageService } from '../../core/storage/storage.service';
import { PasswordHasher } from '../../core/auth/password-hasher';
import { UserRepository } from '../../core/users/user.repository';
import { EmployeeService } from '../../core/employees/employee.service';
import { TeamService } from '../../core/employees/team.service';

describe('EmployeesComponent', () => {
  let fixture: ComponentFixture<EmployeesComponent>;
  let component: EmployeesComponent;
  let employeeService: EmployeeService;
  let teamService: TeamService;
  let userRepository: UserRepository;
  let authService: AuthService;

  beforeEach(async () => {
    localStorage.clear();
    const storage = new StorageService();
    const hasher = new PasswordHasher();
    userRepository = new UserRepository(storage);
    authService = new AuthService(storage, hasher);
    await authService.register('rh@test.fr', 'password123', 'rh');
    teamService = new TeamService(storage, userRepository);
    employeeService = new EmployeeService(userRepository, hasher);

    await TestBed.configureTestingModule({
      imports: [EmployeesComponent],
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: authService },
        { provide: StorageService, useValue: storage },
        { provide: UserRepository, useValue: userRepository },
        { provide: EmployeeService, useValue: employeeService },
        { provide: TeamService, useValue: teamService },
        { provide: PasswordHasher, useValue: hasher },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(EmployeesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display role, team and manager for employees', async () => {
    teamService.create('RH');
    const rh = employeeService.list().find((e) => e.role === 'rh')!;
    const created = await employeeService.create({
      email: 'emp@test.fr',
      firstName: 'John',
      lastName: 'Doe',
      role: 'employe',
      teamId: teamService.teams()[0].id,
      managerId: rh.id,
      password: 'pass1234',
    });
    expect(created.success).toBe(true);
    fixture.detectChanges();
    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(text).toContain('John Doe');
    expect(text).toContain('Employé');
    expect(text).toContain('RH');
  });

  it('should create an employee via the form', async () => {
    const rh = employeeService.list().find((e) => e.role === 'rh')!;
    const mgr = await employeeService.create({
      email: 'mgr@test.fr',
      firstName: 'Mgr',
      lastName: 'One',
      role: 'manager',
      teamId: null,
      managerId: rh.id,
      password: 'pass1234',
    });

    component.startCreate();
    fixture.detectChanges();
    component.form.setValue({
      firstName: 'John',
      lastName: 'Doe',
      email: 'new@test.fr',
      password: 'pass1234',
      role: 'employe',
      teamId: null,
      managerId: mgr.employee!.id,
    });
    await component.onSubmit();
    expect(employeeService.list().some((e) => e.email === 'new@test.fr')).toBe(true);
  });

  it('should update an employee via the form', async () => {
    const rh = employeeService.list().find((e) => e.role === 'rh')!;
    const created = await employeeService.create({
      email: 'emp@test.fr',
      firstName: 'John',
      lastName: 'Doe',
      role: 'employe',
      teamId: null,
      managerId: rh.id,
      password: 'pass1234',
    });
    component.startEdit(created.employee!);
    fixture.detectChanges();
    component.form.patchValue({ firstName: 'Johnny' });
    await component.onSubmit();
    expect(employeeService.findById(created.employee!.id)?.firstName).toBe('Johnny');
  });
});
