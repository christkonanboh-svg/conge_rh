import { describe, it, expect, beforeEach } from 'vitest';
import { TeamService } from './team.service';
import { StorageService } from '../storage/storage.service';
import { UserRepository } from '../users/user.repository';

describe('TeamService', () => {
  let storage: StorageService;
  let userRepository: UserRepository;
  let teamService: TeamService;

  beforeEach(() => {
    localStorage.clear();
    storage = new StorageService();
    userRepository = new UserRepository(storage);
    teamService = new TeamService(storage, userRepository);
  });

  it('should create a team with a unique name', () => {
    const result = teamService.create('RH');
    expect(result.success).toBe(true);
    expect(result.team?.name).toBe('RH');
    expect(teamService.teams()).toHaveLength(1);
  });

  it('should refuse empty or duplicate team names', () => {
    teamService.create('RH');
    const duplicate = teamService.create('  rh  ');
    expect(duplicate.success).toBe(false);
    expect(duplicate.error).toBeDefined();

    const empty = teamService.create('   ');
    expect(empty.success).toBe(false);
    expect(empty.error).toBeDefined();
    expect(teamService.teams()).toHaveLength(1);
  });

  it('should rename an existing team', () => {
    const created = teamService.create('RH');
    const renameResult = teamService.rename(created.team!.id, 'Gestion RH');
    expect(renameResult.success).toBe(true);
    expect(renameResult.team?.name).toBe('Gestion RH');
  });

  it('should refuse renaming to a duplicate name', () => {
    const rh = teamService.create('RH');
    teamService.create('IT');
    const renameResult = teamService.rename(rh.team!.id, 'it');
    expect(renameResult.success).toBe(false);
  });

  it('should remove a team and dissociate employees', () => {
    const team = teamService.create('RH');
    const user = {
      id: 'emp-1',
      email: 'emp1@test.fr',
      role: 'employe' as const,
      passwordHash: 'hash',
      salt: 'salt',
      iterations: 100000,
      createdAt: '2026-01-01T00:00:00.000Z',
      firstName: 'John',
      lastName: 'Doe',
      teamId: team.team!.id,
      managerId: null,
    };
    userRepository.add(user);

    const removed = teamService.remove(team.team!.id);
    expect(removed).toBe(true);
    expect(teamService.teams()).toHaveLength(0);
    expect(userRepository.findById('emp-1')?.teamId).toBeNull();
  });

  it('should persist teams between reloads', () => {
    teamService.create('RH');
    const reloaded = new TeamService(new StorageService(), new UserRepository(new StorageService()));
    expect(reloaded.teams()).toHaveLength(1);
  });
});
