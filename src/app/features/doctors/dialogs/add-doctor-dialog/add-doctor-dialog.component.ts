import { Component, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Doctor } from '../../../../core/models';
import { ModalComponent } from '../../../../shared/components/modal/modal.component';

interface DialogData {
  doctor?: Doctor;
}

@Component({
  selector: 'app-add-doctor-dialog',
  imports: [
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    ModalComponent,
  ],
  template: `
    <app-modal
      [title]="isEditMode ? 'Edit Doctor' : 'Add New Doctor'"
      [subtitle]="isEditMode ? 'Update doctor information' : 'Enter doctor details'"
      [icon]="'medical_services'"
      [showClose]="true"
      [showPrimaryAction]="true"
      [primaryActionText]="isEditMode ? 'Update' : 'Create'"
      [primaryActionColor]="'primary'"
      (primaryAction)="save()"
      (closed)="close()">
      
      <div style="padding: 24px; text-align: center;">
        <mat-icon style="font-size: 64px; width: 64px; height: 64px; color: #999;">construction</mat-icon>
        <h3 style="color: #666; margin-top: 16px;">Doctor Form Coming Soon</h3>
        <p style="color: #999;">
          This dialog will contain a comprehensive form for {{ isEditMode ? 'editing' : 'adding' }} doctor information.
        </p>
      </div>
    </app-modal>
  `,
  styles: [`
    :host {
      display: block;
    }
  `],
})
export class AddDoctorDialogComponent {
  private readonly dialogRef = inject(MatDialogRef<AddDoctorDialogComponent>);
  readonly data = inject<DialogData>(MAT_DIALOG_DATA, { optional: true });

  readonly isEditMode = !!this.data?.doctor;

  close(): void {
    this.dialogRef.close();
  }

  save(): void {
    // TODO: Implement form submission
    this.dialogRef.close({ success: true });
  }
}
