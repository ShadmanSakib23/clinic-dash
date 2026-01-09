import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { AppointmentDetailsDialogComponent } from './appointment-details-dialog.component';
import { AppointmentService } from '../../../../core/services';
import { of } from 'rxjs';
import { provideAnimations } from '@angular/platform-browser/animations';

describe('AppointmentDetailsDialogComponent', () => {
  let component: AppointmentDetailsDialogComponent;
  let fixture: ComponentFixture<AppointmentDetailsDialogComponent>;
  let appointmentService: { cancel: ReturnType<typeof vi.fn>; complete: ReturnType<typeof vi.fn> };
  let dialogRef: { close: ReturnType<typeof vi.fn> };

  const mockAppointment = {
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
    notes: 'Follow-up needed',
    symptoms: ['Chest pain', 'Shortness of breath'],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const appointmentServiceSpy = {
      cancel: vi.fn(),
      complete: vi.fn(),
    };
    const dialogRefSpy = { close: vi.fn() };

    await TestBed.configureTestingModule({
      imports: [AppointmentDetailsDialogComponent],
      providers: [
        provideAnimations(),
        { provide: AppointmentService, useValue: appointmentServiceSpy },
        { provide: MatDialogRef, useValue: dialogRefSpy },
        { provide: MAT_DIALOG_DATA, useValue: { appointment: mockAppointment } },
      ],
    }).compileComponents();

    appointmentService = TestBed.inject(AppointmentService) as any;
    dialogRef = TestBed.inject(MatDialogRef) as any;

    fixture = TestBed.createComponent(AppointmentDetailsDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load appointment data', () => {
    expect(component.appointment()).toEqual(mockAppointment);
  });

  it('should check if appointment can be cancelled', () => {
    expect(component.canCancel()).toBe(true);
    
    component.appointment.set({ ...mockAppointment, status: 'cancelled' });
    expect(component.canCancel()).toBe(false);
  });

  it('should check if appointment can be completed', () => {
    component.appointment.set({ ...mockAppointment, status: 'confirmed' });
    expect(component.canComplete()).toBe(true);
    
    component.appointment.set({ ...mockAppointment, status: 'completed' });
    expect(component.canComplete()).toBe(false);
  });

  it('should close dialog', () => {
    component.close();
    expect(dialogRef.close).toHaveBeenCalled();
  });
});
