import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Patient } from '../models';
import { ApiClientService, ApiResponse } from './api-client.service';
import { MockDataService } from './mock-data.service';

@Injectable({
  providedIn: 'root',
})
export class PatientService {
  private readonly apiClient = inject(ApiClientService);
  private readonly mockData = inject(MockDataService);

  /**
   * Get all patients
   */
  getAll(): Observable<Patient[]> {
    const patients = this.mockData.getPatients();
    return this.apiClient.mockSuccess(patients).pipe(map((response) => response.data));
  }

  /**
   * Get patient by ID
   */
  getById(id: string): Observable<Patient | null> {
    const patient = this.mockData.getPatients().find((p) => p.id === id) ?? null;
    return this.apiClient.mockSuccess(patient).pipe(map((response) => response.data));
  }

  /**
   * Search patients by name or email
   */
  search(query: string): Observable<Patient[]> {
    const lowerQuery = query.toLowerCase();
    const patients = this.mockData.getPatients().filter(
      (p) =>
        p.firstName.toLowerCase().includes(lowerQuery) ||
        p.lastName.toLowerCase().includes(lowerQuery) ||
        p.email.toLowerCase().includes(lowerQuery)
    );
    return this.apiClient.mockSuccess(patients).pipe(map((response) => response.data));
  }

  /**
   * Create a new patient
   */
  create(patient: Omit<Patient, 'id' | 'registeredDate'>): Observable<Patient> {
    const newPatient: Patient = {
      ...patient,
      id: `P${String(this.mockData.getPatients().length + 1).padStart(3, '0')}`,
      registeredDate: new Date(),
    };
    this.mockData.addPatient(newPatient);
    return this.apiClient
      .mockSuccess(newPatient, 'Patient created successfully')
      .pipe(map((response) => response.data));
  }

  /**
   * Update an existing patient
   */
  update(id: string, updates: Partial<Patient>): Observable<Patient> {
    const patient = this.mockData.getPatients().find((p) => p.id === id);
    if (!patient) {
      return this.apiClient.mockError('Patient not found', 'NOT_FOUND', 404);
    }
    this.mockData.updatePatient(id, updates);
    const updatedPatient = this.mockData.getPatients().find((p) => p.id === id)!;
    return this.apiClient
      .mockSuccess(updatedPatient, 'Patient updated successfully')
      .pipe(map((response) => response.data));
  }

  /**
   * Delete a patient
   */
  delete(id: string): Observable<boolean> {
    const patient = this.mockData.getPatients().find((p) => p.id === id);
    if (!patient) {
      return this.apiClient.mockError('Patient not found', 'NOT_FOUND', 404);
    }
    this.mockData.deletePatient(id);
    return this.apiClient
      .mockSuccess(true, 'Patient deleted successfully')
      .pipe(map((response) => response.data));
  }

  /**
   * Get patients with upcoming appointments
   */
  getWithUpcomingAppointments(): Observable<Patient[]> {
    const now = new Date();
    const appointmentPatientIds = this.mockData
      .getAppointments()
      .filter((apt) => apt.dateTime > now && apt.status === 'scheduled')
      .map((apt) => apt.patientId);

    const uniquePatientIds = [...new Set(appointmentPatientIds)];
    const patients = this.mockData
      .getPatients()
      .filter((p) => uniquePatientIds.includes(p.id));

    return this.apiClient.mockSuccess(patients).pipe(map((response) => response.data));
  }
}
