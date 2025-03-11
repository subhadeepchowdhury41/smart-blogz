import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from './auth.service';

@Component({
  selector: 'app-auth-callback',
  template: `
    <div class="flex items-center justify-center min-h-screen">
      <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>
  `
})
export class AuthCallbackComponent implements OnInit {
  constructor(
    private route: ActivatedRoute,
    private authService: AuthService,
    private router: Router
  ) {}

  async ngOnInit() {
    const token = this.route.snapshot.queryParamMap.get('token');
    const userData = this.route.snapshot.queryParamMap.get('user');
    const error = this.route.snapshot.queryParamMap.get('error');

    if (error) {
      console.error('Authentication failed:', error);
      await this.router.navigate(['/login']);
      return;
    }

    if (!token || !userData) {
      console.error('Missing authentication data');
      await this.router.navigate(['/login']);
      return;
    }

    try {
      const success = await this.authService.handleAuthCallback(token, userData);
      if (!success) {
        throw new Error('Auth callback failed');
      }
    } catch (error) {
      console.error('Auth callback error:', error);
      await this.router.navigate(['/login']);
    }
  }
}
