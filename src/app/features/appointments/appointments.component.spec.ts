import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AppointmentsComponent } from './appointments.component';
import { AppointmentService, PatientService, DoctorService } from '../../core/services';
import { MatDialog } from '@angular/material/dialog';
import { of } from 'rxjs';
import { provideAnimations } from '@angular/platform-browser/animations';

describe('AppointmentsComponent', () => {
  let component: AppointmentsComponent;
  let fixture: ComponentFixture<AppointmentsComponent>;
  let appointmentService: { getAllWithDetails: ReturnType<typeof vi.fn>; cancel: ReturnType<typeof vi.fn> };
  let patientService: { getAll: ReturnType<typeof vi.fn> };
  let doctorService: { getAll: ReturnType<typeof vi.fn> };
  let dialog: { open: ReturnType<typeof vi.fn> };

  const mockAppointments = [
    {
      id: 'A001',
      patientId: 'P001',
      patientName: 'John Doe',
      doctorId: 'D001',
      doctorName: 'Dr. Smith',
      doctorSpecialization: 'Cardiology',
      dateTime: new Date('2024-01-15T10:00:00'),
      duration: 30,
      type: 'consultation' as const,
      status: 'scheduled' as const,
      reason: 'Chest pain',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  beforeEach(async () => {
    const appointmentServiceSpy = {
      getAllWithDetails: vi.fn(),
      cancel: vi.fn(),
    };
    const patientServiceSpy = { getAll: vi.fn() };
    const doctorServiceSpy = { getAll: vi.fn() };
    const dialogSpy = { open: vi.fn() };

    await TestBed.configureTestingModule({
      imports: [AppointmentsComponent],
      providers: [
        provideAnimations(),
        { provide: AppointmentService, useValue: appointmentServiceSpy },
        { provide: PatientService, useValue: patientServiceSpy },
        { provide: DoctorService, useValue: doctorServiceSpy },
        { provide: MatDialog, useValue: dialogSpy },
      ],
    }).compileComponents();

    appointmentService = TestBed.inject(AppointmentService) as any;
    patientService = TestBed.inject(PatientService) as any;
    doctorService = TestBed.inject(DoctorService) as any;
    dialog = TestBed.inject(MatDialog) as any;

    appointmentService.getAllWithDetails.mockReturnValue(of(mockAppointments));

    fixture = TestBed.createComponent(AppointmentsComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load appointments on init', () => {
    fixture.detectChanges();
    expect(appointmentService.getAllWithDetails).toHaveBeenCalled();
    expect(component.appointments().length).toBe(1);
  });

  it('should cancel appointment', () => {
    component.appointments.set(mockAppointments);
    appointmentService.cancel.mockReturnValue(of(mockAppointments[0]));
    vi.spyOn(window, 'confirm').mockReturnValue(true);

    component.cancelAppointment('A001');

    expect(appointmentService.cancel).toHaveBeenCalledWith('A001');
  });

  it('should update selection', () => {
    component.onSelectionChange(mockAppointments);
    expect(component.selectedAppointments()).toEqual(mockAppointments);
  });

  it('should refresh appointments', () => {
    appointmentService.getAllWithDetails.mockClear();
    component.refresh();
    expect(appointmentService.getAllWithDetails).toHaveBeenCalled();
  });
});
