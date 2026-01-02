import { Component, inject, signal, computed, ChangeDetectionStrategy } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { DatePipe } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { ModalComponent } from '../../../../shared/components/modal/modal.component';
import { AppointmentService } from '../../../../core/services';
import { AppointmentWithDetails } from '../../../../core/models/appointment.model';

/**
 * Appointment Details Dialog Component
 * 
 * Displays comprehensive appointment information in a tabbed interface:
 * - Appointment Info: Date, time, status, type, reason, notes, symptoms
 * - Patient Info: Patient details from the appointment
 * - Doctor Info: Doctor details and specialization
 */
@Component({
  selector: 'app-appointment-details-dialog',
  imports: [
    DatePipe,
    MatIconModule,
    MatTabsModule,
    MatChipsModule,
    MatDividerModule,
    ModalComponent,
  ],
  templateUrl: './appointment-details-dialog.component.html',
  styleUrl: './appointment-details-dialog.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppointmentDetailsDialogComponent {
  private readonly dialogRef = inject(MatDialogRef<AppointmentDetailsDialogComponent>);
  private readonly data = inject<{ appointment: AppointmentWithDetails }>(MAT_DIALOG_DATA);
  private readonly appointmentService = inject(AppointmentService);

  readonly appointment = signal<AppointmentWithDetails>(this.data.appointment);
  readonly loading = signal(false);

  // Computed values for modal inputs
  readonly appointmentTitle = computed(() => {
    const apt = this.appointment();
    return `Appointment ${apt.id}`;
  });

  readonly appointmentSubtitle = computed(() => {
    const apt = this.appointment();
    const date = new Date(apt.dateTime);
    return `${date.toLocaleDateString()} at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  });

  readonly primaryActionText = computed(() => {
    const status = this.appointment().status;
    if (status === 'confirmed' || status === 'in-progress') {
      return 'Mark Complete';
    }
    return 'Edit';
  });

  readonly showSecondaryAction = computed(() => this.canCancel());

  /**
   * Get status display configuration
   */
  getStatusConfig(status: string): { label: string; class: string } {
    const configs: Record<string, { label: string; class: string }> = {
      scheduled: { label: 'Scheduled', class: 'status-scheduled' },
      confirmed: { label: 'Confirmed', class: 'status-confirmed' },
      'in-progress': { label: 'In Progress', class: 'status-in-progress' },
      completed: { label: 'Completed', class: 'status-completed' },
      cancelled: { label: 'Cancelled', class: 'status-cancelled' },
      'no-show': { label: 'No Show', class: 'status-no-show' },
    };
    return configs[status] || { label: status, class: '' };
  }

  /**
   * Get formatted appointment type
   */
  getFormattedType(type: string): string {
    return type.split('-').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  }

  /**
   * Check if appointment can be cancelled
   */
  canCancel(): boolean {
    const status = this.appointment().status;
    return status !== 'cancelled' && status !== 'completed' && status !== 'no-show';
  }

  /**
   * Check if appointment can be completed
   */
  canComplete(): boolean {
    const status = this.appointment().status;
    return status === 'confirmed' || status === 'in-progress';
  }

  /**
   * Handle primary action (Complete or Edit)
   */
  onPrimaryAction(): void {
    const status = this.appointment().status;
    if (status === 'confirmed' || status === 'in-progress') {
      this.completeAppointment();
    } else {
      this.editAppointment();
    }
  }

  /**
   * Handle secondary action (Cancel)
   */
  onSecondaryAction(): void {
    this.cancelAppointment();
  }

  /**
   * Cancel appointment
   */
  private cancelAppointment(): void {
    if (!confirm('Are you sure you want to cancel this appointment?')) {
      return;
    }

    this.loading.set(true);
    this.appointmentService.cancel(this.appointment().id).subscribe({
      next: (updated) => {
        this.appointment.set({ ...this.appointment(), ...updated });
        this.loading.set(false);
      },
      error: (err: Error) => {
        console.error('Error cancelling appointment:', err);
        this.loading.set(false);
      },
    });
  }

  /**
   * Complete appointment
   */
  private completeAppointment(): void {
    this.loading.set(true);
    this.appointmentService.complete(this.appointment().id).subscribe({
      next: (updated) => {
        this.appointment.set({ ...this.appointment(), ...updated });
        this.loading.set(false);
      },
      error: (err: Error) => {
        console.error('Error completing appointment:', err);
        this.loading.set(false);
      },
    });
  }

  /**
   * Edit appointment
   */
  private editAppointment(): void {
    this.dialogRef.close({ action: 'edit', appointment: this.appointment() });
  }

  /**
   * Close dialog
   */
  close(): void {
    this.dialogRef.close();
  }
}
