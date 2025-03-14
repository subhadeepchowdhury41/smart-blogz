import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../auth/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <nav class="bg-white shadow-lg fixed top-0 w-full z-10">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16">
          <div class="flex">
            <div class="flex-shrink-0 flex items-center">
              <a routerLink="/" class="text-xl font-bold text-indigo-600">BlogApp</a>
            </div>
            <div class="hidden sm:ml-6 sm:flex sm:space-x-8">
              <a routerLink="/blogs" 
                class="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-900 border-b-2"
                [class.border-indigo-500]="currentUrl === '/blogs'"
                [class.border-transparent]="currentUrl !== '/blogs'">
                Blogs
              </a>
              <a *ngIf="user$ | async"
                routerLink="/blogs/create"
                class="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-900 border-b-2"
                [class.border-indigo-500]="currentUrl === '/blogs/create'"
                [class.border-transparent]="currentUrl !== '/blogs/create'">
                Create Blog
              </a>
            </div>
          </div>
          <div class="flex items-center">
            <ng-container *ngIf="user$ | async as user; else loginButton">
              <div class="flex items-center space-x-4">
                <span class="text-sm text-gray-700">{{ user.email }}</span>
                <button
                  (click)="logout()"
                  class="inline-flex items-center px-3 py-1.5 border border-red-500 text-sm font-medium rounded-md text-red-600 bg-white hover:bg-red-50 hover:text-red-700 hover:border-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-all duration-200 gap-1.5 shadow-sm"
                >
                  <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  <span>Logout</span>
                </button>
              </div>
            </ng-container>
            <ng-template #loginButton>
              <button
                (click)="login()"
                class="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200 gap-1.5 shadow-sm"
              >
                <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                </svg>
                <span>Login</span>
              </button>
            </ng-template>
          </div>
        </div>
      </div>
    </nav>
  `,
  styles: [`
    :host {
      display: block;
    }
  `]
})
export class NavbarComponent implements OnInit {
  private readonly _authService: AuthService;
  public readonly router: Router;
  readonly user$;

  get currentUrl(): string {
    return this.router.url;
  }

  constructor(authService: AuthService, router: Router) {
    this._authService = authService;
    this.router = router;
    this.user$ = this._authService.user$;
  }

  ngOnInit() {}

  login() {
    this._authService.login('google');
  }

  async logout() {
    await this._authService.logout();
    this.router.navigate(['/login']);
  }
}
