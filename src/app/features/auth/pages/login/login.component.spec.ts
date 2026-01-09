import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { LoginComponent } from './login.component';
import { AuthService } from '../../../../core/services/auth.service';
import { provideAnimations } from '@angular/platform-browser/animations';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let authService: { login: ReturnType<typeof vi.fn> };
  let router: { navigate: ReturnType<typeof vi.fn> };

  const mockLoginResponse = {
    token: 'mock-token-123',
    user: {
      id: '1',
      email: 'test@example.com',
      firstName: 'Test',
      lastName: 'User',
      role: 'admin' as const,
      createdAt: new Date(),
    },
  };

  beforeEach(async () => {
    authService = {
      login: vi.fn(),
    };
    router = {
      navigate: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [LoginComponent],
      providers: [
        provideAnimations(),
        { provide: AuthService, useValue: authService },
        { provide: Router, useValue: router },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Component Initialization', () => {
    it('should initialize with empty email and password', () => {
      expect(component.email()).toBe('');
      expect(component.password()).toBe('');
    });

    it('should initialize with no error message', () => {
      expect(component.errorMessage()).toBe('');
    });

    it('should initialize with loading state false', () => {
      expect(component.isLoading()).toBe(false);
    });
  });

  describe('Form Validation', () => {
    it('should show error when email is empty', () => {
      component.email.set('');
      component.password.set('password123');
      
      component.onLogin();
      
      expect(component.errorMessage()).toBe('Please enter both email and password');
      expect(authService.login).not.toHaveBeenCalled();
    });

    it('should show error when password is empty', () => {
      component.email.set('test@example.com');
      component.password.set('');
      
      component.onLogin();
      
      expect(component.errorMessage()).toBe('Please enter both email and password');
      expect(authService.login).not.toHaveBeenCalled();
    });

    it('should show error when both fields are empty', () => {
      component.email.set('');
      component.password.set('');
      
      component.onLogin();
      
      expect(component.errorMessage()).toBe('Please enter both email and password');
      expect(authService.login).not.toHaveBeenCalled();
    });
  });

  describe('Successful Login', () => {
    beforeEach(() => {
      authService.login.mockReturnValue(of(mockLoginResponse));
    });

    it('should clear error message on login attempt', () => {
      component.errorMessage.set('Previous error');
      component.email.set('test@example.com');
      component.password.set('password123');
      
      component.onLogin();
      
      expect(component.errorMessage()).toBe('');
    });

    it('should call authService.login with correct credentials', () => {
      const credentials = {
        email: 'test@example.com',
        password: 'password123',
      };
      
      component.email.set(credentials.email);
      component.password.set(credentials.password);
      
      component.onLogin();
      
      expect(authService.login).toHaveBeenCalledWith(credentials);
    });

    it('should navigate to dashboard on successful login', () => {
      component.email.set('test@example.com');
      component.password.set('password123');
      
      component.onLogin();
      
      expect(router.navigate).toHaveBeenCalledWith(['/dashboard']);
    });
  });

  describe('Failed Login', () => {
    it('should display error message on login failure', () => {
      const errorMessage = 'Invalid email or password';
      authService.login.mockReturnValue(
        throwError(() => ({ message: errorMessage }))
      );
      
      component.email.set('test@example.com');
      component.password.set('wrongpassword');
      
      component.onLogin();
      
      expect(component.errorMessage()).toBe(errorMessage);
    });

    it('should display default error message when error has no message', () => {
      authService.login.mockReturnValue(
        throwError(() => ({}))
      );
      
      component.email.set('test@example.com');
      component.password.set('wrongpassword');
      
      component.onLogin();
      
      expect(component.errorMessage()).toBe('Login failed. Please try again.');
    });

    it('should not navigate on login failure', () => {
      authService.login.mockReturnValue(
        throwError(() => ({ message: 'Login failed' }))
      );
      
      component.email.set('test@example.com');
      component.password.set('wrongpassword');
      
      component.onLogin();
      
      expect(router.navigate).not.toHaveBeenCalled();
    });
  });
});
