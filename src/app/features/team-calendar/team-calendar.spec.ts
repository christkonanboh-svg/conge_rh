import { ComponentFixture, TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import { TeamCalendarComponent } from './team-calendar';
import { AuthService } from '../../core/auth/auth.service';
import { PasswordHasher } from '../../core/auth/password-hasher';
import { StoredUser } from '../../core/auth/auth.models';
import { StorageService } from '../../core/storage/storage.service';
import { UserRepository } from '../../core/users/user.repository';
import { TeamService } from '../../core/employees/team.service';
import { LeaveTypeService } from '../../core/leave-requests/leave-type.service';
import { LeaveRequestService } from '../../core/leave-requests/leave-request.service';
import { LeaveBalanceService } from '../../core/leave-balances/leave-balance.service';

const SELECTION_KEY = 'conge_rh.teamCalendarSelection';

function makeUser(
  id: string,
  firstName: string,
  lastName: string,
  teamId: string | null,
  managerId: string | null = null
): StoredUser {
  return {
    id,
    email: `${id}@test.fr`,
    role: 'employe',
    passwordHash: 'h',
    salt: 's',
    iterations: 1,
    createdAt: '2026-01-01T00:00:00.000Z',
    firstName,
    lastName,
    teamId,
    managerId,
  };
}

function provideAll(services: {
  storage: StorageService;
  userRepository: UserRepository;
  authService: AuthService;
  teamService: TeamService;
  leaveTypeService: LeaveTypeService;
  leaveRequestService: LeaveRequestService;
  leaveBalanceService: LeaveBalanceService;
}) {
  return [
    { provide: StorageService, useValue: services.storage },
    { provide: UserRepository, useValue: services.userRepository },
    { provide: AuthService, useValue: services.authService },
    { provide: TeamService, useValue: services.teamService },
    { provide: LeaveTypeService, useValue: services.leaveTypeService },
    { provide: LeaveRequestService, useValue: services.leaveRequestService },
    { provide: LeaveBalanceService, useValue: services.leaveBalanceService },
  ];
}

describe('TeamCalendarComponent (rh)', () => {
  let fixture: ComponentFixture<TeamCalendarComponent>;
  let component: TeamCalendarComponent;
  let userRepository: UserRepository;
  let teamIdA: string;
  let teamIdB: string;

  beforeEach(async () => {
    localStorage.clear();
    const storage = new StorageService();
    const hasher = new PasswordHasher();
    userRepository = new UserRepository(storage);
    const authService = new AuthService(storage, hasher);
    const teamService = new TeamService(storage, userRepository);
    const leaveTypeService = new LeaveTypeService(storage);
    const leaveBalanceService = new LeaveBalanceService(storage);
    const leaveRequestService = new LeaveRequestService(storage, userRepository, leaveTypeService, leaveBalanceService);

    const rh = (await authService.register('rh@test.fr', 'password123', 'rh')).user!;
    teamIdA = teamService.create('Équipe A').team!.id;
    teamIdB = teamService.create('Équipe B').team!.id;
    userRepository.add(makeUser('e1', 'Alice', 'Martin', teamIdA));
    userRepository.add(makeUser('e2', 'Bob', 'Durand', teamIdA));
    userRepository.add(makeUser('e3', 'Carla', 'Petit', teamIdB));

    const type = leaveTypeService.create({ name: 'Congé payé', requiresBalance: false }).leaveType!;
    const r1 = leaveRequestService.submit({ employeeId: 'e1', leaveTypeId: type.id, startDate: '2026-03-02', endDate: '2026-03-06' }).request!;
    leaveRequestService.approve(r1.id, rh);
    const r2 = leaveRequestService.submit({ employeeId: 'e2', leaveTypeId: type.id, startDate: '2026-03-04', endDate: '2026-03-05' }).request!;
    leaveRequestService.approve(r2.id, rh);
    const r3 = leaveRequestService.submit({ employeeId: 'e3', leaveTypeId: type.id, startDate: '2026-03-04', endDate: '2026-03-05' }).request!;
    leaveRequestService.approve(r3.id, rh);

    localStorage.setItem(SELECTION_KEY, JSON.stringify({ year: 2026, month: 3, teamId: teamIdA }));

    await TestBed.configureTestingModule({
      imports: [TeamCalendarComponent],
      providers: provideAll({
        storage,
        userRepository,
        authService,
        teamService,
        leaveTypeService,
        leaveRequestService,
        leaveBalanceService,
      }),
    }).compileComponents();

    fixture = TestBed.createComponent(TeamCalendarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('restores the persisted month/team and only shows that team', () => {
    expect(component.isRh()).toBe(true);
    expect(component.effectiveTeamId()).toBe(teamIdA);
    expect(component.members().map((member) => member.id).sort()).toEqual(['e1', 'e2']);
    expect(component.monthLabel()).toContain('mars');
    expect(component.weeks().length).toBeGreaterThanOrEqual(4);
  });

  it('flags overlap days and hides out-of-team absences', () => {
    expect(component.overlapFor('2026-03-02')?.hasOverlap).toBe(false);
    expect(component.overlapFor('2026-03-04')?.hasOverlap).toBe(true);
    expect(component.overlapFor('2026-03-04')?.employeeIds.sort()).toEqual(['e1', 'e2']);
    expect(component.overlapFor('2026-03-05')?.hasOverlap).toBe(true);
    expect(component.overlapFor('2026-03-06')?.hasOverlap).toBe(false);
  });

  it('updates and persists the month when navigating', () => {
    component.nextMonth();
    expect(component.monthLabel()).toContain('avril');
    expect(component.selection().month).toBe(4);
    const saved = JSON.parse(localStorage.getItem(SELECTION_KEY)!);
    expect(saved.month).toBe(4);

    component.previousMonth();
    expect(component.selection().month).toBe(3);
  });
});

describe('TeamCalendarComponent (manager scope)', () => {
  it('locks the calendar to the manager own team regardless of stored selection', async () => {
    localStorage.clear();
    const storage = new StorageService();
    const hasher = new PasswordHasher();
    const userRepository = new UserRepository(storage);
    const authService = new AuthService(storage, hasher);
    const teamService = new TeamService(storage, userRepository);
    const leaveTypeService = new LeaveTypeService(storage);
    const leaveBalanceService = new LeaveBalanceService(storage);
    const leaveRequestService = new LeaveRequestService(storage, userRepository, leaveTypeService, leaveBalanceService);

    const manager = (await authService.register('manager@test.fr', 'password123', 'manager')).user!;
    const teamIdA = teamService.create('Équipe A').team!.id;
    const teamIdB = teamService.create('Équipe B').team!.id;
    const stored = userRepository.findById(manager.id)!;
    userRepository.update({ ...stored, teamId: teamIdA });
    userRepository.add(makeUser('e1', 'Alice', 'Martin', teamIdA));
    userRepository.add(makeUser('e9', 'Zoe', 'Autre', teamIdB));

    localStorage.setItem(SELECTION_KEY, JSON.stringify({ year: 2026, month: 3, teamId: teamIdB }));

    await TestBed.configureTestingModule({
      imports: [TeamCalendarComponent],
      providers: provideAll({
        storage,
        userRepository,
        authService,
        teamService,
        leaveTypeService,
        leaveRequestService,
        leaveBalanceService,
      }),
    }).compileComponents();

    const fixture = TestBed.createComponent(TeamCalendarComponent);
    const component = fixture.componentInstance;
    fixture.detectChanges();

    expect(component.isRh()).toBe(false);
    expect(component.effectiveTeamId()).toBe(teamIdA);
    expect(component.members().map((member) => member.id).sort()).toEqual([manager.id, 'e1'].sort());
  });
});
