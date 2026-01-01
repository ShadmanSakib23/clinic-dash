import { Component, signal, computed, inject, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { DataTableComponent, TableColumn } from '../../shared/components/data-table/data-table.component';
import { PatientService } from '../../core/services';
import { Patient } from '../../core/models';
import { AddPatientDialogComponent } from './dialogs/add-patient-dialog/add-patient-dialog.component';
import { PatientDetailsDialogComponent } from './dialogs/patient-details-dialog/patient-details-dialog.component';

/**
 * Patients Page Component
 * 
 * Displays a list of all patients using the reusable DataTableComponent.
 * Features:
 * - Search patients by name, email, or phone
 * - Sort by any column
 * - Filter by various criteria
 * - Pagination
 * - Row selection for bulk actions
 * - View patient details
 * - Add new patient
 * - Export patient data
 */
@Component({
  selector: 'app-patients',
  imports: [
    DataTableComponent,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatChipsModule,
    MatTooltipModule,
    MatDialogModule,
  ],
  templateUrl: './patients.component.html',
  styleUrl: './patients.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PatientsComponent implements OnInit {
  private readonly patientService = inject(PatientService);
  private readonly router = inject(Router);
  private readonly dialog = inject(MatDialog);

  // State management
  readonly patients = signal<Patient[]>([]);
  readonly loading = signal(false);
  readonly selectedPatients = signal<Patient[]>([]);

  // Table configuration
  readonly columns = signal<TableColumn<Patient>[]>([
    {
      key: 'id',
      label: 'Patient ID',
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
      key: 'dateOfBirth',
      label: 'Age',
      width: '80px',
      align: 'center',
      cellTemplate: (row) => {
        const age = this.calculateAge(row.dateOfBirth);
        return `${age}`;
      },
    },
    {
      key: 'gender',
      label: 'Gender',
      width: '100px',
      align: 'center',
      cellTemplate: (row) => {
        const genderIcons = { male: '♂', female: '♀', other: '⚧' };
        const icon = genderIcons[row.gender] || '';
        return `<span class="gender-${row.gender}">${icon} ${row.gender}</span>`;
      },
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
      key: 'address.city',
      label: 'City',
      width: '120px',
      searchable: true,
    },
    {
      key: 'bloodType',
      label: 'Blood Type',
      width: '100px',
      align: 'center',
      cellTemplate: (row) => row.bloodType 
        ? `<span class="blood-type">${row.bloodType}</span>` 
        : '-',
    },
    {
      key: 'lastVisit',
      label: 'Last Visit',
      width: '120px',
      cellTemplate: (row) => row.lastVisit 
        ? this.formatDate(row.lastVisit)
        : '<span class="no-visit">No visits</span>',
    },
    {
      key: 'actions',
      label: 'Actions',
      width: '120px',
      align: 'center',
      sticky: 'end',
      sortable: false,
      searchable: false,
      cellTemplate: (row) => `
        <div class="action-buttons">
          <button class="action-btn view-btn" data-action="view" data-id="${row.id}" title="View Details">
            <span class="material-icons">visibility</span>
          </button>
          <button class="action-btn edit-btn" data-action="edit" data-id="${row.id}" title="Edit Patient">
            <span class="material-icons">edit</span>
          </button>
        </div>
      `,
    },
  ]);

  // Computed values
  readonly totalPatients = computed(() => this.patients().length);
  readonly hasSelection = computed(() => this.selectedPatients().length > 0);

  ngOnInit(): void {
    console.log('PatientsComponent initialized');
    this.loadPatients();
  }

  /**
   * Load all patients from the service
   */
  loadPatients(): void {
    this.loading.set(true);
    this.patientService.getAll().subscribe({
      next: (patients) => {
        console.log('Loaded patients:', patients);
        this.patients.set(patients);
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error loading patients:', error);
        this.loading.set(false);
      },
    });
  }

  /**
   * Handle row click - navigate to patient details
   */
  onRowClick(patient: Patient): void {
    // Check if click was on action button
    const target = event?.target as HTMLElement;
    if (target?.closest('.action-btn')) {
      const actionBtn = target.closest('.action-btn') as HTMLElement;
      const action = actionBtn.getAttribute('data-action');
      const id = actionBtn.getAttribute('data-id');
      
      if (action === 'view') {
        this.viewPatient(id!);
      } else if (action === 'edit') {
        this.editPatient(id!);
      }
      return;
    }

    // Regular row click - view details
    this.viewPatient(patient.id);
  }

  /**
   * Handle selection change
   */
  onSelectionChange(selection: Patient[]): void {
    this.selectedPatients.set(selection);
  }

  /**
   * View patient details
   */
  viewPatient(id: string): void {
    const patient = this.patients().find(p => p.id === id);
    if (!patient) {
      console.error('Patient not found:', id);
      return;
    }

    const dialogRef = this.dialog.open(PatientDetailsDialogComponent, {
      width: '900px',
      maxWidth: '95vw',
      maxHeight: '90vh',
      data: patient,
      panelClass: 'patient-details-dialog-panel',
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result?.action === 'edit') {
        this.editPatient(result.patient.id);
      } else if (result?.action === 'delete') {
        // TODO: Implement delete confirmation
        console.log('Delete patient:', result.patient.id);
      }
    });
  }

  /**
   * Edit patient
   */
  editPatient(id: string): void {
    console.log('Edit patient:', id);
    // TODO: Navigate to patient edit page
    // this.router.navigate(['/patients', id, 'edit']);
  }

  /**
   * Add new patient
   */
  addPatient(): void {
    const dialogRef = this.dialog.open(AddPatientDialogComponent, {
      width: '800px',
      maxWidth: '95vw',
      maxHeight: '90vh',
      disableClose: true,
      panelClass: 'patient-dialog',
    });

    dialogRef.afterClosed().subscribe((result: Patient | undefined) => {
      if (result) {
        // Patient was created successfully
        console.log('Patient created:', result);
        this.loadPatients();
      }
    });
  }

  /**
   * Delete selected patients
   */
  deleteSelected(): void {
    const selectedIds = this.selectedPatients().map(p => p.id);
    console.log('Delete patients:', selectedIds);
    
    if (confirm(`Are you sure you want to delete ${selectedIds.length} patient(s)?`)) {
      // TODO: Implement bulk delete
      // this.patientService.deleteMultiple(selectedIds).subscribe(() => {
      //   this.loadPatients();
      //   this.selectedPatients.set([]);
      // });
    }
  }

  /**
   * Export selected or all patients
   */
  exportPatients(): void {
    const dataToExport = this.hasSelection() 
      ? this.selectedPatients() 
      : this.patients();
    
    console.log('Export patients:', dataToExport.length);
    // TODO: Implement export functionality
  }

  /**
   * Refresh patient list
   */
  refresh(): void {
    this.loadPatients();
  }

  /**
   * Calculate age from date of birth
   */
  private calculateAge(dateOfBirth: Date): number {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  }

  /**
   * Format date to readable string
   */
  private formatDate(date: Date): string {
    const d = new Date(date);
    return d.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  }
}
