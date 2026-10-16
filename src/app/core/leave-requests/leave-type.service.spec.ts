import { describe, it, expect, beforeEach } from 'vitest';
import { LeaveTypeService } from './leave-type.service';
import { StorageService } from '../storage/storage.service';

describe('LeaveTypeService', () => {
  let storage: StorageService;
  let service: LeaveTypeService;

  beforeEach(() => {
    localStorage.clear();
    storage = new StorageService();
    service = new LeaveTypeService(storage);
  });

  it('should create a leave type', () => {
    const result = service.create({ name: 'Congé payé' });
    expect(result.success).toBe(true);
    expect(result.leaveType?.name).toBe('Congé payé');
    expect(result.leaveType?.requiresBalance).toBe(true);
    expect(service.types()).toHaveLength(1);
  });

  it('should refuse an empty or duplicate name', () => {
    service.create({ name: 'RTT' });
    const duplicate = service.create({ name: '  rtt  ' });
    expect(duplicate.success).toBe(false);
    expect(duplicate.error).toBeDefined();

    const empty = service.create({ name: '   ' });
    expect(empty.success).toBe(false);
    expect(service.types()).toHaveLength(1);
  });

  it('should rename an existing type', () => {
    const created = service.create({ name: 'RTT' });
    const updated = service.update(created.leaveType!.id, { name: 'RTT 2026' });
    expect(updated.success).toBe(true);
    expect(updated.leaveType?.name).toBe('RTT 2026');
  });

  it('should refuse renaming to a duplicate name', () => {
    const first = service.create({ name: 'RTT' });
    service.create({ name: 'Maladie' });
    const updated = service.update(first.leaveType!.id, { name: 'maladie' });
    expect(updated.success).toBe(false);
    expect(service.findById(first.leaveType!.id)?.name).toBe('RTT');
  });

  it('should remove a type', () => {
    const created = service.create({ name: 'Sans solde' });
    expect(service.remove(created.leaveType!.id)).toBe(true);
    expect(service.types()).toHaveLength(0);
    expect(service.findById(created.leaveType!.id)).toBeNull();
  });

  it('should persist types between reloads', () => {
    service.create({ name: 'Congé payé' });
    const reloaded = new LeaveTypeService(new StorageService());
    expect(reloaded.types()).toHaveLength(1);
  });
});
