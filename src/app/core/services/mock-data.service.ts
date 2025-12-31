import { Injectable, signal } from '@angular/core';
import {
  User,
  Patient,
  Doctor,
  Appointment,
  MedicalRecord,
} from '../models';

@Injectable({
  providedIn: 'root',
})
export class MockDataService {
  private readonly users = signal<User[]>([
    {
      id: '1',
      email: 'admin@clinic.com',
      password: 'admin123',
      firstName: 'Admin',
      lastName: 'User',
      role: 'admin',
      phone: '+1-555-0100',
      createdAt: new Date('2024-01-01'),
      lastLogin: new Date(),
    },
    {
      id: '2',
      email: 'dr.smith@clinic.com',
      password: 'doctor123',
      firstName: 'John',
      lastName: 'Smith',
      role: 'doctor',
      phone: '+1-555-0101',
      createdAt: new Date('2024-01-15'),
      lastLogin: new Date(),
    },
    {
      id: '3',
      email: 'nurse.jane@clinic.com',
      password: 'nurse123',
      firstName: 'Jane',
      lastName: 'Doe',
      role: 'nurse',
      phone: '+1-555-0102',
      createdAt: new Date('2024-02-01'),
    },
    {
      id: '4',
      email: 'reception@clinic.com',
      password: 'reception123',
      firstName: 'Mary',
      lastName: 'Johnson',
      role: 'receptionist',
      phone: '+1-555-0103',
      createdAt: new Date('2024-02-15'),
    },
  ]);

  private readonly patients = signal<Patient[]>([
    {
      id: 'P001',
      firstName: 'Michael',
      lastName: 'Brown',
      dateOfBirth: new Date('1985-03-15'),
      gender: 'male',
      email: 'michael.brown@email.com',
      phone: '+1-555-0201',
      address: {
        street: '123 Main St',
        city: 'Springfield',
        state: 'IL',
        zipCode: '62701',
        country: 'USA',
      },
      emergencyContact: {
        name: 'Sarah Brown',
        relationship: 'Spouse',
        phone: '+1-555-0202',
      },
      bloodType: 'O+',
      allergies: ['Penicillin', 'Peanuts'],
      chronicConditions: ['Hypertension'],
      insuranceInfo: {
        provider: 'Blue Cross',
        policyNumber: 'BC123456',
        groupNumber: 'GRP789',
        expiryDate: new Date('2025-12-31'),
      },
      registeredDate: new Date('2024-01-10'),
      lastVisit: new Date('2024-12-20'),
    },
    {
      id: 'P002',
      firstName: 'Emily',
      lastName: 'Davis',
      dateOfBirth: new Date('1990-07-22'),
      gender: 'female',
      email: 'emily.davis@email.com',
      phone: '+1-555-0203',
      address: {
        street: '456 Oak Ave',
        city: 'Springfield',
        state: 'IL',
        zipCode: '62702',
        country: 'USA',
      },
      emergencyContact: {
        name: 'Robert Davis',
        relationship: 'Father',
        phone: '+1-555-0204',
      },
      bloodType: 'A+',
      allergies: [],
      chronicConditions: [],
      registeredDate: new Date('2024-03-05'),
      lastVisit: new Date('2024-12-15'),
    },
    {
      id: 'P003',
      firstName: 'James',
      lastName: 'Wilson',
      dateOfBirth: new Date('1978-11-30'),
      gender: 'male',
      email: 'james.wilson@email.com',
      phone: '+1-555-0205',
      address: {
        street: '789 Pine Rd',
        city: 'Springfield',
        state: 'IL',
        zipCode: '62703',
        country: 'USA',
      },
      emergencyContact: {
        name: 'Lisa Wilson',
        relationship: 'Spouse',
        phone: '+1-555-0206',
      },
      bloodType: 'B-',
      allergies: ['Latex'],
      chronicConditions: ['Diabetes Type 2', 'High Cholesterol'],
      insuranceInfo: {
        provider: 'Aetna',
        policyNumber: 'AET987654',
        expiryDate: new Date('2025-06-30'),
      },
      registeredDate: new Date('2024-02-20'),
      lastVisit: new Date('2024-12-18'),
    },
    {
        id: 'P004',
        firstName: 'Sophia',
        lastName: 'Martinez',
        dateOfBirth: new Date('1992-05-18'),
        gender: 'female',
        email: 'sophia.martinez@email.com',
        phone: '+1-555-0207',
        address: {
            street: '321 Elm St',
            city: 'Springfield',
            state: 'IL',
            zipCode: '62704',
            country: 'USA',
        },
        emergencyContact: {
            name: 'Carlos Martinez',
            relationship: 'Brother',
            phone: '+1-555-0208',
        },
        bloodType: 'AB+',
        allergies: ['Sulfa drugs'],
        chronicConditions: ['Asthma'],
        insuranceInfo: {
            provider: 'UnitedHealth',
            policyNumber: 'UH456789',
            groupNumber: 'GRP321',
            expiryDate: new Date('2025-09-30'),
        },
        registeredDate: new Date('2024-04-12'),
        lastVisit: new Date('2024-12-22'),
    },
    {
        id: 'P005',
        firstName: 'David',
        lastName: 'Thompson',
        dateOfBirth: new Date('1965-09-08'),
        gender: 'male',
        email: 'david.thompson@email.com',
        phone: '+1-555-0209',
        address: {
            street: '654 Maple Dr',
            city: 'Springfield',
            state: 'IL',
            zipCode: '62705',
            country: 'USA',
        },
        emergencyContact: {
            name: 'Patricia Thompson',
            relationship: 'Spouse',
            phone: '+1-555-0210',
        },
        bloodType: 'O-',
        allergies: ['Shellfish', 'Iodine'],
        chronicConditions: ['Arthritis', 'Hypertension'],
        insuranceInfo: {
            provider: 'Medicare',
            policyNumber: 'MC789012',
            expiryDate: new Date('2026-12-31'),
        },
        registeredDate: new Date('2024-05-20'),
        lastVisit: new Date('2024-12-19'),
    },
    {
        id: 'P006',
        firstName: 'Olivia',
        lastName: 'Anderson',
        dateOfBirth: new Date('1988-12-03'),
        gender: 'female',
        email: 'olivia.anderson@email.com',
        phone: '+1-555-0211',
        address: {
            street: '987 Cedar Ln',
            city: 'Springfield',
            state: 'IL',
            zipCode: '62706',
            country: 'USA',
        },
        emergencyContact: {
            name: 'Emma Anderson',
            relationship: 'Sister',
            phone: '+1-555-0212',
        },
        bloodType: 'A-',
        allergies: [],
        chronicConditions: [],
        registeredDate: new Date('2024-06-15'),
        lastVisit: new Date('2024-12-21'),
    },
  ]);

  private readonly doctors = signal<Doctor[]>([
    {
      id: 'D001',
      firstName: 'John',
      lastName: 'Smith',
      specialization: 'Cardiology',
      email: 'dr.smith@clinic.com',
      phone: '+1-555-0101',
      licenseNumber: 'MD123456',
      education: [
        {
          degree: 'MD',
          institution: 'Harvard Medical School',
          year: 2005,
        },
        {
          degree: 'Cardiology Fellowship',
          institution: 'Johns Hopkins',
          year: 2010,
        },
      ],
      experienceYears: 15,
      consultationFee: 200,
      availableSlots: [
        { dayOfWeek: 'monday', startTime: '09:00', endTime: '17:00' },
        { dayOfWeek: 'wednesday', startTime: '09:00', endTime: '17:00' },
        { dayOfWeek: 'friday', startTime: '09:00', endTime: '13:00' },
      ],
      rating: 4.8,
      reviewsCount: 156,
      joinedDate: new Date('2020-01-15'),
      bio: 'Experienced cardiologist specializing in preventive cardiology and heart disease management.',
    },
    {
      id: 'D002',
      firstName: 'Sarah',
      lastName: 'Johnson',
      specialization: 'Pediatrics',
      email: 'dr.johnson@clinic.com',
      phone: '+1-555-0301',
      licenseNumber: 'MD234567',
      education: [
        {
          degree: 'MD',
          institution: 'Stanford Medical School',
          year: 2008,
        },
        {
          degree: 'Pediatrics Residency',
          institution: 'Boston Children\'s Hospital',
          year: 2012,
        },
      ],
      experienceYears: 13,
      consultationFee: 150,
      availableSlots: [
        { dayOfWeek: 'tuesday', startTime: '08:00', endTime: '16:00' },
        { dayOfWeek: 'thursday', startTime: '08:00', endTime: '16:00' },
        { dayOfWeek: 'saturday', startTime: '09:00', endTime: '13:00' },
      ],
      rating: 4.9,
      reviewsCount: 203,
      joinedDate: new Date('2020-06-01'),
      bio: 'Dedicated pediatrician with expertise in child development and preventive care.',
    },
    {
      id: 'D003',
      firstName: 'Robert',
      lastName: 'Chen',
      specialization: 'Internal Medicine',
      email: 'dr.chen@clinic.com',
      phone: '+1-555-0302',
      licenseNumber: 'MD345678',
      education: [
        {
          degree: 'MD',
          institution: 'Yale School of Medicine',
          year: 2010,
        },
      ],
      experienceYears: 12,
      consultationFee: 180,
      availableSlots: [
        { dayOfWeek: 'monday', startTime: '10:00', endTime: '18:00' },
        { dayOfWeek: 'tuesday', startTime: '10:00', endTime: '18:00' },
        { dayOfWeek: 'thursday', startTime: '10:00', endTime: '18:00' },
      ],
      rating: 4.7,
      reviewsCount: 128,
      joinedDate: new Date('2021-03-01'),
      bio: 'Internal medicine specialist focusing on adult primary care and chronic disease management.',
    },
  ]);

  private readonly appointments = signal<Appointment[]>([
    {
      id: 'A001',
      patientId: 'P001',
      doctorId: 'D001',
      dateTime: new Date('2024-12-28T10:00:00'),
      duration: 30,
      status: 'scheduled',
      type: 'consultation',
      reason: 'Chest pain follow-up',
      symptoms: ['chest discomfort', 'shortness of breath'],
      createdAt: new Date('2024-12-20'),
      updatedAt: new Date('2024-12-20'),
    },
    {
      id: 'A002',
      patientId: 'P002',
      doctorId: 'D002',
      dateTime: new Date('2024-12-27T14:00:00'),
      duration: 30,
      status: 'confirmed',
      type: 'routine-checkup',
      reason: 'Annual checkup',
      createdAt: new Date('2024-12-15'),
      updatedAt: new Date('2024-12-18'),
    },
    {
      id: 'A003',
      patientId: 'P003',
      doctorId: 'D003',
      dateTime: new Date('2024-12-26T11:00:00'),
      duration: 45,
      status: 'completed',
      type: 'follow-up',
      reason: 'Diabetes management',
      symptoms: ['fatigue', 'increased thirst'],
      notes: 'Blood sugar levels stable. Continue current medication.',
      createdAt: new Date('2024-12-10'),
      updatedAt: new Date('2024-12-26'),
    },
    {
      id: 'A004',
      patientId: 'P001',
      doctorId: 'D003',
      dateTime: new Date('2024-12-29T15:30:00'),
      duration: 30,
      status: 'scheduled',
      type: 'consultation',
      reason: 'General consultation',
      createdAt: new Date('2024-12-22'),
      updatedAt: new Date('2024-12-22'),
    },
  ]);

  private readonly medicalRecords = signal<MedicalRecord[]>([
    {
      id: 'MR001',
      patientId: 'P003',
      appointmentId: 'A003',
      doctorId: 'D003',
      date: new Date('2024-12-26'),
      diagnosis: 'Type 2 Diabetes - Well Controlled',
      symptoms: ['fatigue', 'increased thirst'],
      prescriptions: [
        {
          medication: 'Metformin',
          dosage: '500mg',
          frequency: 'Twice daily',
          duration: '3 months',
          instructions: 'Take with meals',
        },
      ],
      labTests: [
        {
          name: 'HbA1c',
          result: '6.5%',
          status: 'completed',
          orderedDate: new Date('2024-12-26'),
          completedDate: new Date('2024-12-26'),
        },
      ],
      vitals: {
        bloodPressure: '128/82',
        heartRate: 78,
        temperature: 36.7,
        weight: 85,
        height: 175,
        bmi: 27.8,
        oxygenSaturation: 98,
      },
      notes: 'Patient showing good compliance with treatment. Blood sugar levels within target range.',
    },
  ]);

  // Getters for accessing data
  getUsers() {
    return this.users();
  }

  getPatients() {
    return this.patients();
  }

  getDoctors() {
    return this.doctors();
  }

  getAppointments() {
    return this.appointments();
  }

  getMedicalRecords() {
    return this.medicalRecords();
  }

  // Methods to update data
  addUser(user: User) {
    this.users.update((users) => [...users, user]);
  }

  updateUser(id: string, updates: Partial<User>) {
    this.users.update((users) =>
      users.map((user) => (user.id === id ? { ...user, ...updates } : user))
    );
  }

  deleteUser(id: string) {
    this.users.update((users) => users.filter((user) => user.id !== id));
  }

  addPatient(patient: Patient) {
    this.patients.update((patients) => [...patients, patient]);
  }

  updatePatient(id: string, updates: Partial<Patient>) {
    this.patients.update((patients) =>
      patients.map((patient) => (patient.id === id ? { ...patient, ...updates } : patient))
    );
  }

  deletePatient(id: string) {
    this.patients.update((patients) => patients.filter((patient) => patient.id !== id));
  }

  addDoctor(doctor: Doctor) {
    this.doctors.update((doctors) => [...doctors, doctor]);
  }

  updateDoctor(id: string, updates: Partial<Doctor>) {
    this.doctors.update((doctors) =>
      doctors.map((doctor) => (doctor.id === id ? { ...doctor, ...updates } : doctor))
    );
  }

  deleteDoctor(id: string) {
    this.doctors.update((doctors) => doctors.filter((doctor) => doctor.id !== id));
  }

  addAppointment(appointment: Appointment) {
    this.appointments.update((appointments) => [...appointments, appointment]);
  }

  updateAppointment(id: string, updates: Partial<Appointment>) {
    this.appointments.update((appointments) =>
      appointments.map((appointment) =>
        appointment.id === id ? { ...appointment, ...updates } : appointment
      )
    );
  }

  deleteAppointment(id: string) {
    this.appointments.update((appointments) =>
      appointments.filter((appointment) => appointment.id !== id)
    );
  }

  addMedicalRecord(record: MedicalRecord) {
    this.medicalRecords.update((records) => [...records, record]);
  }

  updateMedicalRecord(id: string, updates: Partial<MedicalRecord>) {
    this.medicalRecords.update((records) =>
      records.map((record) => (record.id === id ? { ...record, ...updates } : record))
    );
  }

  deleteMedicalRecord(id: string) {
    this.medicalRecords.update((records) => records.filter((record) => record.id !== id));
  }
}
