import { Injectable } from '@angular/core';
import { addDays, format, startOfWeek } from 'date-fns';
import { PublicUser } from '../auth/auth.models';
import { UserRepository } from '../users/user.repository';
import { LeaveBalanceService } from '../leave-balances/leave-balance.service';
import { LeaveRequestService } from './leave-request.service';
import { LeaveTypeService } from './leave-type.service';

const DEMO_TYPES: Array<{ name: string; color: string; requiresBalance: boolean; allowance: number }> = [
  { name: 'Congé payé', color: '#2563eb', requiresBalance: true, allowance: 25 },
  { name: 'RTT', color: '#16a34a', requiresBalance: true, allowance: 10 },
  { name: 'Maladie', color: '#dc2626', requiresBalance: false, allowance: 0 },
  { name: 'Sans solde', color: '#6b7280', requiresBalance: false, allowance: 0 },
];

@Injectable({ providedIn: 'root' })
export class LeaveSeedService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly leaveTypeService: LeaveTypeService,
    private readonly leaveBalanceService: LeaveBalanceService,
    private readonly leaveRequestService: LeaveRequestService
  ) {}

  seedDemoData(): void {
    if (this.leaveTypeService.list().length > 0 || this.leaveRequestService.list().length > 0) {
      return;
    }

    const users = this.userRepository.list();
    if (users.length === 0) {
      return;
    }

    const year = new Date().getFullYear();
    const typeIds = new Map<string, string>();

    for (const type of DEMO_TYPES) {
      const created = this.leaveTypeService.create({
        name: type.name,
        color: type.color,
        requiresBalance: type.requiresBalance,
      });
      if (!created.leaveType) {
        continue;
      }
      typeIds.set(type.name, created.leaveType.id);

      if (type.requiresBalance) {
        for (const user of users) {
          this.leaveBalanceService.setAllowance(user.id, created.leaveType.id, year, type.allowance);
        }
      }
    }

    const employee = this.userRepository.findByEmail('employe@demo.local');
    const manager = this.userRepository.findByEmail('manager@demo.local');
    const rh = this.userRepository.findByEmail('rh@demo.local');
    if (!employee || !manager || !rh) {
      return;
    }

    const rhActor: PublicUser = { id: rh.id, email: rh.email, role: rh.role };
    const monday = startOfWeek(new Date(), { weekStartsOn: 1 });
    const nextMonday = addDays(monday, 7);
    const iso = (date: Date) => format(date, 'yyyy-MM-dd');

    const approved = this.leaveRequestService.submit({
      employeeId: employee.id,
      leaveTypeId: typeIds.get('Congé payé')!,
      startDate: iso(monday),
      endDate: iso(addDays(monday, 4)),
      reason: 'Congés de démonstration',
    });
    if (approved.request) {
      this.leaveRequestService.approve(approved.request.id, rhActor);
    }

    this.leaveRequestService.submit({
      employeeId: employee.id,
      leaveTypeId: typeIds.get('RTT')!,
      startDate: iso(addDays(nextMonday, 0)),
      endDate: iso(addDays(nextMonday, 1)),
    });

    const managerRequest = this.leaveRequestService.submit({
      employeeId: manager.id,
      leaveTypeId: typeIds.get('Congé payé')!,
      startDate: iso(addDays(nextMonday, 2)),
      endDate: iso(addDays(nextMonday, 3)),
    });
    if (managerRequest.request) {
      this.leaveRequestService.approve(managerRequest.request.id, rhActor);
    }

    const refused = this.leaveRequestService.submit({
      employeeId: rh.id,
      leaveTypeId: typeIds.get('Maladie')!,
      startDate: iso(addDays(monday, 1)),
      endDate: iso(addDays(monday, 2)),
      reason: 'Arrêt maladie de démonstration',
    });
    if (refused.request) {
      this.leaveRequestService.refuse(refused.request.id, rhActor);
    }
  }
}
