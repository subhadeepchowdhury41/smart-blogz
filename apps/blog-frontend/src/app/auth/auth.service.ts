import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, firstValueFrom, catchError, throwError } from 'rxjs';
import { environment } from '../../environments/environment';

export interface User {
  id: string;
  email: string;
  name?: string;
  avatar?: string;
  provider?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private userSubject = new BehaviorSubject<User | null>(null);
  user$ = this.userSubject.asObservable();
  private initialized = false;

  constructor(
    private http: HttpClient,
    private router: Router
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

    const token = localStorage.getItem('token');
    if (!token) {
      this.userSubject.next(null);
      return;
    }

    try {
      const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
      const user = await firstValueFrom(
        this.http.get<User>(`${environment.apiUrl}/auth/validate`, { headers }).pipe(
          catchError((error: HttpErrorResponse) => {
            if (error.status === 401) {
              this.clearAuth();
            }
            return throwError(() => error);
          })
        )
      );
      
      if (user && user.id) {
        this.userSubject.next(user);
      } else {
        throw new Error('Invalid user data from validate endpoint');
      }
    } catch (e) {
      console.error('Token validation failed:', e);
      // Don't clear auth on validation failure during init
      this.userSubject.next(null);
    }
  }

  login() {
    // Store current URL for redirect after login
    const currentUrl = this.router.url;
    if (currentUrl !== '/login' && currentUrl !== '/login/callback') {
      localStorage.setItem('redirectUrl', currentUrl);
    }
    // Redirect to backend OAuth endpoint
    window.location.href = `${environment.apiUrl}/auth/google`;
  }

  async handleAuthCallback(token: string, userData: string): Promise<boolean> {
    try {
      const user = JSON.parse(decodeURIComponent(userData));
      if (!user || !user.id || !user.email) {
        throw new Error('Invalid user data structure');
      }

      localStorage.setItem('token', token);
      this.userSubject.next(user);

      // Get redirect URL and navigate
      const redirectUrl = localStorage.getItem('redirectUrl') || '/blogs';
      localStorage.removeItem('redirectUrl');
      await this.router.navigate([redirectUrl]);
      return true;
    } catch (e) {
      console.error('Failed to handle auth callback:', e);
      this.clearAuth();
      return false;
    }
  }

  logout() {
    this.clearAuth();
    this.router.navigate(['/login']);
  }

  private clearAuth() {
    localStorage.removeItem('token');
    localStorage.removeItem('redirectUrl');
    this.userSubject.next(null);
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  isAuthenticated(): boolean {
    return this.userSubject.value !== null && localStorage.getItem('token') !== null;
  }
}