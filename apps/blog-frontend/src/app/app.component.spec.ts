import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AppComponent } from './app.component';
import { RouterModule } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { NavbarComponent } from './shared/navbar/navbar.component';
import { SnackbarComponent } from './shared/snackbar/snackbar.component';
import { By } from '@angular/platform-browser';
import { AuthService } from './auth/auth.service';
import { SnackbarService } from './shared/snackbar.service';
import { BehaviorSubject, of } from 'rxjs';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

describe('AppComponent', () => {
  let component: AppComponent;
  let fixture: ComponentFixture<AppComponent>;
  let authService: Partial<AuthService>;
  let snackbarService: Partial<SnackbarService>;

  beforeEach(async () => {
    const userSubject = new BehaviorSubject(null);
    const messageSubject = new BehaviorSubject(null);

    authService = {
      user$: userSubject.asObservable(),
      login: jest.fn(),
      logout: jest.fn().mockResolvedValue(undefined)
    };

    snackbarService = {
      message$: messageSubject.asObservable(),
      showSuccess: jest.fn(),
      showError: jest.fn()
    };

    await TestBed.configureTestingModule({
      imports: [
        AppComponent,
        RouterTestingModule,
        NavbarComponent,
        SnackbarComponent,
        BrowserAnimationsModule
      ],
      providers: [
        { provide: AuthService, useValue: authService },
        { provide: SnackbarService, useValue: snackbarService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render navbar component', () => {
    const navbarElement = fixture.debugElement.query(By.directive(NavbarComponent));
    expect(navbarElement).toBeTruthy();
  });

  it('should render router outlet', () => {
    const routerOutlet = fixture.debugElement.query(By.css('router-outlet'));
    expect(routerOutlet).toBeTruthy();
  });

  it('should render snackbar component', () => {
    const snackbarElement = fixture.debugElement.query(By.directive(SnackbarComponent));
    expect(snackbarElement).toBeTruthy();
  });

  it('should have main container with proper styling', () => {
    const mainElement = fixture.debugElement.query(By.css('main'));
    expect(mainElement).toBeTruthy();
    expect(mainElement.classes['container']).toBeTruthy();
    expect(mainElement.classes['mx-auto']).toBeTruthy();
    expect(mainElement.classes['px-4']).toBeTruthy();
    expect(mainElement.classes['py-8']).toBeTruthy();
    expect(mainElement.classes['mt-16']).toBeTruthy();
  });

  it('should have root div with proper styling', () => {
    const rootDiv = fixture.debugElement.query(By.css('div'));
    expect(rootDiv).toBeTruthy();
    expect(rootDiv.classes['min-h-screen']).toBeTruthy();
    expect(rootDiv.classes['bg-gray-50']).toBeTruthy();
  });
});
