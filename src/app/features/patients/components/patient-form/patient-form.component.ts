import {
  Component,
  ChangeDetectionStrategy,
  signal,
  computed,
  output,
  input,
  OnInit,
  effect,
  inject,
} from '@angular/core';
import { TitleCasePipe } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { Patient, Gender, BloodType } from '../../../../core/models';

export interface PatientFormData {
  firstName: string;
  lastName: string;
  dateOfBirth: Date;
  gender: Gender;
  email: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  emergencyContactName: string;
  emergencyContactRelationship: string;
  emergencyContactPhone: string;
  bloodType?: BloodType;
  allergies: string[];
  chronicConditions: string[];
}

/**
 * Reusable patient form component
 * Can be used for creating or editing patients
 */
@Component({
  selector: 'app-patient-form',
  imports: [
    TitleCasePipe,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatChipsModule,
    MatIconModule,
    MatButtonModule,
  ],
  templateUrl: './patient-form.component.html',
  styleUrl: './patient-form.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PatientFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);

  /** Patient data for editing (optional) */
  patient = input<Patient | null>(null);

  /** Form submit event */
  formSubmit = output<PatientFormData>();

  /** Form cancel event */
  formCancel = output<void>();

  /** Patient form */
  patientForm!: FormGroup;

  /** Form validity signal */
  isValid = signal<boolean>(false);

  /** Allergy input value */
  allergyInput = signal<string>('');

  /** Chronic condition input value */
  conditionInput = signal<string>('');

  /** Allergies list */
  allergies = signal<string[]>([]);

  /** Chronic conditions list */
  chronicConditions = signal<string[]>([]);

  /** Gender options */
  readonly genderOptions: Gender[] = ['male', 'female', 'other'];

  /** Blood type options */
  readonly bloodTypeOptions: BloodType[] = [
    'A+',
    'A-',
    'B+',
    'B-',
    'AB+',
    'AB-',
    'O+',
    'O-',
  ];

  /** Max date for date of birth (today) */
  maxDate = new Date();

  /** Min date for date of birth (150 years ago) */
  minDate = new Date(
    new Date().getFullYear() - 150,
    new Date().getMonth(),
    new Date().getDate()
  );

  constructor() {
    // Watch for patient input changes
    effect(() => {
      const patient = this.patient();
      if (patient && this.patientForm) {
        this.populateForm(patient);
      }
    });
  }

  ngOnInit(): void {
    this.initializeForm();
    this.watchFormChanges();
  }

  private initializeForm(): void {
    this.patientForm = this.fb.group({
      // Personal Information
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      dateOfBirth: ['', Validators.required],
      gender: ['', Validators.required],
      bloodType: [''],

      // Contact Information
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, Validators.pattern(/^\+?[\d\s\-()]+$/)]],

      // Address
      street: ['', Validators.required],
      city: ['', Validators.required],
      state: ['', Validators.required],
      zipCode: ['', Validators.required],
      country: ['USA', Validators.required],

      // Emergency Contact
      emergencyContactName: ['', Validators.required],
      emergencyContactRelationship: ['', Validators.required],
      emergencyContactPhone: [
        '',
        [Validators.required, Validators.pattern(/^\+?[\d\s\-()]+$/)],
      ],
    });

    // Populate form if editing
    const patient = this.patient();
    if (patient) {
      this.populateForm(patient);
    }
  }

  private watchFormChanges(): void {
    this.patientForm.statusChanges.subscribe(() => {
      this.isValid.set(this.patientForm.valid);
    });
  }

  private populateForm(patient: Patient): void {
    this.patientForm.patchValue({
      firstName: patient.firstName,
      lastName: patient.lastName,
      dateOfBirth: patient.dateOfBirth,
      gender: patient.gender,
      bloodType: patient.bloodType || '',
      email: patient.email,
      phone: patient.phone,
      street: patient.address.street,
      city: patient.address.city,
      state: patient.address.state,
      zipCode: patient.address.zipCode,
      country: patient.address.country,
      emergencyContactName: patient.emergencyContact.name,
      emergencyContactRelationship: patient.emergencyContact.relationship,
      emergencyContactPhone: patient.emergencyContact.phone,
    });

    this.allergies.set([...patient.allergies]);
    this.chronicConditions.set([...patient.chronicConditions]);
  }

  addAllergy(): void {
    const value = this.allergyInput().trim();
    if (value) {
      this.allergies.update((allergies) => [...allergies, value]);
      this.allergyInput.set('');
    }
  }

  removeAllergy(allergy: string): void {
    this.allergies.update((allergies) =>
      allergies.filter((a) => a !== allergy)
    );
  }

  addCondition(): void {
    const value = this.conditionInput().trim();
    if (value) {
      this.chronicConditions.update((conditions) => [...conditions, value]);
      this.conditionInput.set('');
    }
  }

  removeCondition(condition: string): void {
    this.chronicConditions.update((conditions) =>
      conditions.filter((c) => c !== condition)
    );
  }

  onSubmit(): void {
    if (this.patientForm.valid) {
      const formValue = this.patientForm.value;
      const formData: PatientFormData = {
        ...formValue,
        allergies: this.allergies(),
        chronicConditions: this.chronicConditions(),
      };
      this.formSubmit.emit(formData);
    }
  }

  onCancel(): void {
    this.formCancel.emit();
  }

  /** Get error message for a form control */
  getErrorMessage(controlName: string): string {
    const control = this.patientForm.get(controlName);
    if (!control || !control.errors) return '';

    if (control.errors['required']) return 'This field is required';
    if (control.errors['email']) return 'Invalid email format';
    if (control.errors['minlength'])
      return `Minimum ${control.errors['minlength'].requiredLength} characters`;
    if (control.errors['pattern']) return 'Invalid format';

    return 'Invalid input';
  }
}
