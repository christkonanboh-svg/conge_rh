import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { LeaveTypesComponent } from './leave-types';
import { StorageService } from '../../core/storage/storage.service';
import { LeaveTypeService } from '../../core/leave-requests/leave-type.service';

describe('LeaveTypesComponent', () => {
  let fixture: ComponentFixture<LeaveTypesComponent>;
  let component: LeaveTypesComponent;
  let leaveTypeService: LeaveTypeService;

  beforeEach(async () => {
    localStorage.clear();
    const storage = new StorageService();
    leaveTypeService = new LeaveTypeService(storage);

    await TestBed.configureTestingModule({
      imports: [LeaveTypesComponent],
      providers: [
        provideRouter([]),
        { provide: StorageService, useValue: storage },
        { provide: LeaveTypeService, useValue: leaveTypeService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(LeaveTypesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should create a type via the form', () => {
    component.form.setValue({ name: 'RTT', color: '#16a34a', requiresBalance: true });
    component.onSubmit();
    fixture.detectChanges();
    expect(leaveTypeService.list().some((type) => type.name === 'RTT')).toBe(true);
    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(text).toContain('RTT');
  });

  it('should update a type', () => {
    const created = leaveTypeService.create({ name: 'RTT', requiresBalance: true }).leaveType!;
    component.edit(created);
    component.form.patchValue({ name: 'RTT modifié' });
    component.onSubmit();
    expect(leaveTypeService.findById(created.id)?.name).toBe('RTT modifié');
  });

  it('should remove a type', () => {
    const created = leaveTypeService.create({ name: 'RTT' }).leaveType!;
    component.remove(created);
    expect(leaveTypeService.findById(created.id)).toBeNull();
  });
});
