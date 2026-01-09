import { Component, inject, signal, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AuthService } from '../../core/services';
import { User } from '../../core/models';

/**
 * Profile Page Component
 * 
 * Displays and allows editing of the current user's profile information.
 * Features:
 * - View user details
 * - Edit profile information
 * - View account metadata (created date, last login)
 */
@Component({
  selector: 'app-profile',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatDividerModule,
    MatSnackBarModule,
  ],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfileComponent implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly fb = inject(FormBuilder);
  private readonly snackBar = inject(MatSnackBar);

  readonly user = this.authService.user;
  readonly editMode = signal(false);
  readonly loading = signal(false);

  profileForm!: FormGroup;

  ngOnInit(): void {
    this.initializeForms();
  }

  /**
   * Initialize forms
   */
  private initializeForms(): void {
    const currentUser = this.user();

    this.profileForm = this.fb.group({
      firstName: [currentUser?.firstName || '', [Validators.required, Validators.minLength(2)]],
      lastName: [currentUser?.lastName || '', [Validators.required, Validators.minLength(2)]],
      email: [{ value: currentUser?.email || '', disabled: true }, [Validators.required, Validators.email]],
      phone: [currentUser?.phone || '', [Validators.pattern(/^[\+]?[(]?[0-9]{1,4}[)]?[-\s\.]?[(]?[0-9]{1,4}[)]?[-\s\.]?[0-9]{1,4}[-\s\.]?[0-9]{1,9}$/)]],
    });
  }

  /**
   * Toggle edit mode
   */
  toggleEditMode(): void {
    this.editMode.set(!this.editMode());
    
    if (!this.editMode()) {
      // Reset form when canceling edit
      this.initializeForms();
    }
  }

  /**
   * Save profile changes
   */
  saveProfile(): void {
    if (this.profileForm.invalid) {
      this.profileForm.markAllAsTouched();
      return;
    }

    this.loading.set(true);

    const formValue = this.profileForm.value;

    // Call authService to update profile
    this.authService.updateProfile(formValue).subscribe({
      next: () => {
        this.loading.set(false);
        this.editMode.set(false);
        
        this.snackBar.open('Profile updated successfully!', 'Close', {
          duration: 3000,
          horizontalPosition: 'end',
          verticalPosition: 'top',
        });
      },
      error: (error) => {
        this.loading.set(false);
        
        this.snackBar.open(error.message || 'Failed to update profile', 'Close', {
          duration: 3000,
          horizontalPosition: 'end',
          verticalPosition: 'top',
          panelClass: ['error-snackbar'],
        });
      }
    });
  }

  /**
   * Get role display name
   */
  getRoleDisplayName(role: string): string {
    const roleMap: Record<string, string> = {
      admin: 'Administrator',
      doctor: 'Doctor',
      nurse: 'Nurse',
      receptionist: 'Receptionist',
    };
    return roleMap[role] || role;
  }

  /**
   * Get role color for chip
   */
  getRoleColor(role: string): string {
    const colorMap: Record<string, string> = {
      admin: 'role-admin',
      doctor: 'role-doctor',
      nurse: 'role-nurse',
      receptionist: 'role-receptionist',
    };
    return colorMap[role] || '';
  }

  /**
   * Get initials for avatar placeholder
   */
  getInitials(): string {
    const currentUser = this.user();
    if (!currentUser) return '';
    
    const firstInitial = currentUser.firstName?.charAt(0).toUpperCase() || '';
    const lastInitial = currentUser.lastName?.charAt(0).toUpperCase() || '';
    return `${firstInitial}${lastInitial}`;
  }
}
