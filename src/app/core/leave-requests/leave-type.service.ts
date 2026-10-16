import { computed, Injectable, signal } from '@angular/core';
import { StorageService } from '../storage/storage.service';
import { DEFAULT_LEAVE_TYPE_COLOR, LeaveType, LEAVE_TYPES_STORAGE_KEY } from './leave-request.models';

export interface LeaveTypeMutationResult {
  success: boolean;
  error?: string;
  leaveType?: LeaveType;
}

export interface LeaveTypeInput {
  name: string;
  color?: string;
  requiresBalance?: boolean;
}

@Injectable({ providedIn: 'root' })
export class LeaveTypeService {
  private readonly _types = signal<LeaveType[]>([]);
  readonly types = this._types.asReadonly();
  readonly typeCount = computed(() => this._types().length);

  constructor(private readonly storage: StorageService) {
    this.load();
  }

  private load(): void {
    this._types.set(this.readTypes());
  }

  private readTypes(): LeaveType[] {
    const types = this.storage.get<LeaveType[]>(LEAVE_TYPES_STORAGE_KEY);
    return Array.isArray(types) ? types : [];
  }

  private persist(types: LeaveType[]): void {
    this.storage.set(LEAVE_TYPES_STORAGE_KEY, types);
    this._types.set(types);
  }

  list(): LeaveType[] {
    return this._types();
  }

  findById(id: string): LeaveType | null {
    return this.readTypes().find((type) => type.id === id) ?? null;
  }

  create(input: LeaveTypeInput): LeaveTypeMutationResult {
    const name = input.name.trim();
    if (!name) {
      return { success: false, error: 'Le nom du type de congé est obligatoire' };
    }

    const types = this.readTypes();
    if (this.nameExists(types, name)) {
      return { success: false, error: 'Un type de congé avec ce nom existe déjà' };
    }

    const leaveType: LeaveType = {
      id: crypto.randomUUID(),
      name,
      color: input.color?.trim() || DEFAULT_LEAVE_TYPE_COLOR,
      requiresBalance: input.requiresBalance ?? true,
      createdAt: new Date().toISOString(),
    };

    this.persist([...types, leaveType]);
    return { success: true, leaveType };
  }

  update(id: string, input: LeaveTypeInput): LeaveTypeMutationResult {
    const name = input.name.trim();
    if (!name) {
      return { success: false, error: 'Le nom du type de congé est obligatoire' };
    }

    const types = this.readTypes();
    const existing = types.find((type) => type.id === id);
    if (!existing) {
      return { success: false, error: "Le type de congé n'existe pas" };
    }

    if (this.nameExists(types, name, id)) {
      return { success: false, error: 'Un type de congé avec ce nom existe déjà' };
    }

    const updated: LeaveType = {
      ...existing,
      name,
      color: input.color?.trim() || existing.color,
      requiresBalance: input.requiresBalance ?? existing.requiresBalance,
    };

    this.persist(types.map((type) => (type.id === id ? updated : type)));
    return { success: true, leaveType: updated };
  }

  remove(id: string): boolean {
    const types = this.readTypes();
    const next = types.filter((type) => type.id !== id);
    if (next.length === types.length) {
      return false;
    }
    this.persist(next);
    return true;
  }

  private nameExists(types: LeaveType[], name: string, excludeId?: string): boolean {
    const normalized = name.toLowerCase();
    return types.some((type) => type.id !== excludeId && type.name.trim().toLowerCase() === normalized);
  }
}
