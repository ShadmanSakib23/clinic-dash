import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { AppointmentDetailsDialogComponent } from './appointment-details-dialog.component';
import { AppointmentService } from '../../../../core/services';
import { of } from 'rxjs';
import { provideAnimations } from '@angular/platform-browser/animations';

describe('AppointmentDetailsDialogComponent', () => {
  let component: AppointmentDetailsDialogComponent;
  let fixture: ComponentFixture<AppointmentDetailsDialogComponent>;
  let appointmentService: jasmine.SpyObj<AppointmentService>;
  let dialogRef: jasmine.SpyObj<MatDialogRef<AppointmentDetailsDialogComponent>>;

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
    const appointmentServiceSpy = jasmine.createSpyObj('AppointmentService', [
      'cancel',
      'complete',
    ]);
    const dialogRefSpy = jasmine.createSpyObj('MatDialogRef', ['close']);

    await TestBed.configureTestingModule({
      imports: [AppointmentDetailsDialogComponent],
      providers: [
        provideAnimations(),
        { provide: AppointmentService, useValue: appointmentServiceSpy },
        { provide: MatDialogRef, useValue: dialogRefSpy },
        { provide: MAT_DIALOG_DATA, useValue: { appointment: mockAppointment } },
      ],
    }).compileComponents();

    appointmentService = TestBed.inject(AppointmentService) as jasmine.SpyObj<AppointmentService>;
    dialogRef = TestBed.inject(MatDialogRef) as jasmine.SpyObj<MatDialogRef<AppointmentDetailsDialogComponent>>;

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

  it('should cancel appointment', () => {
    spyOn(window, 'confirm').and.returnValue(true);
    appointmentService.cancel.and.returnValue(of({ ...mockAppointment, status: 'cancelled' }));

    component.cancelAppointment();

    expect(appointmentService.cancel).toHaveBeenCalledWith('A001');
    expect(component.appointment().status).toBe('cancelled');
  });

  it('should complete appointment', () => {
    appointmentService.complete.and.returnValue(of({ ...mockAppointment, status: 'completed' }));

    component.completeAppointment();

    expect(appointmentService.complete).toHaveBeenCalledWith('A001');
    expect(component.appointment().status).toBe('completed');
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

  it('should edit appointment', () => {
    component.editAppointment();
    expect(dialogRef.close).toHaveBeenCalledWith({ action: 'edit', appointment: mockAppointment });
  });
});
