import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AppointmentsComponent } from './appointments.component';
import { AppointmentService, PatientService, DoctorService } from '../../core/services';
import { MatDialog } from '@angular/material/dialog';
import { of } from 'rxjs';
import { provideAnimations } from '@angular/platform-browser/animations';

describe('AppointmentsComponent', () => {
  let component: AppointmentsComponent;
  let fixture: ComponentFixture<AppointmentsComponent>;
  let appointmentService: jasmine.SpyObj<AppointmentService>;
  let patientService: jasmine.SpyObj<PatientService>;
  let doctorService: jasmine.SpyObj<DoctorService>;
  let dialog: jasmine.SpyObj<MatDialog>;

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
    const appointmentServiceSpy = jasmine.createSpyObj('AppointmentService', [
      'getAllWithDetails',
      'cancel',
    ]);
    const patientServiceSpy = jasmine.createSpyObj('PatientService', ['getAll']);
    const doctorServiceSpy = jasmine.createSpyObj('DoctorService', ['getAll']);
    const dialogSpy = jasmine.createSpyObj('MatDialog', ['open']);

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

    appointmentService = TestBed.inject(AppointmentService) as jasmine.SpyObj<AppointmentService>;
    patientService = TestBed.inject(PatientService) as jasmine.SpyObj<PatientService>;
    doctorService = TestBed.inject(DoctorService) as jasmine.SpyObj<DoctorService>;
    dialog = TestBed.inject(MatDialog) as jasmine.SpyObj<MatDialog>;

    appointmentService.getAllWithDetails.and.returnValue(of(mockAppointments));

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

  it('should open create appointment dialog', () => {
    const dialogRefSpy = jasmine.createSpyObj({ afterClosed: of(true) });
    dialog.open.and.returnValue(dialogRefSpy);

    component.createAppointment();

    expect(dialog.open).toHaveBeenCalled();
  });

  it('should cancel appointment', () => {
    component.appointments.set(mockAppointments);
    appointmentService.cancel.and.returnValue(of(mockAppointments[0]));
    spyOn(window, 'confirm').and.returnValue(true);

    component.cancelAppointment('A001');

    expect(appointmentService.cancel).toHaveBeenCalledWith('A001');
  });

  it('should update selection', () => {
    component.onSelectionChange(mockAppointments);
    expect(component.selectedAppointments()).toEqual(mockAppointments);
  });

  it('should refresh appointments', () => {
    appointmentService.getAllWithDetails.calls.reset();
    component.refresh();
    expect(appointmentService.getAllWithDetails).toHaveBeenCalled();
  });
});
