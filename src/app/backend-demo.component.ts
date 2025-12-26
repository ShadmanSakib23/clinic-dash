import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  AuthService,
  PatientService,
  DoctorService,
  AppointmentService,
} from './core/services';
import { Patient, Doctor, AppointmentWithDetails } from './core/models';

/**
 * Example component demonstrating how to use the simulated backend services
 * This can be used as a reference for implementing actual features
 */
@Component({
  selector: 'app-backend-demo',
  imports: [CommonModule],
  template: `
    <div class="demo-container">
      <h2>Backend Service Demo</h2>

      <!-- Authentication Status -->
      <section class="demo-section">
        <h3>Authentication</h3>
        @if (authService.isAuthenticated()) {
          <p>✅ Logged in as: {{ authService.user()?.firstName }} {{ authService.user()?.lastName }}</p>
          <p>Role: {{ authService.user()?.role }}</p>
          <button (click)="logout()">Logout</button>
        } @else {
          <p>❌ Not authenticated</p>
          <button (click)="login()">Login as Admin</button>
        }
      </section>

      <!-- Patients -->
      <section class="demo-section">
        <h3>Patients ({{ patients().length }})</h3>
        @if (loading().patients) {
          <p>Loading patients...</p>
        } @else {
          <ul>
            @for (patient of patients(); track patient.id) {
              <li>
                {{ patient.firstName }} {{ patient.lastName }} - {{ patient.email }}
              </li>
            }
          </ul>
        }
        <button (click)="loadPatients()">Refresh Patients</button>
      </section>

      <!-- Doctors -->
      <section class="demo-section">
        <h3>Doctors ({{ doctors().length }})</h3>
        @if (loading().doctors) {
          <p>Loading doctors...</p>
        } @else {
          <ul>
            @for (doctor of doctors(); track doctor.id) {
              <li>
                Dr. {{ doctor.firstName }} {{ doctor.lastName }} - {{ doctor.specialization }}
                (Rating: {{ doctor.rating }}⭐)
              </li>
            }
          </ul>
        }
        <button (click)="loadDoctors()">Refresh Doctors</button>
      </section>

      <!-- Appointments -->
      <section class="demo-section">
        <h3>Today's Appointments ({{ appointments().length }})</h3>
        @if (loading().appointments) {
          <p>Loading appointments...</p>
        } @else {
          <ul>
            @for (apt of appointments(); track apt.id) {
              <li>
                {{ apt.patientName }} → {{ apt.doctorName }}
                at {{ apt.dateTime | date:'short' }}
                ({{ apt.status }})
              </li>
            }
          </ul>
        }
        <button (click)="loadAppointments()">Refresh Appointments</button>
      </section>
    </div>
  `,
  styles: [`
    .demo-container {
      padding: 2rem;
      max-width: 1200px;
      margin: 0 auto;
    }

    .demo-section {
      margin-bottom: 2rem;
      padding: 1.5rem;
      border: 1px solid #ddd;
      border-radius: 8px;
      background: #f9f9f9;
    }

    h2 {
      color: #333;
      margin-bottom: 2rem;
    }

    h3 {
      color: #555;
      margin-bottom: 1rem;
    }

    ul {
      list-style: none;
      padding: 0;
    }

    li {
      padding: 0.5rem;
      margin: 0.5rem 0;
      background: white;
      border-radius: 4px;
      border-left: 3px solid #4CAF50;
    }

    button {
      margin-top: 1rem;
      padding: 0.5rem 1rem;
      background: #4CAF50;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 14px;
    }

    button:hover {
      background: #45a049;
    }

    p {
      margin: 0.5rem 0;
    }
  `],
})
export class BackendDemoComponent implements OnInit {
  readonly authService = inject(AuthService);
  private readonly patientService = inject(PatientService);
  private readonly doctorService = inject(DoctorService);
  private readonly appointmentService = inject(AppointmentService);

  readonly patients = signal<Patient[]>([]);
  readonly doctors = signal<Doctor[]>([]);
  readonly appointments = signal<AppointmentWithDetails[]>([]);
  readonly loading = signal({
    patients: false,
    doctors: false,
    appointments: false,
  });

  ngOnInit() {
    // Load initial data if authenticated
    if (this.authService.isAuthenticated()) {
      this.loadAllData();
    }
  }

  login() {
    this.authService
      .login({ email: 'admin@clinic.com', password: 'admin123' })
      .subscribe({
        next: (response) => {
          console.log('Login successful:', response);
          this.loadAllData();
        },
        error: (error) => {
          console.error('Login failed:', error);
          alert('Login failed: ' + error.message);
        },
      });
  }

  logout() {
    this.authService.logout().subscribe({
      next: () => {
        console.log('Logout successful');
        this.patients.set([]);
        this.doctors.set([]);
        this.appointments.set([]);
      },
      error: (error) => {
        console.error('Logout failed:', error);
      },
    });
  }

  loadAllData() {
    this.loadPatients();
    this.loadDoctors();
    this.loadAppointments();
  }

  loadPatients() {
    this.loading.update((state) => ({ ...state, patients: true }));
    this.patientService.getAll().subscribe({
      next: (patients) => {
        this.patients.set(patients);
        this.loading.update((state) => ({ ...state, patients: false }));
        console.log('Loaded patients:', patients);
      },
      error: (error) => {
        console.error('Failed to load patients:', error);
        this.loading.update((state) => ({ ...state, patients: false }));
      },
    });
  }

  loadDoctors() {
    this.loading.update((state) => ({ ...state, doctors: true }));
    this.doctorService.getAll().subscribe({
      next: (doctors) => {
        this.doctors.set(doctors);
        this.loading.update((state) => ({ ...state, doctors: false }));
        console.log('Loaded doctors:', doctors);
      },
      error: (error) => {
        console.error('Failed to load doctors:', error);
        this.loading.update((state) => ({ ...state, doctors: false }));
      },
    });
  }

  loadAppointments() {
    this.loading.update((state) => ({ ...state, appointments: true }));
    this.appointmentService.getToday().subscribe({
      next: (appointments) => {
        // Get appointments with details
        this.appointmentService.getAllWithDetails().subscribe({
          next: (detailedAppointments) => {
            // Filter for today's appointments
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const tomorrow = new Date(today);
            tomorrow.setDate(tomorrow.getDate() + 1);

            const todaysAppointments = detailedAppointments.filter(
              (apt) => apt.dateTime >= today && apt.dateTime < tomorrow
            );

            this.appointments.set(todaysAppointments);
            this.loading.update((state) => ({ ...state, appointments: false }));
            console.log('Loaded appointments:', todaysAppointments);
          },
        });
      },
      error: (error) => {
        console.error('Failed to load appointments:', error);
        this.loading.update((state) => ({ ...state, appointments: false }));
      },
    });
  }
}
