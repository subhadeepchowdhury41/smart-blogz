import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div class="max-w-md w-full space-y-8">
        <div>
          <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Welcome Back
          </h2>
          <p class="mt-2 text-center text-sm text-gray-600">
            Sign in to continue to BlogApp
          </p>
        </div>

        <div *ngIf="isLoading" class="flex justify-center">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>

        <div *ngIf="!isLoading" class="mt-8">
          <div class="flex flex-col gap-4">
            <button
              (click)="login('google')"
              class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              <span class="absolute left-0 inset-y-0 flex items-center pl-3">
                <svg class="h-5 w-5 text-red-500 group-hover:text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12.545,12.151L12.545,12.151c0,1.054,0.947,1.911,2.115,1.911h3.312c-0.158,1.174-0.552,2.245-1.129,3.135c-0.588,0.911-1.384,1.638-2.321,2.109c-0.938,0.472-1.979,0.708-3.057,0.708c-1.075,0-2.114-0.235-3.049-0.706c-0.935-0.47-1.729-1.196-2.315-2.106c-0.587-0.91-0.981-1.981-1.139-3.154c-0.158-1.173-0.158-2.348,0-3.521c0.158-1.173,0.552-2.244,1.139-3.154c0.586-0.91,1.38-1.636,2.315-2.106c0.935-0.471,1.974-0.706,3.049-0.706c1.078,0,2.119,0.236,3.057,0.708c0.937,0.471,1.733,1.198,2.321,2.109c0.577,0.89,0.971,1.961,1.129,3.135h-3.312C13.492,10.24,12.545,11.097,12.545,12.151z M19.237,11.635h-1.359v1.031h-1.031v-1.031h-1.359v-1.031h1.359V9.173h1.031v1.432h1.359V11.635z"></path>
                </svg>
              </span>
              Sign in with Google
            </button>

            <button
              (click)="login('facebook')"
              class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <span class="absolute left-0 inset-y-0 flex items-center pl-3">
                <svg class="h-5 w-5 text-blue-500 group-hover:text-blue-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20.9,2H3.1A1.1,1.1,0,0,0,2,3.1V20.9A1.1,1.1,0,0,0,3.1,22h9.58V14.25h-2.6v-3h2.6V9a3.64,3.64,0,0,1,3.88-4,20.26,20.26,0,0,1,2.33.12v2.7H17.3c-1.26,0-1.5.6-1.5,1.47v1.93h3l-.39,3H15.8V22h5.1A1.1,1.1,0,0,0,22,20.9V3.1A1.1,1.1,0,0,0,20.9,2Z"></path>
                </svg>
              </span>
              Sign in with Facebook
            </button>
          </div>
        </div>

        <div *ngIf="error" class="mt-4 text-center text-sm text-red-600">
          {{ error }}
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      min-height: 100vh;
      background-color: #f9fafb;
    }
  `]
})
export class LoginComponent {
  isLoading = false;
  error: string | null = null;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {
    // Redirect if already authenticated
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/blogs']);
    }
  }

  login(provider: 'google' | 'facebook') {
    this.error = null;
    this.isLoading = true;
    try {
      this.authService.login(provider);
    } catch (e) {
      console.error(`Failed to initiate ${provider} login:`, e);
      this.error = `Failed to initiate ${provider} login. Please try again.`;
      this.isLoading = false;
    }
  }
}