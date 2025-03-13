import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from './auth.service';

@Component({
  selector: 'app-auth-callback',
  template: '<div class="flex items-center justify-center min-h-screen">Processing login...</div>',
  standalone: true,
  imports: [CommonModule]
})
export class AuthCallbackComponent implements OnInit {
  constructor(
    private route: ActivatedRoute,
    private authService: AuthService,
    private router: Router
  ) {}

  async ngOnInit() {
    try {
      const params = new URLSearchParams(window.location.search);
      await this.authService.handleAuthCallback(params);
    } catch (error) {
      console.error('Auth callback failed:', error);
      this.router.navigate(['/login']);
    }
  }
}
