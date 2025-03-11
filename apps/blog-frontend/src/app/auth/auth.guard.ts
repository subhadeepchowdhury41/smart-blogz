import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';

export const AuthGuard = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Check if user is authenticated
  if (authService.isAuthenticated()) {
    return true;
  }

  // Store the attempted URL for redirecting
  const currentUrl = router.url;
  if (currentUrl !== '/login' && currentUrl !== '/login/callback') {
    localStorage.setItem('redirectUrl', currentUrl);
  }

  // Navigate to login page
  router.navigate(['/login']);
  return false;
};