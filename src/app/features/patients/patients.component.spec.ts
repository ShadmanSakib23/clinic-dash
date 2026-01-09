import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { PatientsComponent } from './patients.component';
import { PatientService } from '../../core/services/patient.service';
import { provideAnimations } from '@angular/platform-browser/animations';
import { of } from 'rxjs';

describe('PatientsComponent', () => {
  let component: PatientsComponent;
  let fixture: ComponentFixture<PatientsComponent>;
  let patientService: { getAll: ReturnType<typeof vi.fn> };
  let router: { navigate: ReturnType<typeof vi.fn> };
  let dialog: { open: ReturnType<typeof vi.fn> };

  const mockPatients = [
    {
      id: '1',
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      phone: '555-0100',
      dateOfBirth: new Date('1990-01-01'),
      gender: 'male' as const,
      address: {
        street: '123 Main St',
        city: 'Springfield',
        state: 'IL',
        zipCode: '62701',
        country: 'USA',
      },
      emergencyContact: {
        name: 'Jane Doe',
        relationship: 'Spouse',
        phone: '555-0101',
      },
      bloodType: 'O+' as const,
      allergies: ['None'],
      chronicConditions: [],
      insuranceInfo: {
        provider: 'Blue Cross',
        policyNumber: 'BC123456',
        expiryDate: new Date('2025-12-31'),
      },
      registeredDate: new Date('2024-01-01'),
      lastVisit: new Date('2024-01-15'),
    },
    {
      id: '2',
      firstName: 'Jane',
      lastName: 'Smith',
      email: 'jane.smith@example.com',
      phone: '555-0200',
      dateOfBirth: new Date('1985-06-15'),
      gender: 'female' as const,
      address: {
        street: '456 Oak Ave',
        city: 'Springfield',
        state: 'IL',
        zipCode: '62702',
        country: 'USA',
      },
      emergencyContact: {
        name: 'John Smith',
        relationship: 'Spouse',
        phone: '555-0201',
      },
      bloodType: 'A+' as const,
      allergies: ['Penicillin'],
      chronicConditions: ['Hypertension'],
      insuranceInfo: {
        provider: 'Aetna',
        policyNumber: 'AE789012',
        expiryDate: new Date('2025-06-30'),
      },
      registeredDate: new Date('2024-01-05'),
      lastVisit: new Date('2024-01-20'),
    },
  ];

  beforeEach(async () => {
    patientService = {
      getAll: vi.fn(),
    };
    router = {
      navigate: vi.fn(),
    };
    dialog = {
      open: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [PatientsComponent],
      providers: [
        provideAnimations(),
        { provide: PatientService, useValue: patientService },
        { provide: Router, useValue: router },
        { provide: MatDialog, useValue: dialog },
      ],
    }).compileComponents();

    patientService.getAll.mockReturnValue(of(mockPatients));

    fixture = TestBed.createComponent(PatientsComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Component Initialization', () => {
    it('should load patients on init', () => {
      fixture.detectChanges();
      
      expect(patientService.getAll).toHaveBeenCalled();
      expect(component.patients().length).toBe(2);
    });

    it('should initialize with empty selected patients', () => {
      expect(component.selectedPatients()).toEqual([]);
    });

    it('should initialize loading state as false', () => {
      expect(component.loading()).toBe(false);
    });
  });

  describe('Table Configuration', () => {
    it('should have defined table columns', () => {
      const columns = component.columns();
      expect(columns.length).toBeGreaterThan(0);
    });

    it('should have Patient ID column', () => {
      const columns = component.columns();
      const idColumn = columns.find(col => col.key === 'id');
      expect(idColumn).toBeDefined();
      expect(idColumn?.label).toBe('Patient ID');
    });

    it('should have Full Name column', () => {
      const columns = component.columns();
      const nameColumn = columns.find(col => col.key === 'firstName');
      expect(nameColumn).toBeDefined();
      expect(nameColumn?.sortable).toBe(true);
    });
  });

  describe('Patient Selection', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should handle selection changes', () => {
      component.onSelectionChange([mockPatients[0]]);
      expect(component.selectedPatients()).toEqual([mockPatients[0]]);
    });

    it('should handle empty selection', () => {
      component.onSelectionChange([mockPatients[0]]);
      component.onSelectionChange([]);
      expect(component.selectedPatients()).toEqual([]);
    });

    it('should handle multiple selections', () => {
      component.onSelectionChange(mockPatients);
      expect(component.selectedPatients().length).toBe(2);
    });
  });
});
