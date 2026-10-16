import { computed, Injectable, signal } from '@angular/core';
import { StorageService } from '../storage/storage.service';
import { UserRepository } from '../users/user.repository';
import { Team, TEAMS_STORAGE_KEY } from './employee.models';

export interface TeamMutationResult {
  success: boolean;
  error?: string;
  team?: Team;
}

@Injectable({ providedIn: 'root' })
export class TeamService {
  private readonly _teams = signal<Team[]>([]);
  readonly teams = this._teams.asReadonly();
  readonly teamCount = computed(() => this._teams().length);

  constructor(
    private readonly storage: StorageService,
    private readonly userRepository: UserRepository
  ) {
    this.load();
  }

  private load(): void {
    this._teams.set(this.readTeams());
  }

  private readTeams(): Team[] {
    const teams = this.storage.get<Team[]>(TEAMS_STORAGE_KEY);
    return Array.isArray(teams) ? teams : [];
  }

  private persist(teams: Team[]): void {
    this.storage.set(TEAMS_STORAGE_KEY, teams);
    this._teams.set(teams);
  }

  list(): Team[] {
    return this._teams();
  }

  findById(id: string): Team | null {
    return this.readTeams().find((team) => team.id === id) ?? null;
  }

  create(name: string): TeamMutationResult {
    const trimmed = name.trim();
    if (!trimmed) {
      return { success: false, error: "Le nom de l'équipe est obligatoire" };
    }

    const teams = this.readTeams();
    const nameExists = teams.some((team) => team.name.trim().toLowerCase() === trimmed.toLowerCase());
    if (nameExists) {
      return { success: false, error: "Une équipe avec ce nom existe déjà" };
    }

    const team: Team = {
      id: crypto.randomUUID(),
      name: trimmed,
      createdAt: new Date().toISOString(),
    };

    this.persist([...teams, team]);
    return { success: true, team };
  }

  rename(id: string, name: string): TeamMutationResult {
    const trimmed = name.trim();
    if (!trimmed) {
      return { success: false, error: "Le nom de l'équipe est obligatoire" };
    }

    const teams = this.readTeams();
    const team = teams.find((existing) => existing.id === id);
    if (!team) {
      return { success: false, error: "L'équipe n'existe pas" };
    }

    const nameExists = teams.some(
      (existing) => existing.id !== id && existing.name.trim().toLowerCase() === trimmed.toLowerCase()
    );
    if (nameExists) {
      return { success: false, error: "Une équipe avec ce nom existe déjà" };
    }

    const next = teams.map((existing) => (existing.id === id ? { ...existing, name: trimmed } : existing));
    this.persist(next);
    return { success: true, team: { ...team, name: trimmed } };
  }

  remove(id: string): boolean {
    const teams = this.readTeams();
    const next = teams.filter((team) => team.id !== id);
    if (next.length === teams.length) {
      return false;
    }

    this.persist(next);

    // Dissociate employees from removed team
    const users = this.userRepository.list();
    const updated = users.map((user) => {
      if (user.teamId === id) {
        return { ...user, teamId: null };
      }
      return user;
    });

    if (updated.some((user, index) => user.teamId !== users[index]?.teamId)) {
      this.userRepository.replaceAll(updated);
    }

    return true;
  }
}
