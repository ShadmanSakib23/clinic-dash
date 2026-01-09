import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { LandingComponent } from './landing.component';
import { vi } from 'vitest';

describe('LandingComponent', () => {
  let component: LandingComponent;
  let fixture: ComponentFixture<LandingComponent>;
  let mockRouter: { navigate: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    mockRouter = {
      navigate: vi.fn()
    };

    await TestBed.configureTestingModule({
      imports: [LandingComponent],
      providers: [
        { provide: Router, useValue: mockRouter }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(LandingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should navigate to login when navigateToLogin is called', () => {
    component.navigateToLogin();
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/login']);
  });

  it('should render header with logo and login button', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const header = compiled.querySelector('.landing-header');
    expect(header).toBeTruthy();
    expect(header?.querySelector('.logo')).toBeTruthy();
    expect(header?.querySelector('.btn-login')).toBeTruthy();
  });

  it('should render hero section with title and CTA buttons', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const heroSection = compiled.querySelector('.hero-section');
    expect(heroSection).toBeTruthy();
    expect(heroSection?.querySelector('.hero-title')).toBeTruthy();
    expect(heroSection?.querySelector('.btn-primary')).toBeTruthy();
    expect(heroSection?.querySelector('.btn-secondary')).toBeTruthy();
  });

  it('should render dashboard preview cards', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const previewCards = compiled.querySelectorAll('.preview-card');
    expect(previewCards.length).toBe(3);
  });

  it('should render features section with 5 feature cards', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const featuresSection = compiled.querySelector('.features-section');
    const featureCards = featuresSection?.querySelectorAll('.feature-card');
    expect(featureCards?.length).toBe(5);
  });

  it('should render footer with logo and copyright text', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const footer = compiled.querySelector('.landing-footer');
    expect(footer).toBeTruthy();
    expect(footer?.querySelector('.footer-logo')).toBeTruthy();
    expect(footer?.querySelector('.footer-text')).toBeTruthy();
  });

  it('should call navigateToLogin when header login button is clicked', () => {
    const navigateSpy = vi.spyOn(component, 'navigateToLogin');
    const compiled = fixture.nativeElement as HTMLElement;
    const loginButton = compiled.querySelector('.landing-header .btn-login') as HTMLButtonElement;
    
    loginButton.click();
    
    expect(navigateSpy).toHaveBeenCalled();
  });

  it('should call navigateToLogin when primary CTA button is clicked', () => {
    const navigateSpy = vi.spyOn(component, 'navigateToLogin');
    const compiled = fixture.nativeElement as HTMLElement;
    const primaryButton = compiled.querySelector('.btn-primary') as HTMLButtonElement;
    
    primaryButton.click();
    
    expect(navigateSpy).toHaveBeenCalled();
  });
});
