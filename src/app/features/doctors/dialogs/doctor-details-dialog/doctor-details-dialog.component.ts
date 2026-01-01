import { Component, inject, computed } from '@angular/core';
import { DatePipe } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatTabsModule } from '@angular/material/tabs';
import { MatDividerModule } from '@angular/material/divider';
import { Doctor } from '../../../../core/models';
import { ModalComponent } from '../../../../shared/components/modal/modal.component';

interface DialogData {
  doctor: Doctor;
}

@Component({
  selector: 'app-doctor-details-dialog',
  imports: [
    DatePipe,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatTabsModule,
    MatDividerModule,
    ModalComponent,
  ],
  templateUrl: './doctor-details-dialog.component.html',
  styleUrl: './doctor-details-dialog.component.scss',
})
export class DoctorDetailsDialogComponent {
  private readonly dialogRef = inject(MatDialogRef<DoctorDetailsDialogComponent>);
  readonly data = inject<DialogData>(MAT_DIALOG_DATA);

  readonly doctor = this.data.doctor;
  readonly doctorFullName = computed(() => `Dr. ${this.doctor.firstName} ${this.doctor.lastName}`);

  close(): void {
    this.dialogRef.close();
  }

  edit(): void {
    this.dialogRef.close({ action: 'edit', doctor: this.doctor });
  }

  delete(): void {
    if (confirm(`Are you sure you want to delete Dr. ${this.doctor.firstName} ${this.doctor.lastName}?`)) {
      this.dialogRef.close({ action: 'delete', doctor: this.doctor });
    }
  }

  getDayLabel(day: string): string {
    return day.charAt(0).toUpperCase() + day.slice(1);
  }
}
