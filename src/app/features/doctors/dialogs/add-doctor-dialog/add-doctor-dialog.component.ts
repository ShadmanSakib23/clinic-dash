import { Component, inject, signal, computed, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule, MAT_DATE_LOCALE } from '@angular/material/core';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { TitleCasePipe } from '@angular/common';
import { Doctor, DayOfWeek, TimeSlot, Education } from '../../../../core/models';
import { DoctorService } from '../../../../core/services';
import { ModalComponent } from '../../../../shared/components/modal/modal.component';

interface DialogData {
  doctor?: Doctor;
}

/**
 * Add/Edit Doctor Dialog Component
 * 
 * Form to create or edit doctors:
 * - Personal information (name, gender, date of birth)
 * - Contact information (email, phone)
 * - Professional details (license, specialization, experience)
 * - Consultation fee and rating
 * - Availability status
 */
@Component({
  selector: 'app-add-doctor-dialog',
  imports: [
    ReactiveFormsModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatCheckboxModule,
    MatButtonModule,
    MatChipsModule,
    TitleCasePipe,
    ModalComponent,
  ],
  providers: [
    { provide: MAT_DATE_LOCALE, useValue: 'en-US' }
  ],
  templateUrl: './add-doctor-dialog.component.html',
  styleUrl: './add-doctor-dialog.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddDoctorDialogComponent implements OnInit {
  readonly dialogRef = inject(MatDialogRef<AddDoctorDialogComponent>);
  readonly data = inject<DialogData>(MAT_DIALOG_DATA, { optional: true });
  private readonly fb = inject(FormBuilder);
  private readonly doctorService = inject(DoctorService);

  readonly loading = signal(false);
  readonly formValid = signal(false);
  readonly education = signal<Education[]>([]);
  readonly availableSlots = signal<TimeSlot[]>([]);
  readonly currentYear = new Date().getFullYear();

  readonly doctorForm: FormGroup;
  readonly isEditMode = computed(() => !!this.data?.doctor);

  // Modal configuration
  readonly modalTitle = computed(() => 
    this.isEditMode() ? 'Edit Doctor' : 'Add New Doctor'
  );
  readonly modalIcon = computed(() => 
    this.isEditMode() ? 'edit' : 'person_add'
  );
  readonly primaryActionText = computed(() => 
    this.isEditMode() ? 'Update Doctor' : 'Add Doctor'
  );
  readonly isFormInvalid = computed(() => !this.formValid());

  readonly specializations = [
    'Cardiology',
    'Dermatology',
    'Endocrinology',
    'Gastroenterology',
    'General Practice',
    'Hematology',
    'Nephrology',
    'Neurology',
    'Obstetrics & Gynecology',
    'Oncology',
    'Ophthalmology',
    'Orthopedics',
    'Otolaryngology',
    'Pediatrics',
    'Psychiatry',
    'Pulmonology',
    'Radiology',
    'Surgery',
    'Urology',
  ];

  readonly genders: { value: 'male' | 'female' | 'other'; label: string }[] = [
    { value: 'male', label: 'Male' },
    { value: 'female', label: 'Female' },
    { value: 'other', label: 'Other' },
  ];

  readonly daysOfWeek: { value: DayOfWeek; label: string }[] = [
    { value: 'monday', label: 'Monday' },
    { value: 'tuesday', label: 'Tuesday' },
    { value: 'wednesday', label: 'Wednesday' },
    { value: 'thursday', label: 'Thursday' },
    { value: 'friday', label: 'Friday' },
    { value: 'saturday', label: 'Saturday' },
    { value: 'sunday', label: 'Sunday' },
  ];

  constructor() {
    this.doctorForm = this.fb.group 
    ({
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, Validators.pattern(/^[\+]?[(]?[0-9]{1,4}[)]?[-\s\.]?[(]?[0-9]{1,4}[)]?[-\s\.]?[0-9]{1,4}[-\s\.]?[0-9]{1,9}$/)]],
      licenseNumber: ['', [Validators.required, Validators.minLength(5)]],
      specialization: ['', Validators.required],
      experienceYears: [0, [Validators.required, Validators.min(0), Validators.max(50)]],
      consultationFee: [0, [Validators.required, Validators.min(0)]],
      bio: [''],
      // Education form fields
      degree: [''],
      institution: [''],
      year: [''],
      // Time slot form fields
      dayOfWeek: [''],
      startTime: [''],
      endTime: [''],
    });
  }

  ngOnInit(): void {
    if (this.isEditMode()) {
      this.populateForm();
    }

    // Track form validity changes
    this.doctorForm.statusChanges.subscribe(() => {
      this.formValid.set(this.doctorForm.valid);
    });

    // Set initial validity
    this.formValid.set(this.doctorForm.valid);
  }

  /**
   * Populate form with existing doctor data
   */
  private populateForm(): void {
    const doctor = this.data!.doctor!;
    
    this.doctorForm.patchValue({
      firstName: doctor.firstName,
      lastName: doctor.lastName,
      email: doctor.email,
      phone: doctor.phone,
      licenseNumber: doctor.licenseNumber,
      specialization: doctor.specialization,
      experienceYears: doctor.experienceYears,
      consultationFee: doctor.consultationFee,
      bio: doctor.bio || '',
    });

    // Populate education and available slots
    if (doctor.education) {
      this.education.set([...doctor.education]);
    }
    if (doctor.availableSlots) {
      this.availableSlots.set([...doctor.availableSlots]);
    }
  }

  /**
   * Add education entry
   */
  addEducation(): void {
    const degree = this.doctorForm.get('degree')?.value?.trim();
    const institution = this.doctorForm.get('institution')?.value?.trim();
    const year = this.doctorForm.get('year')?.value;

    if (degree && institution && year) {
      this.education.set([...this.education(), { degree, institution, year: Number(year) }]);
      this.doctorForm.patchValue({ degree: '', institution: '', year: '' });
    }
  }

  /**
   * Remove education entry
   */
  removeEducation(index: number): void {
    this.education.set(this.education().filter((_, i) => i !== index));
  }

  /**
   * Add time slot
   */
  addTimeSlot(): void {
    const dayOfWeek = this.doctorForm.get('dayOfWeek')?.value as DayOfWeek;
    const startTime = this.doctorForm.get('startTime')?.value;
    const endTime = this.doctorForm.get('endTime')?.value;

    if (dayOfWeek && startTime && endTime) {
      const timeSlot: TimeSlot = { dayOfWeek, startTime, endTime };
      this.availableSlots.set([...this.availableSlots(), timeSlot]);
      this.doctorForm.patchValue({ dayOfWeek: '', startTime: '', endTime: '' });
    }
  }

  /**
   * Remove time slot
   */
  removeTimeSlot(index: number): void {
    this.availableSlots.set(this.availableSlots().filter((_, i) => i !== index));
  }

  /**
   * Submit form (called by modal primary action)
   */
  onSubmit(): void {
    if (this.doctorForm.invalid) {
      this.doctorForm.markAllAsTouched();
      return;
    }

    // Validate that we have at least one education entry
    if (this.education().length === 0) {
      alert('Please add at least one education entry');
      return;
    }

    // Validate that we have at least one time slot
    if (this.availableSlots().length === 0) {
      alert('Please add at least one available time slot');
      return;
    }

    this.loading.set(true);
    const formValue = this.doctorForm.value;

    const doctorData = {
      firstName: formValue.firstName,
      lastName: formValue.lastName,
      email: formValue.email,
      phone: formValue.phone,
      licenseNumber: formValue.licenseNumber,
      specialization: formValue.specialization,
      experienceYears: formValue.experienceYears,
      consultationFee: formValue.consultationFee,
      education: this.education(),
      availableSlots: this.availableSlots(),
      bio: formValue.bio || undefined,
      avatar: undefined,
    };

    if (this.isEditMode()) {
      // Update existing doctor
      this.doctorService.update(this.data!.doctor!.id, doctorData).subscribe({
        next: () => {
          this.loading.set(false);
          this.dialogRef.close(true);
        },
        error: (err: Error) => {
          console.error('Error updating doctor:', err);
          this.loading.set(false);
        },
      });
    } else {
      // Create new doctor
      this.doctorService.create(doctorData).subscribe({
        next: () => {
          this.loading.set(false);
          this.dialogRef.close(true);
        },
        error: (err: Error) => {
          console.error('Error creating doctor:', err);
          this.loading.set(false);
        },
      });
    }
  }

  /**
   * Close dialog (called by modal close/secondary action)
   */
  onClose(): void {
    this.dialogRef.close();
  }
}
