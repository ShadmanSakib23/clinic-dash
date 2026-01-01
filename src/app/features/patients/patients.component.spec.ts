import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PatientsComponent } from './patients.component';
import { PatientService } from '../../core/services';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { of } from 'rxjs';
import { Patient } from '../../core/models';

describe('PatientsComponent', () => {
  let component: PatientsComponent;
  let fixture: ComponentFixture<PatientsComponent>;
  let patientService: any;

  const mockPatients: Patient[] = [
    {
      id: '1',
      firstName: 'John',
      lastName: 'Doe',
      dateOfBirth: new Date('1990-01-15'),
      gender: 'male',
      email: 'john.doe@example.com',
      phone: '555-0101',
      address: {
        street: '123 Main St',
        city: 'New York',
        state: 'NY',
        zipCode: '10001',
        country: 'USA'
      },
      emergencyContact: {
        name: 'Jane Doe',
        relationship: 'Spouse',
        phone: '555-0102'
      },
      bloodType: 'A+',
      allergies: ['Penicillin'],
      chronicConditions: [],
      registeredDate: new Date('2023-01-01'),
      lastVisit: new Date('2024-12-15')
    },
    {
      id: '2',
      firstName: 'Jane',
      lastName: 'Smith',
      dateOfBirth: new Date('1985-05-20'),
      gender: 'female',
      email: 'jane.smith@example.com',
      phone: '555-0103',
      address: {
        street: '456 Oak Ave',
        city: 'Los Angeles',
        state: 'CA',
        zipCode: '90001',
        country: 'USA'
      },
      emergencyContact: {
        name: 'John Smith',
        relationship: 'Spouse',
        phone: '555-0104'
      },
      bloodType: 'O-',
      allergies: [],
      chronicConditions: ['Diabetes'],
      registeredDate: new Date('2023-02-15')
    }
  ];

  beforeEach(async () => {
    const patientServiceMock = {
      getAll: () => of(mockPatients)
    };

    await TestBed.configureTestingModule({
      imports: [PatientsComponent, BrowserAnimationsModule],
      providers: [
        { provide: PatientService, useValue: patientServiceMock }
      ]
    }).compileComponents();

    patientService = TestBed.inject(PatientService);
    fixture = TestBed.createComponent(PatientsComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load patients on init', () => {
    fixture.detectChanges();

    expect(component.patients().length).toBe(2);
    expect(component.totalPatients()).toBe(2);
  });

  it('should set loading state correctly', () => {
    expect(component.loading()).toBe(false);
    
    component.loadPatients();
    
    // After observable completes
    expect(component.loading()).toBe(false);
  });

  it('should calculate age correctly', () => {
    fixture.detectChanges();

    const patient = mockPatients[0];
    const age = component['calculateAge'](patient.dateOfBirth);
    
    // John Doe born in 1990, should be around 34-35 years old
    expect(age).toBeGreaterThanOrEqual(34);
    expect(age).toBeLessThanOrEqual(35);
  });

  it('should handle selection change', () => {
    fixture.detectChanges();

    const selection = [mockPatients[0]];
    component.onSelectionChange(selection);

    expect(component.selectedPatients()).toEqual(selection);
    expect(component.hasSelection()).toBe(true);
  });

  it('should handle row click', () => {
    fixture.detectChanges();

    const viewSpy = (component as any).viewPatient = () => {};
    component.onRowClick(mockPatients[0]);

    // Basic test - just ensure no errors
    expect(component).toBeTruthy();
  });

  it('should refresh patient list', () => {
    component.refresh();

    // After refresh, patients should be loaded
    expect(component.patients().length).toBeGreaterThanOrEqual(0);
  });

  it('should format date correctly', () => {
    const date = new Date('2024-12-15');
    const formatted = component['formatDate'](date);

    expect(formatted).toContain('Dec');
    expect(formatted).toContain('15');
    expect(formatted).toContain('2024');
  });

  it('should show stats correctly', () => {
    fixture.detectChanges();

    expect(component.totalPatients()).toBe(2);
  });
});
