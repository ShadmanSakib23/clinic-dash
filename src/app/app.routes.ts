import { Routes } from '@angular/router';
import { LayoutComponent } from './shared/layout/layout.component';
import { authGuard } from './core/guards/auth.guard';


export const routes: Routes = [
  // Public routes
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { 
    path: 'login', 
    loadComponent: () => import('./features/auth/pages/login/login.component')
      .then(m => m.LoginComponent)
  },
  
  // Authenticated routes with lazy loading
  {
    path: '',
    component: LayoutComponent,
    canActivate: [authGuard],
    children: [
      { 
        path: 'dashboard', 
        loadComponent: () => import('./features/dashboard/dashboard.component')
          .then(m => m.DashboardComponent)
      },
      { 
        path: 'patients', 
        loadComponent: () => import('./features/patients/patients.component')
          .then(m => m.PatientsComponent)
      },
      { 
        path: 'doctors', 
        loadComponent: () => import('./features/doctors/doctors.component')
          .then(m => m.DoctorsComponent)
      }
    ]
  }
];
