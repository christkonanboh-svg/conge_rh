import { ComponentFixture, TestBed } from '@angular/core/testing';
import { beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { provideCharts, withDefaultRegisterables } from 'ng2-charts';
import { DashboardComponent } from './dashboard';
import { AuthService } from '../../core/auth/auth.service';
import { PasswordHasher } from '../../core/auth/password-hasher';
import { StorageService } from '../../core/storage/storage.service';
import { UserRepository } from '../../core/users/user.repository';
import { TeamService } from '../../core/employees/team.service';
import { LeaveTypeService } from '../../core/leave-requests/leave-type.service';
import { LeaveRequestService } from '../../core/leave-requests/leave-request.service';
import { LeaveBalanceService } from '../../core/leave-balances/leave-balance.service';

beforeAll(() => {
  HTMLCanvasElement.prototype.getContext = function (this: HTMLCanvasElement) {
    return new Proxy(
      {},
      {
        get: (_target, prop) => {
          if (prop === 'canvas') {
            return this;
          }
          if (prop === 'measureText') {
            return () => ({ width: 0 });
          }
          if (prop === 'createLinearGradient' || prop === 'createRadialGradient') {
            return () => ({ addColorStop: () => undefined });
          }
          return () => undefined;
        },
        set: () => true,
      }
    ) as unknown as CanvasRenderingContext2D;
  } as unknown as typeof HTMLCanvasElement.prototype.getContext;
});

interface World {
  storage: StorageService;
  userRepository: UserRepository;
  authService: AuthService;
  teamService: TeamService;
  leaveTypeService: LeaveTypeService;
  leaveRequestService: LeaveRequestService;
  leaveBalanceService: LeaveBalanceService;
}

async function buildWorld(): Promise<World> {
  localStorage.clear();
  const storage = new StorageService();
  const hasher = new PasswordHasher();
  const userRepository = new UserRepository(storage);
  const authService = new AuthService(storage, hasher);
  const teamService = new TeamService(storage, userRepository);
  const leaveTypeService = new LeaveTypeService(storage);
  const leaveBalanceService = new LeaveBalanceService(storage);
  const leaveRequestService = new LeaveRequestService(storage, userRepository, leaveTypeService, leaveBalanceService);

  const rh = (await authService.register('rh@test.fr', 'password123', 'rh')).user!;
  const manager = (await authService.register('m@test.fr', 'password123', 'manager')).user!;
  const employe = (await authService.register('e@test.fr', 'password123', 'employe')).user!;
  const other = (await authService.register('f@test.fr', 'password123', 'employe')).user!;

  userRepository.update({ ...userRepository.findById(employe.id)!, managerId: manager.id });

  const type = leaveTypeService.create({ name: 'Congé payé', requiresBalance: false }).leaveType!;
  const year = new Date().getFullYear();
  const rE = leaveRequestService
    .submit({ employeeId: employe.id, leaveTypeId: type.id, startDate: `${year}-03-02`, endDate: `${year}-03-06` })
    .request!;
  leaveRequestService.approve(rE.id, rh);
  const rF = leaveRequestService
    .submit({ employeeId: other.id, leaveTypeId: type.id, startDate: `${year}-03-04`, endDate: `${year}-03-05` }).request;
  if (rF) {
    leaveRequestService.approve(rF.id, rh);
  }

  return { storage, userRepository, authService, teamService, leaveTypeService, leaveRequestService, leaveBalanceService };
}

async function setup(world: World, email: string): Promise<ComponentFixture<DashboardComponent>> {
  await world.authService.login(email, 'password123');
  await TestBed.configureTestingModule({
    imports: [DashboardComponent],
    providers: [
      provideCharts(withDefaultRegisterables()),
      { provide: StorageService, useValue: world.storage },
      { provide: UserRepository, useValue: world.userRepository },
      { provide: AuthService, useValue: world.authService },
      { provide: TeamService, useValue: world.teamService },
      { provide: LeaveTypeService, useValue: world.leaveTypeService },
      { provide: LeaveRequestService, useValue: world.leaveRequestService },
      { provide: LeaveBalanceService, useValue: world.leaveBalanceService },
    ],
  }).compileComponents();

  const fixture = TestBed.createComponent(DashboardComponent);
  fixture.detectChanges();
  return fixture;
}

describe('DashboardComponent role scoping', () => {
  let world: World;

  beforeEach(async () => {
    world = await buildWorld();
  });

  it('shows all requests and employees for RH', async () => {
    const fixture = await setup(world, 'rh@test.fr');
    const component = fixture.componentInstance;

    expect(component.scope().requests).toHaveLength(2);
    expect(component.scope().employees).toHaveLength(4);
    expect(component.kpis().approvedDays).toBe(7);
    expect((fixture.nativeElement as HTMLElement).textContent).toContain('Taux');
  });

  it('shows only the managed team for a manager', async () => {
    const fixture = await setup(world, 'm@test.fr');
    const component = fixture.componentInstance;

    expect(component.scope().requests).toHaveLength(1);
    expect(component.scope().employees).toHaveLength(2);
    expect(component.kpis().approvedDays).toBe(5);
  });

  it('shows only own data for an employé', async () => {
    const fixture = await setup(world, 'e@test.fr');
    const component = fixture.componentInstance;

    expect(component.scope().requests).toHaveLength(1);
    expect(component.scope().employees).toHaveLength(1);
    expect(component.totalRequests()).toBe(1);
  });
});
