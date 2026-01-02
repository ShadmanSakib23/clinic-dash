import { Component, signal, computed, inject, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { Router } from '@angular/router';
import { DatePipe } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatNativeDateModule, MAT_DATE_LOCALE } from '@angular/material/core';
import { DataTableComponent, TableColumn } from '../../shared/components/data-table/data-table.component';
import { AppointmentService, PatientService, DoctorService } from '../../core/services';
import { AppointmentWithDetails, AppointmentStatus } from '../../core/models/appointment.model';
import { AddAppointmentDialogComponent } from './dialogs/add-appointment-dialog/add-appointment-dialog.component';
import { AppointmentDetailsDialogComponent } from './dialogs/appointment-details-dialog/appointment-details-dialog.component';

/**
 * Appointments Page Component
 * 
 * Displays a list of all appointments using the reusable DataTableComponent.
 * Features:
 * - Search appointments by patient, doctor, or reason
 * - Sort by any column
 * - Filter by status, type, date
 * - Pagination
 * - Row selection for bulk actions
 * - View appointment details
 * - Create new appointment
 * - Update appointment status
 * - Cancel appointments
 */
@Component({
  selector: 'app-appointments',
  imports: [
    DataTableComponent,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatChipsModule,
    MatTooltipModule,
    MatDialogModule,
    MatNativeDateModule,
  ],
  providers: [
    { provide: MAT_DATE_LOCALE, useValue: 'en-US' }
  ],
  templateUrl: './appointments.component.html',
  styleUrl: './appointments.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppointmentsComponent implements OnInit {
  private readonly appointmentService = inject(AppointmentService);
  private readonly patientService = inject(PatientService);
  private readonly doctorService = inject(DoctorService);
  private readonly router = inject(Router);
  private readonly dialog = inject(MatDialog);

  // State management
  readonly appointments = signal<AppointmentWithDetails[]>([]);
  readonly loading = signal(false);
  readonly selectedAppointments = signal<AppointmentWithDetails[]>([]);

  // Table configuration
  readonly columns = signal<TableColumn<AppointmentWithDetails>[]>([
    {
      key: 'id',
      label: 'Appointment ID',
      width: '140px',
      sticky: 'start',
    },
    {
      key: 'patientName',
      label: 'Patient',
      sortable: true,
      searchable: true,
      cellTemplate: (row) => `<strong>${row.patientName}</strong>`,
    },
    {
      key: 'doctorName',
      label: 'Doctor',
      sortable: true,
      searchable: true,
      cellTemplate: (row) => `
        <div>
          <strong>${row.doctorName}</strong>
          <div style="font-size: 12px; color: #666;">${row.doctorSpecialization}</div>
        </div>
      `,
    },
    {
      key: 'dateTime',
      label: 'Date & Time',
      sortable: true,
      width: '180px',
      cellTemplate: (row) => {
        const date = new Date(row.dateTime);
        return `
          <div>
            <div><strong>${date.toLocaleDateString()}</strong></div>
            <div style="font-size: 12px; color: #666;">${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
          </div>
        `;
      },
    },
    {
      key: 'duration',
      label: 'Duration',
      width: '100px',
      align: 'center',
      cellTemplate: (row) => `${row.duration} min`,
    },
    {
      key: 'type',
      label: 'Type',
      width: '140px',
      sortable: true,
      cellTemplate: (row) => this.getTypeChip(row.type),
    },
    {
      key: 'status',
      label: 'Status',
      width: '120px',
      sortable: true,
      cellTemplate: (row) => this.getStatusChip(row.status),
    },
    {
      key: 'reason',
      label: 'Reason',
      searchable: true,
      cellTemplate: (row) => `<span class="reason-text">${row.reason}</span>`,
    },
    {
      key: 'actions',
      label: 'Actions',
      width: '140px',
      align: 'center',
      sortable: false,
      searchable: false,
      sticky: 'end',
      cellTemplate: (row) => `
        <div class="action-buttons">
          <button class="action-btn view-btn" data-id="${row.id}" title="View Details">
            <span class="material-icons">visibility</span>
          </button>
          <button class="action-btn edit-btn" data-id="${row.id}" title="Edit">
            <span class="material-icons">edit</span>
          </button>
          <button class="action-btn cancel-btn" data-id="${row.id}" title="Cancel" 
                  ${row.status === 'cancelled' || row.status === 'completed' ? 'disabled' : ''}>
            <span class="material-icons">cancel</span>
          </button>
        </div>
      `,
    },
  ]);

  // Computed values
  readonly hasSelection = computed(() => this.selectedAppointments().length > 0);

  ngOnInit(): void {
    this.loadAppointments();
  }

  /**
   * Load all appointments from the service
   */
  loadAppointments(): void {
    this.loading.set(true);
    this.appointmentService.getAllWithDetails().subscribe({
      next: (appointments) => {
        this.appointments.set(appointments);
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error loading appointments:', error);
        this.loading.set(false);
      },
    });
  }

  /**
   * Get status chip HTML
   */
  private getStatusChip(status: AppointmentStatus): string {
    const statusConfig: Record<AppointmentStatus, { class: string; label: string }> = {
      scheduled: { class: 'status-scheduled', label: 'Scheduled' },
      confirmed: { class: 'status-confirmed', label: 'Confirmed' },
      'in-progress': { class: 'status-in-progress', label: 'In Progress' },
      completed: { class: 'status-completed', label: 'Completed' },
      cancelled: { class: 'status-cancelled', label: 'Cancelled' },
      'no-show': { class: 'status-no-show', label: 'No Show' },
    };

    const config = statusConfig[status];
    return `<span class="status-chip ${config.class}">${config.label}</span>`;
  }

  /**
   * Get type chip HTML
   */
  private getTypeChip(type: string): string {
    const formatted = type.split('-').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
    return `<span class="type-chip">${formatted}</span>`;
  }

  /**
   * Handle row click - show appointment details
   */
  onRowClick(appointment: AppointmentWithDetails): void {
    // Check if click target is an action button
    const clickedElement = (event as any)?.target as HTMLElement;
    if (clickedElement?.closest('.action-btn')) {
      const button = clickedElement.closest('.action-btn') as HTMLElement;
      const appointmentId = button.getAttribute('data-id');
      
      if (button.classList.contains('view-btn')) {
        this.viewAppointmentDetails(appointmentId!);
      } else if (button.classList.contains('edit-btn')) {
        this.editAppointment(appointmentId!);
      } else if (button.classList.contains('cancel-btn')) {
        this.cancelAppointment(appointmentId!);
      }
      return;
    }

    // Default: view appointment details
    this.viewAppointmentDetails(appointment.id);
  }

  /**
   * Handle selection change
   */
  onSelectionChange(selection: AppointmentWithDetails[]): void {
    this.selectedAppointments.set(selection);
  }

  /**
   * Open dialog to create new appointment
   */
  createAppointment(): void {
    const dialogRef = this.dialog.open(AddAppointmentDialogComponent, {
      width: '700px',
      maxHeight: '90vh',
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.loadAppointments();
      }
    });
  }

  /**
   * View appointment details
   */
  viewAppointmentDetails(appointmentId: string): void {
    const appointment = this.appointments().find(a => a.id === appointmentId);
    if (appointment) {
      this.dialog.open(AppointmentDetailsDialogComponent, {
        width: '800px',
        maxHeight: '90vh',
        data: { appointment },
      });
    }
  }

  /**
   * Edit appointment
   */
  editAppointment(appointmentId: string): void {
    const appointment = this.appointments().find(a => a.id === appointmentId);
    if (appointment) {
      const dialogRef = this.dialog.open(AddAppointmentDialogComponent, {
        width: '700px',
        maxHeight: '90vh',
        data: { appointment },
      });

      dialogRef.afterClosed().subscribe((result) => {
        if (result) {
          this.loadAppointments();
        }
      });
    }
  }

  /**
   * Cancel appointment
   */
  cancelAppointment(appointmentId: string): void {
    const appointment = this.appointments().find(a => a.id === appointmentId);
    if (appointment && confirm(`Are you sure you want to cancel the appointment with ${appointment.patientName}?`)) {
      this.appointmentService.cancel(appointmentId).subscribe({
        next: () => {
          this.loadAppointments();
        },
        error: (error: Error) => {
          console.error('Error cancelling appointment:', error);
        },
      });
    }
  }

  /**
   * Delete selected appointments
   */
  deleteSelected(): void {
    if (confirm(`Are you sure you want to delete ${this.selectedAppointments().length} appointment(s)?`)) {
      // TODO: Implement batch delete
      console.log('Deleting appointments:', this.selectedAppointments());
      this.selectedAppointments.set([]);
      this.loadAppointments();
    }
  }

  /**
   * Export selected appointments to CSV
   */
  exportAppointments(): void {
    // TODO: Implement CSV export
    console.log('Exporting appointments:', this.selectedAppointments());
  }

  /**
   * Refresh the appointment list
   */
  refresh(): void {
    this.loadAppointments();
  }
}
