import { computed, Injectable, signal } from '@angular/core';
import { StorageService } from '../storage/storage.service';
import { PublicUser } from '../auth/auth.models';
import { LeaveRequest } from '../leave-requests/leave-request.models';
import { LeaveBalance, LEAVE_BALANCES_STORAGE_KEY, LeaveBalanceSummary } from './leave-balance.models';

export interface LeaveBalanceMutationResult {
  success: boolean;
  error?: string;
  balance?: LeaveBalance;
}

@Injectable({ providedIn: 'root' })
export class LeaveBalanceService {
  private readonly _balances = signal<LeaveBalance[]>([]);
  readonly balances = this._balances.asReadonly();
  readonly balanceCount = computed(() => this._balances().length);

  constructor(private readonly storage: StorageService) {
    this.load();
  }

  private load(): void {
    this._balances.set(this.readBalances());
  }

  private readBalances(): LeaveBalance[] {
    const balances = this.storage.get<LeaveBalance[]>(LEAVE_BALANCES_STORAGE_KEY);
    return Array.isArray(balances) ? balances : [];
  }

  private persist(balances: LeaveBalance[]): void {
    this.storage.set(LEAVE_BALANCES_STORAGE_KEY, balances);
    this._balances.set(balances);
  }

  list(): LeaveBalance[] {
    return this._balances();
  }

  findById(id: string): LeaveBalance | null {
    return this.readBalances().find((balance) => balance.id === id) ?? null;
  }

  getFor(employeeId: string, leaveTypeId: string, year: number): LeaveBalance | null {
    return (
      this.list().find(
        (balance) =>
          balance.employeeId === employeeId && balance.leaveTypeId === leaveTypeId && balance.year === year
      ) ?? null
    );
  }

  setAllowance(
    employeeId: string,
    leaveTypeId: string,
    year: number,
    allowance: number
  ): LeaveBalanceMutationResult {
    if (!Number.isFinite(allowance) || allowance < 0) {
      return { success: false, error: 'Le solde doit être un nombre positif' };
    }

    const balances = this.readBalances();
    const existing = balances.find(
      (balance) =>
        balance.employeeId === employeeId && balance.leaveTypeId === leaveTypeId && balance.year === year
    );

    if (existing) {
      const updated: LeaveBalance = { ...existing, allowance };
      this.persist(balances.map((balance) => (balance.id === existing.id ? updated : balance)));
      return { success: true, balance: updated };
    }

    const created: LeaveBalance = {
      id: crypto.randomUUID(),
      employeeId,
      leaveTypeId,
      year,
      allowance,
    };
    this.persist([...balances, created]);
    return { success: true, balance: created };
  }

  remove(id: string): boolean {
    const balances = this.readBalances();
    const next = balances.filter((balance) => balance.id !== id);
    if (next.length === balances.length) {
      return false;
    }
    this.persist(next);
    return true;
  }

  computeUsed(employeeId: string, leaveTypeId: string, year: number, requests: LeaveRequest[]): number {
    return requests
      .filter(
        (request) =>
          request.employeeId === employeeId &&
          request.leaveTypeId === leaveTypeId &&
          request.status === 'approuvee' &&
          Number(request.startDate.slice(0, 4)) === year
      )
      .reduce((total, request) => total + request.workingDays, 0);
  }

  summarize(
    employeeId: string,
    leaveTypeId: string,
    year: number,
    requests: LeaveRequest[]
  ): LeaveBalanceSummary {
    const balance = this.getFor(employeeId, leaveTypeId, year);
    const allowance = balance?.allowance ?? 0;
    const used = this.computeUsed(employeeId, leaveTypeId, year, requests);
    return {
      employeeId,
      leaveTypeId,
      year,
      allowance,
      used,
      remaining: allowance - used,
    };
  }

  remaining(employeeId: string, leaveTypeId: string, year: number, requests: LeaveRequest[]): number {
    return this.summarize(employeeId, leaveTypeId, year, requests).remaining;
  }

  summariesForEmployee(employeeId: string, year: number, requests: LeaveRequest[]): LeaveBalanceSummary[] {
    return this.list()
      .filter((balance) => balance.employeeId === employeeId && balance.year === year)
      .map((balance) => this.summarize(employeeId, balance.leaveTypeId, year, requests));
  }

  allSummaries(year: number, requests: LeaveRequest[]): LeaveBalanceSummary[] {
    return this.list()
      .filter((balance) => balance.year === year)
      .map((balance) => this.summarize(balance.employeeId, balance.leaveTypeId, year, requests));
  }

  visibleSummaries(actor: PublicUser, year: number, requests: LeaveRequest[]): LeaveBalanceSummary[] {
    return actor.role === 'rh' ? this.allSummaries(year, requests) : this.summariesForEmployee(actor.id, year, requests);
  }
}
