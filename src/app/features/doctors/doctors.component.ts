import { Component, signal, computed, inject, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { DataTableComponent, TableColumn } from '../../shared/components/data-table/data-table.component';
import { DoctorService } from '../../core/services';
import { Doctor } from '../../core/models';
import { AddDoctorDialogComponent } from './dialogs/add-doctor-dialog/add-doctor-dialog.component';
import { DoctorDetailsDialogComponent } from './dialogs/doctor-details-dialog/doctor-details-dialog.component';

/**
 * Doctors Page Component
 * 
 * Displays a list of all doctors using the reusable DataTableComponent.
 * Features:
 * - Search doctors by name, specialization, or email
 * - Sort by any column
 * - Filter by various criteria
 * - Pagination
 * - Row selection for bulk actions
 * - View doctor details
 * - Add new doctor
 * - Export doctor data
 */
@Component({
  selector: 'app-doctors',
  imports: [
    DataTableComponent,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatChipsModule,
    MatTooltipModule,
    MatDialogModule,
  ],
  templateUrl: './doctors.component.html',
  styleUrl: './doctors.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DoctorsComponent implements OnInit {
  private readonly doctorService = inject(DoctorService);
  private readonly router = inject(Router);
  private readonly dialog = inject(MatDialog);

  // State management
  readonly doctors = signal<Doctor[]>([]);
  readonly loading = signal(false);
  readonly selectedDoctors = signal<Doctor[]>([]);

  // Table configuration
  readonly columns = signal<TableColumn<Doctor>[]>([
    {
      key: 'id',
      label: 'Doctor ID',
      width: '120px',
      sticky: 'start',
    },
    {
      key: 'firstName',
      label: 'Full Name',
      sortable: true,
      searchable: true,
      cellTemplate: (row) => `<strong>${row.firstName} ${row.lastName}</strong>`,
    },
    {
      key: 'specialization',
      label: 'Specialization',
      sortable: true,
      searchable: true,
      cellTemplate: (row) => `<span class="specialization-badge">${row.specialization}</span>`,
    },
    {
      key: 'experienceYears',
      label: 'Experience',
      width: '120px',
      align: 'center',
      sortable: true,
      cellTemplate: (row) => `${row.experienceYears} years`,
    },
    {
      key: 'email',
      label: 'Email',
      searchable: true,
      cellTemplate: (row) => `<a href="mailto:${row.email}" class="email-link">${row.email}</a>`,
    },
    {
      key: 'phone',
      label: 'Phone',
      width: '140px',
      searchable: true,
    },
    {
      key: 'consultationFee',
      label: 'Fee',
      width: '100px',
      align: 'right',
      sortable: true,
      cellTemplate: (row) => `$${row.consultationFee}`,
    },
    { 
      key: 'rating',
      label: 'Rating',
      width: '100px',
      align: 'center',
      sortable: true,
      cellTemplate: (row) => {
        const stars = '⭐'.repeat(Math.round(row.rating));
        return `<span class="rating">${stars} ${row.rating.toFixed(1)}</span>`;
      },
    },
    {
      key: 'joinedDate',
      label: 'Joined Date',
      width: '120px',
      sortable: true,
      cellTemplate: (row) => new Date(row.joinedDate).toLocaleDateString(),
    },
    {
      key: 'actions',
      label: 'Actions',
      width: '120px',
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
        </div>
      `,
    },
  ]);

  // Computed values
  readonly hasSelection = computed(() => this.selectedDoctors().length > 0);

  ngOnInit(): void {
    this.loadDoctors();
  }

  /**
   * Load all doctors from the service
   */
  loadDoctors(): void {
    this.loading.set(true);
    this.doctorService.getAll().subscribe({
      next: (doctors) => {
        this.doctors.set(doctors);
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error loading doctors:', error);
        this.loading.set(false);
      },
    });
  }

  /**
   * Handle row click - show doctor details
   */
  onRowClick(doctor: Doctor): void {
    // Check if click target is an action button
    const clickedElement = (event as any)?.target as HTMLElement;
    if (clickedElement?.closest('.action-btn')) {
      const button = clickedElement.closest('.action-btn') as HTMLElement;
      const doctorId = button.getAttribute('data-id');
      
      if (button.classList.contains('view-btn')) {
        this.viewDoctorDetails(doctorId!);
      } else if (button.classList.contains('edit-btn')) {
        this.editDoctor(doctorId!);
      }
      return;
    }

    // Default: view doctor details
    this.viewDoctorDetails(doctor.id);
  }

  /**
   * Handle selection change
   */
  onSelectionChange(selection: Doctor[]): void {
    this.selectedDoctors.set(selection);
  }

  /**
   * Open dialog to add new doctor
   */
  addDoctor(): void {
    const dialogRef = this.dialog.open(AddDoctorDialogComponent, {
      width: '800px',
      maxHeight: '90vh',
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.loadDoctors();
      }
    });
  }

  /**
   * View doctor details
   */
  viewDoctorDetails(doctorId: string): void {
    this.doctorService.getById(doctorId).subscribe({
      next: (doctor) => {
        if (doctor) {
          this.dialog.open(DoctorDetailsDialogComponent, {
            width: '900px',
            maxHeight: '90vh',
            data: { doctor },
          });
        }
      },
      error: (error) => {
        console.error('Error loading doctor details:', error);
      },
    });
  }

  /**
   * Edit doctor
   */
  editDoctor(doctorId: string): void {
    this.doctorService.getById(doctorId).subscribe({
      next: (doctor) => {
        if (doctor) {
          const dialogRef = this.dialog.open(AddDoctorDialogComponent, {
            width: '800px',
            maxHeight: '90vh',
            data: { doctor },
          });

          dialogRef.afterClosed().subscribe((result) => {
            if (result) {
              this.loadDoctors();
            }
          });
        }
      },
      error: (error) => {
        console.error('Error loading doctor for edit:', error);
      },
    });
  }

  /**
   * Delete selected doctors
   */
  deleteSelected(): void {
    if (confirm(`Are you sure you want to delete ${this.selectedDoctors().length} doctor(s)?`)) {
      // TODO: Implement batch delete
      console.log('Deleting doctors:', this.selectedDoctors());
      this.selectedDoctors.set([]);
      this.loadDoctors();
    }
  }

  /**
   * Export selected doctors to CSV
   */
  exportDoctors(): void {
    // TODO: Implement CSV export
    console.log('Exporting doctors:', this.selectedDoctors());
  }

  /**
   * Refresh the doctor list
   */
  refresh(): void {
    this.loadDoctors();
  }
}
