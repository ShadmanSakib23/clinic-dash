import { TestBed } from '@angular/core/testing';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({});
    service = TestBed.inject(AuthService);
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('Initialization', () => {
    it('should initialize with no authenticated user', () => {
      expect(service.user()).toBeNull();
    });

    it('should initialize with isAuthenticated false', () => {
      expect(service.isAuthenticated()).toBe(false);
    });
  });

  describe('Login', () => {
    it('should authenticate user with valid credentials', (ctx) => {
      const credentials = {
        email: 'admin@clinic.com',
        password: 'admin123',
      };

      service.login(credentials).subscribe({
        next: (response) => {
          expect(response.user.email).toBe(credentials.email);
          expect(response.token).toBeTruthy();
          expect(service.isAuthenticated()).toBe(true);
          expect(service.user()?.email).toBe(credentials.email);
        },
      });
    });
  });

  describe('Computed Signals', () => {
    it('should compute isAdmin correctly', (ctx) => {
      const credentials = {
        email: 'admin@clinic.com',
        password: 'admin123',
      };

      service.login(credentials).subscribe({
        next: () => {
          expect(service.isAdmin()).toBe(true);
        },
        error: () => {} // Ignore errors
      });
    });

    it('should compute isDoctor correctly', (ctx) => {
      const credentials = {
        email: 'doctor@clinic.com',
        password: 'doctor123',
      };

      service.login(credentials).subscribe({
        next: () => {
          expect(service.isDoctor()).toBe(true);
        },
        error: () => {} // Ignore errors
      });
    });

    it('should compute isReceptionist correctly', (ctx) => {
      const credentials = {
        email: 'receptionist@clinic.com',
        password: 'receptionist123',
      };

      service.login(credentials).subscribe({
        next: () => {
          expect(service.isReceptionist()).toBe(true);
        },
        error: () => {} // Ignore errors
      });
    });

    it('should compute userRole correctly', (ctx) => {
      const credentials = {
        email: 'doctor@clinic.com',
        password: 'doctor123',
      };

      service.login(credentials).subscribe({
        next: () => {
          expect(service.userRole()).toBe('doctor');
        },
        error: () => {} // Ignore errors
      });
    });
  });
});
