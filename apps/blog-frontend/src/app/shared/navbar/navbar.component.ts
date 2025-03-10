import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../auth/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <nav class="bg-white shadow-lg fixed top-0 left-0 right-0 z-50">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16">
          <div class="flex">
            <div class="flex-shrink-0 flex items-center">
              <a routerLink="/" class="text-xl font-bold text-indigo-600">BlogApp</a>
            </div>
            <div class="hidden sm:ml-6 sm:flex sm:space-x-8">
              <a routerLink="/blogs" 
                class="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-900 border-b-2"
                [class.border-indigo-500]="this._router.url === '/blogs'"
                [class.border-transparent]="this._router.url !== '/blogs'">
                Blogs
              </a>
              <a *ngIf="user$ | async"
                routerLink="/blogs/create"
                class="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-900 border-b-2"
                [class.border-indigo-500]="this._router.url === '/blogs/create'"
                [class.border-transparent]="this._router.url !== '/blogs/create'">
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
                  class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Logout
                </button>
              </div>
            </ng-container>
            <ng-template #loginButton>
              <button
                (click)="login()"
                class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Login
              </button>
            </ng-template>
          </div>
        </div>
      </div>
    </nav>
    <!-- Spacer for fixed navbar -->
    <div class="h-16"></div>
  `
})
export class NavbarComponent implements OnInit {
  private readonly _authService: AuthService;
  private readonly _router: Router;
  readonly user$;

  constructor(authService: AuthService, router: Router) {
    this._authService = authService;
    this._router = router;
    this.user$ = this._authService.user$;
  }

  ngOnInit() {}

  login() {
    this._authService.login();
  }

  async logout() {
    await this._authService.logout();
    this._router.navigate(['/login']);
  }
}
