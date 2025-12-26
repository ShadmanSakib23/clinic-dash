import { Injectable, inject, computed } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Appointment, AppointmentStatus, AppointmentWithDetails } from '../models';
import { ApiClientService } from './api-client.service';
import { MockDataService } from './mock-data.service';

@Injectable({
  providedIn: 'root',
})
export class AppointmentService {
  private readonly apiClient = inject(ApiClientService);
  private readonly mockData = inject(MockDataService);

  /**
   * Get all appointments
   */
  getAll(): Observable<Appointment[]> {
    const appointments = this.mockData.getAppointments();
    return this.apiClient.mockSuccess(appointments).pipe(map((response) => response.data));
  }

  /**
   * Get appointments with patient and doctor details
   */
  getAllWithDetails(): Observable<AppointmentWithDetails[]> {
    const appointments = this.mockData.getAppointments();
    const patients = this.mockData.getPatients();
    const doctors = this.mockData.getDoctors();

    const appointmentsWithDetails: AppointmentWithDetails[] = appointments.map((apt) => {
      const patient = patients.find((p) => p.id === apt.patientId);
      const doctor = doctors.find((d) => d.id === apt.doctorId);

      return {
        ...apt,
        patientName: patient ? `${patient.firstName} ${patient.lastName}` : 'Unknown',
        doctorName: doctor ? `Dr. ${doctor.firstName} ${doctor.lastName}` : 'Unknown',
        doctorSpecialization: doctor?.specialization ?? 'N/A',
      };
    });

    return this.apiClient
      .mockSuccess(appointmentsWithDetails)
      .pipe(map((response) => response.data));
  }

  /**
   * Get appointment by ID
   */
  getById(id: string): Observable<Appointment | null> {
    const appointment = this.mockData.getAppointments().find((a) => a.id === id) ?? null;
    return this.apiClient.mockSuccess(appointment).pipe(map((response) => response.data));
  }

  /**
   * Get appointments by patient ID
   */
  getByPatientId(patientId: string): Observable<Appointment[]> {
    const appointments = this.mockData.getAppointments().filter((a) => a.patientId === patientId);
    return this.apiClient.mockSuccess(appointments).pipe(map((response) => response.data));
  }

  /**
   * Get appointments by doctor ID
   */
  getByDoctorId(doctorId: string): Observable<Appointment[]> {
    const appointments = this.mockData.getAppointments().filter((a) => a.doctorId === doctorId);
    return this.apiClient.mockSuccess(appointments).pipe(map((response) => response.data));
  }

  /**
   * Get appointments by status
   */
  getByStatus(status: AppointmentStatus): Observable<Appointment[]> {
    const appointments = this.mockData.getAppointments().filter((a) => a.status === status);
    return this.apiClient.mockSuccess(appointments).pipe(map((response) => response.data));
  }

  /**
   * Get upcoming appointments
   */
  getUpcoming(): Observable<Appointment[]> {
    const now = new Date();
    const appointments = this.mockData
      .getAppointments()
      .filter((a) => a.dateTime > now && a.status === 'scheduled')
      .sort((a, b) => a.dateTime.getTime() - b.dateTime.getTime());
    return this.apiClient.mockSuccess(appointments).pipe(map((response) => response.data));
  }

  /**
   * Get today's appointments
   */
  getToday(): Observable<Appointment[]> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const appointments = this.mockData
      .getAppointments()
      .filter((a) => a.dateTime >= today && a.dateTime < tomorrow)
      .sort((a, b) => a.dateTime.getTime() - b.dateTime.getTime());

    return this.apiClient.mockSuccess(appointments).pipe(map((response) => response.data));
  }

  /**
   * Create a new appointment
   */
  create(
    appointment: Omit<Appointment, 'id' | 'createdAt' | 'updatedAt'>
  ): Observable<Appointment> {
    // Validate that doctor and patient exist
    const patient = this.mockData.getPatients().find((p) => p.id === appointment.patientId);
    const doctor = this.mockData.getDoctors().find((d) => d.id === appointment.doctorId);

    if (!patient) {
      return this.apiClient.mockError('Patient not found', 'NOT_FOUND', 404);
    }
    if (!doctor) {
      return this.apiClient.mockError('Doctor not found', 'NOT_FOUND', 404);
    }

    const newAppointment: Appointment = {
      ...appointment,
      id: `A${String(this.mockData.getAppointments().length + 1).padStart(3, '0')}`,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.mockData.addAppointment(newAppointment);
    return this.apiClient
      .mockSuccess(newAppointment, 'Appointment created successfully')
      .pipe(map((response) => response.data));
  }

  /**
   * Update an existing appointment
   */
  update(id: string, updates: Partial<Appointment>): Observable<Appointment> {
    const appointment = this.mockData.getAppointments().find((a) => a.id === id);
    if (!appointment) {
      return this.apiClient.mockError('Appointment not found', 'NOT_FOUND', 404);
    }

    this.mockData.updateAppointment(id, { ...updates, updatedAt: new Date() });
    const updatedAppointment = this.mockData.getAppointments().find((a) => a.id === id)!;
    return this.apiClient
      .mockSuccess(updatedAppointment, 'Appointment updated successfully')
      .pipe(map((response) => response.data));
  }

  /**
   * Cancel an appointment
   */
  cancel(id: string): Observable<Appointment> {
    return this.update(id, { status: 'cancelled' });
  }

  /**
   * Complete an appointment
   */
  complete(id: string): Observable<Appointment> {
    return this.update(id, { status: 'completed' });
  }

  /**
   * Delete an appointment
   */
  delete(id: string): Observable<boolean> {
    const appointment = this.mockData.getAppointments().find((a) => a.id === id);
    if (!appointment) {
      return this.apiClient.mockError('Appointment not found', 'NOT_FOUND', 404);
    }
    this.mockData.deleteAppointment(id);
    return this.apiClient
      .mockSuccess(true, 'Appointment deleted successfully')
      .pipe(map((response) => response.data));
  }
}
