import { describe, it, expect, beforeEach } from 'vitest';
import { LeaveSeedService } from './leave-seed.service';
import { LeaveTypeService } from './leave-type.service';
import { LeaveRequestService } from './leave-request.service';
import { LeaveBalanceService } from '../leave-balances/leave-balance.service';
import { StorageService } from '../storage/storage.service';
import { UserRepository } from '../users/user.repository';
import { AuthService } from '../auth/auth.service';
import { PasswordHasher } from '../auth/password-hasher';

describe('LeaveSeedService', () => {
  let storage: StorageService;
  let userRepository: UserRepository;
  let leaveTypeService: LeaveTypeService;
  let leaveBalanceService: LeaveBalanceService;
  let leaveRequestService: LeaveRequestService;
  let seed: LeaveSeedService;

  beforeEach(() => {
    localStorage.clear();
    storage = new StorageService();
    userRepository = new UserRepository(storage);
    leaveTypeService = new LeaveTypeService(storage);
    leaveBalanceService = new LeaveBalanceService(storage);
    leaveRequestService = new LeaveRequestService(
      storage,
      userRepository,
      leaveTypeService,
      leaveBalanceService
    );
    seed = new LeaveSeedService(userRepository, leaveTypeService, leaveBalanceService, leaveRequestService);
  });

  it('should seed demo types, balances and requests on first launch', async () => {
    const auth = new AuthService(storage, new PasswordHasher());
    await auth.seedDemoAccounts();

    seed.seedDemoData();

    expect(leaveTypeService.list().length).toBeGreaterThanOrEqual(4);
    expect(leaveBalanceService.list().length).toBeGreaterThan(0);
    expect(leaveRequestService.list().length).toBeGreaterThanOrEqual(3);
    expect(leaveRequestService.list().some((request) => request.status === 'approuvee')).toBe(true);
  });

  it('should not reseed when leave data already exists', async () => {
    const auth = new AuthService(storage, new PasswordHasher());
    await auth.seedDemoAccounts();

    seed.seedDemoData();
    const types = leaveTypeService.list().length;
    const requests = leaveRequestService.list().length;

    seed.seedDemoData();

    expect(leaveTypeService.list().length).toBe(types);
    expect(leaveRequestService.list().length).toBe(requests);
  });
});
