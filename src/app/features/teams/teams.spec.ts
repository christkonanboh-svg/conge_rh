import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { TeamsComponent } from './teams';
import { StorageService } from '../../core/storage/storage.service';
import { UserRepository } from '../../core/users/user.repository';
import { TeamService } from '../../core/employees/team.service';

describe('TeamsComponent', () => {
  let fixture: ComponentFixture<TeamsComponent>;
  let component: TeamsComponent;
  let teamService: TeamService;

  beforeEach(async () => {
    localStorage.clear();
    const storage = new StorageService();
    const userRepository = new UserRepository(storage);
    teamService = new TeamService(storage, userRepository);

    await TestBed.configureTestingModule({
      imports: [TeamsComponent],
      providers: [
        provideRouter([]),
        { provide: StorageService, useValue: storage },
        { provide: TeamService, useValue: teamService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(TeamsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should create a team via the form and display it', () => {
    component.form.setValue({ name: 'RH' });
    component.onSubmit();
    fixture.detectChanges();
    expect(teamService.teams()).toHaveLength(1);
    expect((fixture.nativeElement as HTMLElement).textContent).toContain('RH');
  });

  it('should rename a team via the form', () => {
    teamService.create('RH');
    component.startRename(teamService.teams()[0]);
    component.form.setValue({ name: 'Gestion RH' });
    component.onSubmit();
    expect(teamService.teams()[0].name).toBe('Gestion RH');
  });

  it('should remove a team', () => {
    teamService.create('RH');
    component.remove(teamService.teams()[0]);
    fixture.detectChanges();
    expect(teamService.teams()).toHaveLength(0);
  });
});
