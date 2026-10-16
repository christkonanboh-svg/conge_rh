import { Injectable, signal } from '@angular/core';
import { StorageService } from '../storage/storage.service';
import { UserRepository } from '../users/user.repository';
import { PublicUser } from '../auth/auth.models';
import { LeaveBalanceService } from '../leave-balances/leave-balance.service';
import { LeaveRequest, LeaveRequestInput, LEAVE_REQUESTS_STORAGE_KEY } from './leave-request.models';
import { LeaveTypeService } from './leave-type.service';
import { countWorkingDays } from './leave-days.util';

export interface LeaveRequestMutationResult {
  success: boolean;
  error?: string;
  request?: LeaveRequest;
}

@Injectable({ providedIn: 'root' })
export class LeaveRequestService {
  private readonly _requests = signal<LeaveRequest[]>([]);
  readonly requests = this._requests.asReadonly();

  constructor(
    private readonly storage: StorageService,
    private readonly userRepository: UserRepository,
    private readonly leaveTypeService: LeaveTypeService,
    private readonly leaveBalanceService: LeaveBalanceService
  ) {
    this.load();
  }

  private load(): void {
    this._requests.set(this.readRequests());
  }

  private readRequests(): LeaveRequest[] {
    const requests = this.storage.get<LeaveRequest[]>(LEAVE_REQUESTS_STORAGE_KEY);
    return Array.isArray(requests) ? requests : [];
  }

  private persist(requests: LeaveRequest[]): void {
    this.storage.set(LEAVE_REQUESTS_STORAGE_KEY, requests);
    this._requests.set(requests);
  }

  list(): LeaveRequest[] {
    return this._requests();
  }

  findById(id: string): LeaveRequest | null {
    return this.readRequests().find((request) => request.id === id) ?? null;
  }

  submit(input: LeaveRequestInput): LeaveRequestMutationResult {
    const leaveType = this.leaveTypeService.findById(input.leaveTypeId);
    if (!leaveType) {
      return { success: false, error: "Le type de congé sélectionné n'existe pas" };
    }

    if (!input.startDate || !input.endDate) {
      return { success: false, error: 'Les dates de début et de fin sont obligatoires' };
    }

    const workingDays = countWorkingDays(input.startDate, input.endDate);
    if (workingDays <= 0) {
      return { success: false, error: 'La période sélectionnée ne contient aucun jour ouvré' };
    }

    const request: LeaveRequest = {
      id: crypto.randomUUID(),
      employeeId: input.employeeId,
      leaveTypeId: leaveType.id,
      startDate: input.startDate,
      endDate: input.endDate,
      workingDays,
      status: 'en_attente',
      createdAt: new Date().toISOString(),
      reason: input.reason?.trim() || undefined,
    };

    this.persist([...this.readRequests(), request]);
    return { success: true, request };
  }

  approve(id: string, actor: PublicUser): LeaveRequestMutationResult {
    return this.decide(id, actor, 'approuvee');
  }

  refuse(id: string, actor: PublicUser): LeaveRequestMutationResult {
    return this.decide(id, actor, 'refusee');
  }

  private decide(id: string, actor: PublicUser, decision: 'approuvee' | 'refusee'): LeaveRequestMutationResult {
    const requests = this.readRequests();
    const request = requests.find((existing) => existing.id === id);
    if (!request) {
      return { success: false, error: "La demande n'existe pas" };
    }

    if (request.status !== 'en_attente') {
      return { success: false, error: 'Seule une demande en attente peut être traitée' };
    }

    if (!this.canDecide(request, actor)) {
      return { success: false, error: "Vous n'êtes pas autorisé à valider cette demande" };
    }

    if (decision === 'approuvee') {
      const leaveType = this.leaveTypeService.findById(request.leaveTypeId);
      if (leaveType?.requiresBalance) {
        const year = Number(request.startDate.slice(0, 4));
        const remaining = this.leaveBalanceService.remaining(request.employeeId, request.leaveTypeId, year, requests);
        if (remaining < request.workingDays) {
          return { success: false, error: 'Solde de congés insuffisant pour approuver cette demande' };
        }
      }
    }

    const updated: LeaveRequest = {
      ...request,
      status: decision,
      decidedAt: new Date().toISOString(),
      decidedBy: actor.id,
    };

    this.persist(requests.map((existing) => (existing.id === id ? updated : existing)));
    return { success: true, request: updated };
  }

  cancel(id: string, actor: PublicUser): LeaveRequestMutationResult {
    const requests = this.readRequests();
    const request = requests.find((existing) => existing.id === id);
    if (!request) {
      return { success: false, error: "La demande n'existe pas" };
    }

    if (request.employeeId !== actor.id) {
      return { success: false, error: "Seul l'auteur peut annuler sa demande" };
    }

    if (request.status !== 'en_attente') {
      return { success: false, error: 'Seule une demande en attente peut être annulée' };
    }

    const updated: LeaveRequest = { ...request, status: 'annulee' };
    this.persist(requests.map((existing) => (existing.id === id ? updated : existing)));
    return { success: true, request: updated };
  }

  canDecide(request: LeaveRequest, actor: PublicUser): boolean {
    if (actor.role === 'rh') {
      return true;
    }
    if (actor.role !== 'manager') {
      return false;
    }
    const employee = this.userRepository.findById(request.employeeId);
    return employee?.managerId === actor.id;
  }

  visibleRequests(actor: PublicUser): LeaveRequest[] {
    const requests = this._requests();
    if (actor.role === 'rh') {
      return requests;
    }
    if (actor.role === 'manager') {
      const teamMemberIds = new Set(
        this.userRepository
          .list()
          .filter((user) => user.managerId === actor.id)
          .map((user) => user.id)
      );
      return requests.filter((request) => request.employeeId === actor.id || teamMemberIds.has(request.employeeId));
    }
    return requests.filter((request) => request.employeeId === actor.id);
  }
}
