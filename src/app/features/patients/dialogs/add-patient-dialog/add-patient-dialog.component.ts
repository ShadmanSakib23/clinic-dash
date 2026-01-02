import { Component, ChangeDetectionStrategy, signal, inject, viewChild } from '@angular/core';
import { MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { ModalComponent } from '../../../../shared/components/modal/modal.component';
import { PatientFormComponent, PatientFormData } from '../../components/patient-form/patient-form.component';
import { PatientService } from '../../../../core/services';
import { Patient } from '../../../../core/models';

/**
 * Dialog component for adding a new patient
 */
@Component({
  selector: 'app-add-patient-dialog',
  imports: [
    MatDialogModule,
    ModalComponent,
    PatientFormComponent,
  ],
  template: `
    <app-modal
      [title]="'Add New Patient'"
      [subtitle]="'Fill in the patient information below'"
      [icon]="'person_add'"
      [loading]="loading()"
      [primaryActionText]="'Add Patient'"
      [secondaryActionText]="'Cancel'"
      [primaryActionDisabled]="!isFormValid()"
      (primaryAction)="onSubmit()"
      (secondaryAction)="onCancel()"
      (closed)="onCancel()"
    >
      <app-patient-form />
    </app-modal>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddPatientDialogComponent {
  private readonly dialogRef = inject(MatDialogRef<AddPatientDialogComponent>);
  private readonly patientService = inject(PatientService);
  
  readonly patientForm = viewChild.required(PatientFormComponent);
  
  loading = signal(false);

  isFormValid(): boolean {
    const form = this.patientForm();
    return form ? form.isValid() : false;
  }

  onSubmit(): void {
    const form = this.patientForm();
    if (!form || !form.patientForm.valid) return;

    this.loading.set(true);

    const formValue = form.patientForm.value;
    const patientData: Omit<Patient, 'id' | 'registeredDate'> = {
      firstName: formValue.firstName,
      lastName: formValue.lastName,
      dateOfBirth: formValue.dateOfBirth,
      gender: formValue.gender,
      email: formValue.email,
      phone: formValue.phone,
      address: {
        street: formValue.street,
        city: formValue.city,
        state: formValue.state,
        zipCode: formValue.zipCode,
        country: formValue.country,
      },
      emergencyContact: {
        name: formValue.emergencyContactName,
        relationship: formValue.emergencyContactRelationship,
        phone: formValue.emergencyContactPhone,
      },
      bloodType: formValue.bloodType || undefined,
      allergies: form.allergies(),
      chronicConditions: form.chronicConditions(),
    };

    this.patientService.create(patientData).subscribe({
      next: (patient) => {
        this.loading.set(false);
        this.dialogRef.close(patient);
      },
      error: (error) => {
        console.error('Error creating patient:', error);
        this.loading.set(false);
        // TODO: Show error message
      },
    });
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
