import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface User {
  id: string;
  email: string;
  name?: string;
  picture?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private userSubject = new BehaviorSubject<User | null>(null);
  user$ = this.userSubject.asObservable();

  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    // Check for existing token and user data
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    if (token && userData) {
      try {
        this.userSubject.next(JSON.parse(userData));
      } catch (e) {
        this.clearAuth();
      }
    }
  }

  login() {
    // Store current URL for redirect after login
    const currentUrl = this.router.url;
    if (currentUrl !== '/login') {
      localStorage.setItem('redirectUrl', currentUrl);
    }
    // Redirect to backend OAuth endpoint
    window.location.href = `${environment.apiUrl}/auth/google`;
  }

  handleAuthCallback(token: string, userData: string) {
    try {
      const user = JSON.parse(userData);
      localStorage.setItem('token', token);
      localStorage.setItem('user', userData);
      this.userSubject.next(user);

      // Get redirect URL and navigate
      const redirectUrl = localStorage.getItem('redirectUrl') || '/blogs';
      localStorage.removeItem('redirectUrl');
      this.router.navigate([redirectUrl]);
      return true;
    } catch (e) {
      console.error('Failed to parse user data:', e);
      return false;
    }
  }

  logout() {
    this.clearAuth();
    this.router.navigate(['/login']);
  }

  private clearAuth() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('redirectUrl');
    this.userSubject.next(null);
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  isAuthenticated(): boolean {
    return this.getToken() !== null;
  }
}