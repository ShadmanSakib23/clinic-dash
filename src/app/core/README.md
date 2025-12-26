# Simulated Backend Service Layer

This directory contains the simulated backend service layer with in-memory data storage for the Clinic Dashboard application.

## Overview

The backend simulation provides a complete mock API layer that mimics real HTTP communication with:
- Simulated network delays
- CRUD operations for all entities
- Authentication and authorization
- Error handling
- Type-safe interfaces

## Architecture

### Models (`core/models/`)

Type-safe interfaces for all data entities:
- **User** - Application users with roles (admin, doctor, nurse, receptionist)
- **Patient** - Patient records with medical history
- **Doctor** - Doctor profiles with specializations and availability
- **Appointment** - Appointment scheduling and management
- **MedicalRecord** - Patient medical records and prescriptions

### Services (`core/services/`)

#### MockDataService
Central in-memory data store with signals for reactive state management.
- Stores all mock data (users, patients, doctors, appointments, medical records)
- Provides CRUD operations for each entity
- Uses Angular signals for reactive updates

#### ApiClientService
Simulates HTTP client with realistic API behavior:
- `get<T>()`, `post<T>()`, `put<T>()`, `patch<T>()`, `delete<T>()`
- Network delay simulation (default 500ms)
- Success/error response helpers
- Logging for debugging

#### AuthService
Complete authentication service with:
- Login/logout functionality
- Session management (localStorage)
- Role-based access control
- Password management
- Reactive authentication state using signals

#### Domain Services

**PatientService**
- Get all patients / by ID
- Search patients
- Create, update, delete patients
- Get patients with upcoming appointments

**DoctorService**
- Get all doctors / by ID / by specialization
- Search doctors
- Get available doctors by day
- Get top-rated doctors
- Create, update, delete doctors

**AppointmentService**
- Get all appointments / by ID / with details
- Filter by patient, doctor, status
- Get upcoming and today's appointments
- Create, update, cancel, complete appointments
- Delete appointments

## Usage Examples

### Authentication

```typescript
import { inject } from '@angular/core';
import { AuthService } from '@app/core/services';

const authService = inject(AuthService);

// Login
authService.login({ email: 'admin@clinic.com', password: 'admin123' })
  .subscribe(response => {
    console.log('Logged in:', response.user);
  });

// Check authentication state
const isAuthenticated = authService.isAuthenticated();
const currentUser = authService.user();
const isAdmin = authService.isAdmin();

// Logout
authService.logout().subscribe(() => {
  console.log('Logged out');
});
```

### Patient Management

```typescript
import { inject } from '@angular/core';
import { PatientService } from '@app/core/services';

const patientService = inject(PatientService);

// Get all patients
patientService.getAll().subscribe(patients => {
  console.log('Patients:', patients);
});

// Search patients
patientService.search('john').subscribe(results => {
  console.log('Search results:', results);
});

// Create new patient
patientService.create({
  firstName: 'John',
  lastName: 'Doe',
  // ... other fields
}).subscribe(patient => {
  console.log('Created:', patient);
});
```

### Appointment Management

```typescript
import { inject } from '@angular/core';
import { AppointmentService } from '@app/core/services';

const appointmentService = inject(AppointmentService);

// Get today's appointments
appointmentService.getToday().subscribe(appointments => {
  console.log('Today:', appointments);
});

// Get appointments with patient/doctor details
appointmentService.getAllWithDetails().subscribe(appointments => {
  console.log('Appointments:', appointments);
});

// Create appointment
appointmentService.create({
  patientId: 'P001',
  doctorId: 'D001',
  dateTime: new Date('2024-12-30T10:00:00'),
  duration: 30,
  status: 'scheduled',
  type: 'consultation',
  reason: 'Regular checkup',
}).subscribe(appointment => {
  console.log('Created:', appointment);
});
```

### Doctor Management

```typescript
import { inject } from '@angular/core';
import { DoctorService } from '@app/core/services';

const doctorService = inject(DoctorService);

// Get top-rated doctors
doctorService.getTopRated(5).subscribe(doctors => {
  console.log('Top rated:', doctors);
});

// Get doctors by specialization
doctorService.getBySpecialization('Cardiology').subscribe(doctors => {
  console.log('Cardiologists:', doctors);
});
```

## Mock Data

The `MockDataService` comes pre-populated with sample data:

- **4 Users** (admin, doctor, nurse, receptionist)
- **3 Patients** with complete profiles
- **3 Doctors** with different specializations
- **4 Appointments** with various statuses
- **1 Medical Record** with prescriptions and lab tests

### Default Credentials

```typescript
// Admin
email: 'admin@clinic.com'
password: 'admin123'

// Doctor
email: 'dr.smith@clinic.com'
password: 'doctor123'

// Nurse
email: 'nurse.jane@clinic.com'
password: 'nurse123'

// Receptionist
email: 'reception@clinic.com'
password: 'reception123'
```

## Features

### ✅ Reactive State Management
All services use Angular signals for reactive state updates.

### ✅ Type Safety
Complete TypeScript interfaces for all data models.

### ✅ Realistic Behavior
- Network delay simulation
- Proper error handling
- Validation checks
- Relationship constraints

### ✅ Logging
Console logging for all API operations (can be disabled in production).

### ✅ Session Persistence
Authentication state persists across page reloads using localStorage.

### ✅ Role-Based Access
Authentication service provides role checking utilities:
- `isAdmin()`, `isDoctor()`, `isNurse()`, `isReceptionist()`
- `hasRole(role)`, `hasAnyRole(roles)`

## Migration to Real Backend

When ready to connect to a real backend:

1. Update `ApiClientService` to use Angular's `HttpClient`
2. Replace mock implementations with real HTTP calls
3. Update service methods to use actual API endpoints
4. Remove or conditionally disable `MockDataService`
5. Update authentication to use real JWT tokens

The service interfaces remain the same, making migration straightforward.

## Testing

All services can be easily tested with Angular's testing utilities:

```typescript
import { TestBed } from '@angular/core/testing';
import { PatientService } from './patient.service';

describe('PatientService', () => {
  let service: PatientService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PatientService);
  });

  it('should get all patients', (done) => {
    service.getAll().subscribe(patients => {
      expect(patients.length).toBeGreaterThan(0);
      done();
    });
  });
});
```

## Best Practices

1. **Always use services** - Never access `MockDataService` directly from components
2. **Subscribe in components** - Use async pipe in templates when possible
3. **Handle errors** - Always provide error handling in subscriptions
4. **Unsubscribe** - Use takeUntil or async pipe to prevent memory leaks
5. **Type everything** - Leverage TypeScript for type safety

## Future Enhancements

- [ ] Add medical record service
- [ ] Add billing/payment tracking
- [ ] Add prescription management
- [ ] Add lab test results
- [ ] Add staff scheduling
- [ ] Add analytics/reporting
- [ ] Add notification system
- [ ] Add audit logging
