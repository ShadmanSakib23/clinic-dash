import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatChipsModule } from '@angular/material/chips';
import { MatTabsModule } from '@angular/material/tabs';
import { DatePipe, TitleCasePipe } from '@angular/common';
import { ModalComponent } from '../../../../shared/components/modal/modal.component';
import { Patient } from '../../../../core/models';

/**
 * Dialog component for viewing patient details
 */
@Component({
  selector: 'app-patient-details-dialog',
  imports: [
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
    MatChipsModule,
    MatTabsModule,
    DatePipe,
    TitleCasePipe,
    ModalComponent,
  ],
  templateUrl: './patient-details-dialog.component.html',
  styleUrl: './patient-details-dialog.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PatientDetailsDialogComponent {
  private readonly dialogRef = inject(MatDialogRef<PatientDetailsDialogComponent>);
  readonly patient = inject<Patient>(MAT_DIALOG_DATA);

  get patientFullName(): string {
    return `${this.patient.firstName} ${this.patient.lastName}`;
  }

  calculateAge(dateOfBirth: Date): number {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  }

  close(): void {
    this.dialogRef.close();
  }

  edit(): void {
    this.dialogRef.close({ action: 'edit', patient: this.patient });
  }

  delete(): void {
    this.dialogRef.close({ action: 'delete', patient: this.patient });
  }
}
