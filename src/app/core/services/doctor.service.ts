import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Doctor, DayOfWeek } from '../models';
import { ApiClientService } from './api-client.service';
import { MockDataService } from './mock-data.service';

@Injectable({
  providedIn: 'root',
})
export class DoctorService {
  private readonly apiClient = inject(ApiClientService);
  private readonly mockData = inject(MockDataService);

  /**
   * Get all doctors
   */
  getAll(): Observable<Doctor[]> {
    const doctors = this.mockData.getDoctors();
    return this.apiClient.mockSuccess(doctors).pipe(map((response) => response.data));
  }

  /**
   * Get doctor by ID
   */
  getById(id: string): Observable<Doctor | null> {
    const doctor = this.mockData.getDoctors().find((d) => d.id === id) ?? null;
    return this.apiClient.mockSuccess(doctor).pipe(map((response) => response.data));
  }

  /**
   * Get doctors by specialization
   */
  getBySpecialization(specialization: string): Observable<Doctor[]> {
    const doctors = this.mockData
      .getDoctors()
      .filter((d) => d.specialization.toLowerCase() === specialization.toLowerCase());
    return this.apiClient.mockSuccess(doctors).pipe(map((response) => response.data));
  }

  /**
   * Search doctors by name or specialization
   */
  search(query: string): Observable<Doctor[]> {
    const lowerQuery = query.toLowerCase();
    const doctors = this.mockData.getDoctors().filter(
      (d) =>
        d.firstName.toLowerCase().includes(lowerQuery) ||
        d.lastName.toLowerCase().includes(lowerQuery) ||
        d.specialization.toLowerCase().includes(lowerQuery)
    );
    return this.apiClient.mockSuccess(doctors).pipe(map((response) => response.data));
  }

  /**
   * Get doctors available on a specific day
   */
  getAvailableOnDay(dayOfWeek: DayOfWeek): Observable<Doctor[]> {
    const doctors = this.mockData
      .getDoctors()
      .filter((d) => d.availableSlots.some((slot) => slot.dayOfWeek === dayOfWeek));
    return this.apiClient.mockSuccess(doctors).pipe(map((response) => response.data));
  }

  /**
   * Get top-rated doctors
   */
  getTopRated(limit: number = 5): Observable<Doctor[]> {
    const doctors = [...this.mockData.getDoctors()]
      .sort((a, b) => b.rating - a.rating)
      .slice(0, limit);
    return this.apiClient.mockSuccess(doctors).pipe(map((response) => response.data));
  }

  /**
   * Create a new doctor
   */
  create(doctor: Omit<Doctor, 'id' | 'joinedDate' | 'rating' | 'reviewsCount'>): Observable<Doctor> {
    const newDoctor: Doctor = {
      ...doctor,
      id: `D${String(this.mockData.getDoctors().length + 1).padStart(3, '0')}`,
      joinedDate: new Date(),
      rating: 0,
      reviewsCount: 0,
    };
    this.mockData.addDoctor(newDoctor);
    return this.apiClient
      .mockSuccess(newDoctor, 'Doctor added successfully')
      .pipe(map((response) => response.data));
  }

  /**
   * Update an existing doctor
   */
  update(id: string, updates: Partial<Doctor>): Observable<Doctor> {
    const doctor = this.mockData.getDoctors().find((d) => d.id === id);
    if (!doctor) {
      return this.apiClient.mockError('Doctor not found', 'NOT_FOUND', 404);
    }
    this.mockData.updateDoctor(id, updates);
    const updatedDoctor = this.mockData.getDoctors().find((d) => d.id === id)!;
    return this.apiClient
      .mockSuccess(updatedDoctor, 'Doctor updated successfully')
      .pipe(map((response) => response.data));
  }

  /**
   * Delete a doctor
   */
  delete(id: string): Observable<boolean> {
    const doctor = this.mockData.getDoctors().find((d) => d.id === id);
    if (!doctor) {
      return this.apiClient.mockError('Doctor not found', 'NOT_FOUND', 404);
    }
    this.mockData.deleteDoctor(id);
    return this.apiClient
      .mockSuccess(true, 'Doctor deleted successfully')
      .pipe(map((response) => response.data));
  }
}
