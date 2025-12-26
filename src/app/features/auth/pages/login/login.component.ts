import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../../core/services';

@Component({
  selector: 'app-login',
  imports: [FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent {
  readonly email = signal('');
  readonly password = signal('');
  readonly isLoading = signal(false);
  readonly errorMessage = signal('');
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  onLogin() {
    this.errorMessage.set('');
    if (!this.email() || !this.password()) {
      this.errorMessage.set('Please enter both email and password');
      return;
    }

    this.isLoading.set(true);
    this.authService.login({
      email: this.email(),
      password: this.password()
    }).subscribe({
      next: (response) => {
        this.router.navigate(['/dashboard']);
      },
      error: (error) => {
        this.errorMessage.set(error.message || 'Login failed. Please try again.');
        this.isLoading.set(false);
      },
      complete: () => {
        this.isLoading.set(false);
      }
    })
  }
}
