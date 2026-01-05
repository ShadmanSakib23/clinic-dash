import { Component, inject, signal, computed, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule, MAT_DATE_LOCALE } from '@angular/material/core';
import { MatChipsModule } from '@angular/material/chips';
import { ModalComponent } from '../../../../shared/components/modal/modal.component';
import { AppointmentService, PatientService, DoctorService } from '../../../../core/services';
import { AppointmentType, AppointmentStatus } from '../../../../core/models/appointment.model';
import { Patient } from '../../../../core/models/patient.model';
import { Doctor } from '../../../../core/models/doctor.model';

/**
 * Add/Edit Appointment Dialog Component
 * 
 * Form to create or edit appointments:
 * - Select patient
 * - Select doctor
 * - Choose date and time
 * - Set duration, type, and reason
 * - Add notes and symptoms
 */
@Component({
  selector: 'app-add-appointment-dialog',
  imports: [
    ReactiveFormsModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatChipsModule,
    ModalComponent,
  ],
  providers: [
    { provide: MAT_DATE_LOCALE, useValue: 'en-US' }
  ],
  templateUrl: './add-appointment-dialog.component.html',
  styleUrl: './add-appointment-dialog.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddAppointmentDialogComponent implements OnInit {
  private readonly dialogRef = inject(MatDialogRef<AddAppointmentDialogComponent>);
  private readonly data = inject<{ appointment?: any }>(MAT_DIALOG_DATA, { optional: true });
  private readonly fb = inject(FormBuilder);
  private readonly appointmentService = inject(AppointmentService);
  private readonly patientService = inject(PatientService);
  private readonly doctorService = inject(DoctorService);

  readonly patients = signal<Patient[]>([]);
  readonly doctors = signal<Doctor[]>([]);
  readonly loading = signal(false);
  readonly symptoms = signal<string[]>([]);
  readonly formValid = signal(false);

  readonly appointmentForm: FormGroup;
  readonly isEditMode = computed(() => !!this.data?.appointment);
  
  // Modal configuration
  readonly modalTitle = computed(() => 
    this.isEditMode() ? 'Edit Appointment' : 'Book New Appointment'
  );
  readonly modalIcon = computed(() => 
    this.isEditMode() ? 'edit' : 'event_available'
  );
  readonly primaryActionText = computed(() => 
    this.isEditMode() ? 'Update Appointment' : 'Book Appointment'
  );
  readonly isFormInvalid = computed(() => !this.formValid());

  readonly appointmentTypes: { value: AppointmentType; label: string }[] = [
    { value: 'consultation', label: 'Consultation' },
    { value: 'follow-up', label: 'Follow-up' },
    { value: 'emergency', label: 'Emergency' },
    { value: 'routine-checkup', label: 'Routine Checkup' },
    { value: 'vaccination', label: 'Vaccination' },
  ];

  readonly durations: number[] = [15, 30, 45, 60, 90, 120];

  constructor() {
    this.appointmentForm = this.fb.group({
      patientId: ['', Validators.required],
      doctorId: ['', Validators.required],
      date: [new Date(), Validators.required],
      time: ['', [Validators.required, Validators.pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)]],
      duration: [30, [Validators.required, Validators.min(15)]],
      type: ['consultation' as AppointmentType, Validators.required],
      reason: ['', [Validators.required, Validators.minLength(10)]],
      notes: [''],
      symptomInput: [''],
    });
  }

  ngOnInit(): void {
    this.loadPatients();
    this.loadDoctors();

    if (this.isEditMode()) {
      this.populateForm();
    }

    this.appointmentForm.statusChanges.subscribe(() => {
      this.formValid.set(this.appointmentForm.valid);
    });
    this.formValid.set(this.appointmentForm.valid);
  }

  /**
   * Load patients list
   */
  private loadPatients(): void {
    this.patientService.getAll().subscribe({
      next: (patients) => {
        this.patients.set(patients);
      },
      error: (err: Error) => {
        console.error('Error loading patients:', err);
      },
    });
  }

  /**
   * Load doctors list
   */
  private loadDoctors(): void {
    this.doctorService.getAll().subscribe({
      next: (doctors) => {
        this.doctors.set(doctors);
      },
      error: (err: Error) => {
        console.error('Error loading doctors:', err);
      },
    });
  }

  /**
   * Populate form with existing appointment data
   */
  private populateForm(): void {
    const appointment = this.data!.appointment;
    const dateTime = new Date(appointment.dateTime);
    
    this.appointmentForm.patchValue({
      patientId: appointment.patientId,
      doctorId: appointment.doctorId,
      date: dateTime,
      time: `${String(dateTime.getHours()).padStart(2, '0')}:${String(dateTime.getMinutes()).padStart(2, '0')}`,
      duration: appointment.duration,
      type: appointment.type,
      reason: appointment.reason,
      notes: appointment.notes || '',
    });

    if (appointment.symptoms) {
      this.symptoms.set([...appointment.symptoms]);
    }
  }

  /**
   * Add symptom chip
   */
  addSymptom(): void {
    const input = this.appointmentForm.get('symptomInput');
    const value = input?.value?.trim();

    if (value && !this.symptoms().includes(value)) {
      this.symptoms.set([...this.symptoms(), value]);
      input?.setValue('');
    }
  }

  /**
   * Remove symptom chip
   */
  removeSymptom(symptom: string): void {
    this.symptoms.set(this.symptoms().filter(s => s !== symptom));
  }

  /**
   * Get formatted time options for dropdown
   */
  getTimeOptions(): string[] {
    const options: string[] = [];
    for (let hour = 8; hour < 18; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const timeStr = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
        options.push(timeStr);
      }
    }
    return options;
  }

  /**
   * Filter patients by search term
   */
  filterPatients(searchTerm: string): Patient[] {
    if (!searchTerm) {
      return this.patients();
    }
    const term = searchTerm.toLowerCase();
    return this.patients().filter(p => 
      `${p.firstName} ${p.lastName}`.toLowerCase().includes(term) ||
      p.email.toLowerCase().includes(term)
    );
  }

  /**
   * Filter doctors by search term
   */
  filterDoctors(searchTerm: string): Doctor[] {
    if (!searchTerm) {
      return this.doctors();
    }
    const term = searchTerm.toLowerCase();
    return this.doctors().filter(d => 
      `${d.firstName} ${d.lastName}`.toLowerCase().includes(term) ||
      d.specialization.toLowerCase().includes(term)
    );
  }

  /**
   * Submit form (called by modal primary action)
   */
  onSubmit(): void {
    if (this.appointmentForm.invalid) {
      this.appointmentForm.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    const formValue = this.appointmentForm.value;

    // Combine date and time
    const [hours, minutes] = formValue.time.split(':').map(Number);
    const dateTime = new Date(formValue.date);
    dateTime.setHours(hours, minutes, 0, 0);

    const appointmentData = {
      patientId: formValue.patientId,
      doctorId: formValue.doctorId,
      dateTime,
      duration: formValue.duration,
      type: formValue.type,
      status: 'scheduled' as AppointmentStatus,
      reason: formValue.reason,
      notes: formValue.notes || undefined,
      symptoms: this.symptoms().length > 0 ? this.symptoms() : undefined,
    };

    if (this.isEditMode()) {
      // Update existing appointment
      this.appointmentService.update(this.data!.appointment.id, appointmentData).subscribe({
        next: () => {
          this.loading.set(false);
          this.dialogRef.close(true);
        },
        error: (err: Error) => {
          console.error('Error updating appointment:', err);
          this.loading.set(false);
        },
      });
    } else {
      // Create new appointment
      this.appointmentService.create(appointmentData).subscribe({
        next: () => {
          this.loading.set(false);
          this.dialogRef.close(true);
        },
        error: (err: Error) => {
          console.error('Error creating appointment:', err);
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
