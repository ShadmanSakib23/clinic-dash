import {
  Component,
  signal,
  computed,
  inject,
  OnInit,
  ChangeDetectionStrategy,
} from '@angular/core';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { PatientService, DoctorService, AppointmentService } from '../../core/services';
import { Patient, Doctor, Appointment } from '../../core/models';

/**
 * Dashboard Component
 * 
 * Main dashboard showing overview statistics and quick access to key features
 */
@Component({
  selector: 'app-dashboard',
  imports: [
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatProgressBarModule,
    MatTooltipModule,
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly patientService = inject(PatientService);
  private readonly doctorService = inject(DoctorService);
  private readonly appointmentService = inject(AppointmentService);

  // State
  readonly patients = signal<Patient[]>([]);
  readonly doctors = signal<Doctor[]>([]);
  readonly appointments = signal<Appointment[]>([]);
  readonly loading = signal(false);

  // Computed stats
  readonly totalPatients = computed(() => this.patients().length);
  readonly totalDoctors = computed(() => this.doctors().length);
  readonly totalAppointments = computed(() => this.appointments().length);

  // Today's appointments
  readonly todayAppointments = computed(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    return this.appointments().filter((apt) => {
      const aptDate = new Date(apt.dateTime);
      return aptDate >= today && aptDate < tomorrow;
    }).length;
  });

  // New patients this month
  readonly newPatientsThisMonth = computed(() => {
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    return this.patients().filter((patient) => {
      const registeredDate = new Date(patient.registeredDate);
      return registeredDate >= firstDayOfMonth;
    }).length;
  });

  ngOnInit(): void {
    this.loadDashboardData();
  }

  private loadDashboardData(): void {
    this.loading.set(true);

    // Load patients
    this.patientService.getAll().subscribe({
      next: (patients) => {
        this.patients.set(patients);
      },
      error: (error) => {
        console.error('Error loading patients:', error);
      },      
    });

    // Load doctors
    this.doctorService.getAll().subscribe({
      next: (doctors) => {
        this.doctors.set(doctors);
      },
      error: (error) => {
        console.error('Error loading doctors:', error);
      },
    });

    // Load appointments
    this.appointmentService.getAll().subscribe({
      next: (appointments) => {
        this.appointments.set(appointments);
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error loading appointments:', error);
        this.loading.set(false);
      },
    });
  }

  navigateTo(route: string): void {
    this.router.navigate([route]);
  }

  refresh(): void {
    this.loadDashboardData();
  }
}
