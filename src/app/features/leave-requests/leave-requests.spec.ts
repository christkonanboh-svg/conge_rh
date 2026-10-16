import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { LeaveRequestsComponent } from './leave-requests';
import { AuthService } from '../../core/auth/auth.service';
import { StorageService } from '../../core/storage/storage.service';
import { PasswordHasher } from '../../core/auth/password-hasher';
import { UserRepository } from '../../core/users/user.repository';
import { LeaveTypeService } from '../../core/leave-requests/leave-type.service';
import { LeaveRequestService } from '../../core/leave-requests/leave-request.service';
import { LeaveBalanceService } from '../../core/leave-balances/leave-balance.service';
import { StoredUser } from '../../core/auth/auth.models';

describe('LeaveRequestsComponent', () => {
  let fixture: ComponentFixture<LeaveRequestsComponent>;
  let component: LeaveRequestsComponent;
  let authService: AuthService;
  let leaveTypeService: LeaveTypeService;
  let leaveRequestService: LeaveRequestService;
  let leaveBalanceService: LeaveBalanceService;

  beforeEach(async () => {
    localStorage.clear();
    const storage = new StorageService();
    const hasher = new PasswordHasher();
    const userRepository = new UserRepository(storage);
    authService = new AuthService(storage, hasher);
    await authService.register('emp@test.fr', 'password123', 'employe');
    leaveTypeService = new LeaveTypeService(storage);
    leaveBalanceService = new LeaveBalanceService(storage);
    leaveRequestService = new LeaveRequestService(storage, userRepository, leaveTypeService, leaveBalanceService);

    await TestBed.configureTestingModule({
      imports: [LeaveRequestsComponent],
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: authService },
        { provide: StorageService, useValue: storage },
        { provide: UserRepository, useValue: userRepository },
        { provide: LeaveTypeService, useValue: leaveTypeService },
        { provide: LeaveRequestService, useValue: leaveRequestService },
        { provide: LeaveBalanceService, useValue: leaveBalanceService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(LeaveRequestsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should submit a request through the form', () => {
    const type = leaveTypeService.create({ name: 'Congé payé', requiresBalance: false }).leaveType!;
    component.form.setValue({
      leaveTypeId: type.id,
      startDate: '2026-03-02',
      endDate: '2026-03-06',
      reason: 'Vacances',
    });

    component.onSubmit();
    fixture.detectChanges();

    expect(component.error()).toBe('');
    expect(leaveRequestService.list().length).toBe(1);
    expect(leaveRequestService.list()[0].workingDays).toBe(5);
    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(text).toContain('2026-03-02');
  });

  it('should reject an invalid period', () => {
    const type = leaveTypeService.create({ name: 'Congé payé', requiresBalance: false }).leaveType!;
    component.form.setValue({
      leaveTypeId: type.id,
      startDate: '2026-03-07',
      endDate: '2026-03-08',
      reason: '',
    });
    component.onSubmit();
    expect(component.error()).not.toBe('');
    expect(leaveRequestService.list().length).toBe(0);
  });

  it('should expose the current year balances', () => {
    const type = leaveTypeService.create({ name: 'Congé payé', requiresBalance: true }).leaveType!;
    const user = authService.currentUser()!;
    leaveBalanceService.setAllowance(user.id, type.id, new Date().getFullYear(), 25);
    fixture.detectChanges();
    expect(component.balanceRows().length).toBe(1);
    expect(component.balanceRows()[0].remaining).toBe(25);
  });

  it('should filter the list by type and reset it', () => {
    const paid = leaveTypeService.create({ name: 'Congé payé', requiresBalance: false }).leaveType!;
    const rtt = leaveTypeService.create({ name: 'RTT', requiresBalance: false }).leaveType!;

    component.form.setValue({ leaveTypeId: paid.id, startDate: '2026-03-02', endDate: '2026-03-06', reason: '' });
    component.onSubmit();
    component.form.setValue({ leaveTypeId: rtt.id, startDate: '2026-04-06', endDate: '2026-04-07', reason: '' });
    component.onSubmit();
    fixture.detectChanges();
    expect(component.filteredRequests().length).toBe(2);

    component.filterForm.patchValue({ leaveTypeId: rtt.id });
    fixture.detectChanges();
    expect(component.filteredRequests().length).toBe(1);
    expect(component.filteredRequests()[0].leaveTypeId).toBe(rtt.id);

    component.resetFilters();
    fixture.detectChanges();
    expect(component.filteredRequests().length).toBe(2);
  });

  it('should narrow the list with the text search and restore it', () => {
    const type = leaveTypeService.create({ name: 'Congé payé', requiresBalance: false }).leaveType!;
    component.form.setValue({ leaveTypeId: type.id, startDate: '2026-03-02', endDate: '2026-03-06', reason: '' });
    component.onSubmit();
    fixture.detectChanges();

    component.filterForm.patchValue({ search: 'zzz-introuvable' });
    fixture.detectChanges();
    expect(component.filteredRequests().length).toBe(0);

    component.resetFilters();
    fixture.detectChanges();
    expect(component.filteredRequests().length).toBe(1);
  });
});

describe('LeaveRequestsComponent - role scope with filters', () => {
  let fixture: ComponentFixture<LeaveRequestsComponent>;
  let component: LeaveRequestsComponent;
  let leaveTypeService: LeaveTypeService;
  let leaveRequestService: LeaveRequestService;

  beforeEach(async () => {
    localStorage.clear();
    const storage = new StorageService();
    const hasher = new PasswordHasher();
    const userRepository = new UserRepository(storage);
    const authService = new AuthService(storage, hasher);
    const manager = await authService.register('manager@test.fr', 'password123', 'manager');
    const managerId = manager.user!.id;

    userRepository.add(makeUser('e1', 'Alice', 'Martin', managerId));
    userRepository.add(makeUser('e2', 'Bob', 'Durand', null));

    leaveTypeService = new LeaveTypeService(storage);
    const leaveBalanceService = new LeaveBalanceService(storage);
    leaveRequestService = new LeaveRequestService(storage, userRepository, leaveTypeService, leaveBalanceService);
    const type = leaveTypeService.create({ name: 'Congé payé', requiresBalance: false }).leaveType!;
    leaveRequestService.submit({ employeeId: 'e1', leaveTypeId: type.id, startDate: '2026-03-02', endDate: '2026-03-06' });
    leaveRequestService.submit({ employeeId: 'e2', leaveTypeId: type.id, startDate: '2026-03-02', endDate: '2026-03-06' });

    await TestBed.configureTestingModule({
      imports: [LeaveRequestsComponent],
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: authService },
        { provide: StorageService, useValue: storage },
        { provide: UserRepository, useValue: userRepository },
        { provide: LeaveTypeService, useValue: leaveTypeService },
        { provide: LeaveRequestService, useValue: leaveRequestService },
        { provide: LeaveBalanceService, useValue: leaveBalanceService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(LeaveRequestsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should never surface out-of-team requests even with a permissive filter', () => {
    expect(component.visibleRequests()).toHaveLength(1);
    expect(component.visibleRequests()[0].employeeId).toBe('e1');

    component.filterForm.patchValue({ leaveTypeId: leaveTypeService.list()[0].id, status: 'en_attente' });
    fixture.detectChanges();

    expect(component.filteredRequests()).toHaveLength(1);
    expect(component.filteredRequests()[0].employeeId).toBe('e1');

    component.filterForm.patchValue({ search: 'Durand' });
    fixture.detectChanges();
    expect(component.filteredRequests()).toHaveLength(0);
  });
});

function makeUser(id: string, firstName: string, lastName: string, managerId: string | null): StoredUser {
  return {
    id,
    email: `${firstName.toLowerCase()}@test.fr`,
    role: 'employe',
    passwordHash: 'h',
    salt: 's',
    iterations: 1,
    createdAt: '2026-01-01T00:00:00.000Z',
    firstName,
    lastName,
    teamId: null,
    managerId,
  };
}
