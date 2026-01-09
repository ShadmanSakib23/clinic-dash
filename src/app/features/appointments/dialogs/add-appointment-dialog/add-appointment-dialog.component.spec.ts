import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { AddAppointmentDialogComponent } from './add-appointment-dialog.component';
import { AppointmentService, PatientService, DoctorService } from '../../../../core/services';
import { of } from 'rxjs';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideNativeDateAdapter } from '@angular/material/core';

describe('AddAppointmentDialogComponent', () => {
  let component: AddAppointmentDialogComponent;
  let fixture: ComponentFixture<AddAppointmentDialogComponent>;
  let appointmentService: { create: ReturnType<typeof vi.fn>; update: ReturnType<typeof vi.fn> };
  let patientService: { getAll: ReturnType<typeof vi.fn> };
  let doctorService: { getAll: ReturnType<typeof vi.fn> };
  let dialogRef: { close: ReturnType<typeof vi.fn> };

  const mockPatients = [
    { id: 'P001', firstName: 'John', lastName: 'Doe', email: 'john@example.com' },
  ];

  const mockDoctors = [
    { id: 'D001', firstName: 'Jane', lastName: 'Smith', specialization: 'Cardiology' },
  ];

  beforeEach(async () => {
    const appointmentServiceSpy = { create: vi.fn(), update: vi.fn() };
    const patientServiceSpy = { getAll: vi.fn() };
    const doctorServiceSpy = { getAll: vi.fn() };
    const dialogRefSpy = { close: vi.fn() };

    await TestBed.configureTestingModule({
      imports: [AddAppointmentDialogComponent, ReactiveFormsModule],
      providers: [
        provideAnimations(),
        provideNativeDateAdapter(),
        { provide: AppointmentService, useValue: appointmentServiceSpy },
        { provide: PatientService, useValue: patientServiceSpy },
        { provide: DoctorService, useValue: doctorServiceSpy },
        { provide: MatDialogRef, useValue: dialogRefSpy },
        { provide: MAT_DIALOG_DATA, useValue: null },
      ],
    }).compileComponents();

    appointmentService = TestBed.inject(AppointmentService) as any;
    patientService = TestBed.inject(PatientService) as any;
    doctorService = TestBed.inject(DoctorService) as any;
    dialogRef = TestBed.inject(MatDialogRef) as any;

    patientService.getAll.mockReturnValue(of(mockPatients as any));
    doctorService.getAll.mockReturnValue(of(mockDoctors as any));

    fixture = TestBed.createComponent(AddAppointmentDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize form', () => {
    expect(component.appointmentForm).toBeDefined();
    expect(component.appointmentForm.get('patientId')).toBeDefined();
    expect(component.appointmentForm.get('doctorId')).toBeDefined();
  });

  it('should load patients and doctors on init', () => {
    expect(patientService.getAll).toHaveBeenCalled();
    expect(doctorService.getAll).toHaveBeenCalled();
    expect(component.patients().length).toBe(1);
    expect(component.doctors().length).toBe(1);
  });

  it('should validate required fields', () => {
    expect(component.appointmentForm.valid).toBe(false);
    
    component.appointmentForm.patchValue({
      patientId: 'P001',
      doctorId: 'D001',
      date: new Date(),
      time: '10:00',
      duration: 30,
      type: 'consultation',
      reason: 'Test reason for appointment',
    });

    expect(component.appointmentForm.valid).toBe(true);
  });

  it('should add symptom', () => {
    component.appointmentForm.patchValue({ symptomInput: 'Headache' });
    component.addSymptom();
    expect(component.symptoms()).toContain('Headache');
    expect(component.appointmentForm.get('symptomInput')?.value).toBe('');
  });

  it('should remove symptom', () => {
    component.symptoms.set(['Headache', 'Fever']);
    component.removeSymptom('Headache');
    expect(component.symptoms()).not.toContain('Headache');
    expect(component.symptoms()).toContain('Fever');
  });

  it('should create appointment', () => {
    const mockAppointment = {
      id: 'A001',
      patientId: 'P001',
      doctorId: 'D001',
      dateTime: new Date(),
      duration: 30,
      type: 'consultation',
      status: 'scheduled',
      reason: 'Test reason',
    };

    appointmentService.create.mockReturnValue(of(mockAppointment as any));

    component.appointmentForm.patchValue({
      patientId: 'P001',
      doctorId: 'D001',
      date: new Date(),
      time: '10:00',
      duration: 30,
      type: 'consultation',
      reason: 'Test reason for appointment',
    });

    component.onSubmit();

    expect(appointmentService.create).toHaveBeenCalled();
    expect(dialogRef.close).toHaveBeenCalledWith(true);
  });

  it('should not submit invalid form', () => {
    component.onSubmit();
    expect(appointmentService.create).not.toHaveBeenCalled();
  });

  it('should close dialog', () => {
    component.onClose();
    expect(dialogRef.close).toHaveBeenCalled();
  });

  it('should generate time options', () => {
    const times = component.getTimeOptions();
    expect(times.length).toBeGreaterThan(0);
    expect(times[0]).toBe('08:00');
  });
});
