import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { environment } from '../../environments/environment';
import { SnackbarService } from '../shared/snackbar.service';

export interface User {
  id: string;
  email: string;
  name: string;
  avatar: string;
  provider: 'google' | 'facebook';
  lastLoginAt?: string;
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
    this.initializeAuth();
  }

  private async initializeAuth(): Promise<void> {
    if (this.initialized) return;

    try {
      const token = localStorage.getItem(this.TOKEN_KEY);
      const userStr = localStorage.getItem(this.USER_KEY);
      
      if (token && userStr) {
        const user = JSON.parse(userStr);
        if (this.isValidUser(user)) {
          this.userSubject.next(user);
        } else {
          this.clearAuth();
        }
      } else {
        this.clearAuth();
      }
    } catch (e) {
      console.error('Failed to initialize auth:', e);
      this.clearAuth();
    } finally {
      this.initialized = true;
    }
  }

  private isValidUser(user: any): user is User {
    return (
      typeof user === 'object' &&
      typeof user.id === 'string' &&
      typeof user.email === 'string' &&
      typeof user.name === 'string' &&
      typeof user.avatar === 'string' &&
      (user.provider === 'google' || user.provider === 'facebook')
    );
  }

  login(provider: 'google' | 'facebook'): void {
    window.location.href = `${this.API_URL}/auth/${provider}`;
  }

  async handleAuthCallback(params: URLSearchParams): Promise<void> {
    const error = params.get('error');
    if (error) {
      this.snackbar.showError(`Authentication failed: ${error}`);
      await this.router.navigate(['/login']);
      return;
    }

    const token = params.get('token');
    const userStr = params.get('user');

    if (!token || !userStr) {
      this.snackbar.showError('Invalid authentication response');
      await this.router.navigate(['/login']);
      return;
    }

    try {
      // Handle both encoded and non-encoded user data for testing flexibility
      const decodedUserStr = userStr.startsWith('%') ? decodeURIComponent(userStr) : userStr;
      const user = JSON.parse(decodedUserStr);
      
      if (!this.isValidUser(user)) {
        throw new Error('Invalid user data');
      }
      
      this.setAuth(token, user);
      this.snackbar.showSuccess('Successfully logged in!');
      await this.router.navigate(['/blogs']);
    } catch (e) {
      console.error('Failed to handle auth callback:', e);
      this.snackbar.showError('Failed to complete authentication');
      await this.router.navigate(['/login']);
    }
  }

  async logout(): Promise<void> {
    this.clearAuth();
    this.snackbar.showSuccess('Successfully logged out');
    await this.router.navigate(['/login']);
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem(this.TOKEN_KEY);
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  private setAuth(token: string, user: User): void {
    localStorage.setItem(this.TOKEN_KEY, token);
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
    this.userSubject.next(user);
  }

  private clearAuth(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    this.userSubject.next(null);
  }
}