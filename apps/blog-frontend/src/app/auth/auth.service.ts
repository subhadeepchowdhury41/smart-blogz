import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, firstValueFrom, catchError, throwError } from 'rxjs';
import { environment } from '../../environments/environment';
import { SnackbarService } from '../shared/snackbar.service';

export interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  picture?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly API_URL = environment.apiUrl;
  private readonly TOKEN_KEY = 'auth_token';
  private readonly USER_KEY = 'user';
  
  private userSubject = new BehaviorSubject<User | null>(null);
  user$ = this.userSubject.asObservable();
  private initialized = false;

  constructor(
    private http: HttpClient,
    private router: Router,
    private snackbar: SnackbarService
  ) {
    // Initialize auth state immediately
    this.initializeAuth().catch(err => {
      console.error('Auth initialization failed:', err);
      // Don't clear auth on init failure - just log the error
    });
  }

  private async initializeAuth() {
    if (this.initialized) return;
    this.initialized = true;

    const token = localStorage.getItem(this.TOKEN_KEY);
    const userStr = localStorage.getItem(this.USER_KEY);
    
    console.log('Auth initialization - Token exists:', !!token); // Debug log
    
    if (token && userStr) {
      try {
        const user = JSON.parse(userStr);
        this.userSubject.next(user);
        console.log('Auth initialized with user:', user.email); // Debug log
      } catch (e) {
        console.error('Failed to parse stored user:', e);
        this.clearAuth();
      }
    } else {
      this.userSubject.next(null);
      console.log('No auth data found during initialization'); // Debug log
    }
  }

  login(provider: 'google' | 'facebook') {
    const loginUrl = `${this.API_URL}/auth/${provider}`;
    window.location.href = loginUrl;
  }

  async handleAuthCallback(params: URLSearchParams): Promise<void> {
    const error = params.get('error');
    if (error) {
      this.snackbar.showError(`Authentication failed: ${error}`);
      this.router.navigate(['/login']);
      return;
    }

    const token = params.get('token');
    const userStr = params.get('user');

    if (!token || !userStr) {
      this.snackbar.showError('Invalid authentication response');
      this.router.navigate(['/login']);
      return;
    }

    try {
      const user = JSON.parse(decodeURIComponent(userStr));
      this.setAuth(token, user);
      console.log('Auth callback successful - Token set'); // Debug log
      this.snackbar.showSuccess('Successfully logged in!');
      this.router.navigate(['/blogs']);
    } catch (e) {
      console.error('Failed to handle auth callback:', e);
      this.snackbar.showError('Failed to complete authentication');
      this.router.navigate(['/login']);
    }
  }

  logout() {
    this.clearAuth();
    this.snackbar.showSuccess('Successfully logged out');
    this.router.navigate(['/login']);
  }

  isAuthenticated(): boolean {
    const isAuth = !!localStorage.getItem(this.TOKEN_KEY);
    console.log('Auth check:', isAuth); // Debug log
    return isAuth;
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  private setAuth(token: string, user: User) {
    localStorage.setItem(this.TOKEN_KEY, token);
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
    this.userSubject.next(user);
    console.log('Auth data set - Token and user stored'); // Debug log
  }

  private clearAuth() {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    this.userSubject.next(null);
    console.log('Auth cleared'); // Debug log
  }
}