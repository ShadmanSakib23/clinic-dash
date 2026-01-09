import { Component, signal, computed, inject } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive, Router } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatBadgeModule } from '@angular/material/badge';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AuthService } from '../../core/services';

/**
 * Layout Component
 * 
 * Purpose: Provides the main authenticated layout structure with:
 * - Header: Material toolbar with user info, notifications, logout
 * - Sidebar: Material sidenav with collapsible navigation
 * - Content Area: Router outlet for page content
 * 
 * Usage: Wrap authenticated routes with this layout in app.routes.ts
 * 
 * Features:
 * - Material Design components for professional UI
 * - Responsive sidebar (collapsible on mobile)
 * - User profile display in header with dropdown menu
 * - Navigation links with active state highlighting
 * - Logout functionality
 */
@Component({
  selector: 'app-layout',
  imports: [
    RouterOutlet, 
    RouterLink,
    RouterLinkActive,
    MatToolbarModule,
    MatSidenavModule,
    MatListModule,
    MatIconModule,
    MatButtonModule,
    MatMenuModule,
    MatBadgeModule,
    MatTooltipModule
  ],
  templateUrl: './layout.component.html',
  styleUrl: './layout.component.scss',
})
export class LayoutComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  readonly isSidebarCollapsed = signal(false);
  readonly currentUser = computed(() => this.authService.user());
  readonly userInitials = computed(() => {
    const user = this.currentUser();
    if (!user) return '';
    const names = user.firstName.split(' ');
    return names.map((n: string) => n[0]).join('').toUpperCase();
  });
  readonly navigationItems = [
    { icon: 'dashboard', label: 'Dashboard', route: '/dashboard', roles: ['admin'] },
    { icon: 'people', label: 'Patients', route: '/patients', roles: ['admin', 'doctor', 'receptionist'] },
    { icon: 'medical_services', label: 'Doctors', route: '/doctors', roles: ['admin', 'receptionist'] },
    { icon: 'event', label: 'Appointments', route: '/appointments', roles: ['admin', 'doctor', 'receptionist'] },
  ];

  // Filtered navigation based on user role
  // Only shows menu items the current user has permission to access
  readonly accessibleNavigationItems = computed(() => {
    const user = this.currentUser();
    if (!user) return [];
    return this.navigationItems.filter(item => 
      !item.roles || item.roles.includes(user.role)
    );
  });

  /**
   * Toggle sidebar collapse state
   * Called when user clicks hamburger menu or sidebar toggle button
   * Updates the isSidebarCollapsed signal
   */
  toggleSidebar() {
    this.isSidebarCollapsed.update(collapsed => !collapsed);
  }

  /**
   * Handle user logout
   * Clears authentication state and redirects to login
   * Called when user clicks logout button in header
   */
  onLogout() {
    this.authService.logout().subscribe({
      next: () => {
        this.router.navigate(['/login']);
      },
      error: (error) => {
        console.error('Logout error:', error);
        this.router.navigate(['/login']);
      }
    });
  }

  /**
   * Handle notification click
   * Opens notification panel or navigates to notifications page
   */
  onNotificationClick() {
    // TODO: Implement notification panel/dropdown
  }

  /**
   * Handle profile menu click
   * Opens dropdown menu with user options (profile, settings, logout)
   */
  onProfileClick() {
    this.router.navigate(['/profile']);
  }

}
