import { inject } from '@angular/core';
import { Router, type CanActivateFn } from '@angular/router';
import { AuthService } from './auth.service';

export const AuthGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const authService = inject(AuthService);

  if (authService.isAuthenticated()) {
    return true;
  }

  // Store the attempted URL for redirecting
  const currentUrl = state.url;
  localStorage.setItem('redirectUrl', currentUrl);
  
  router.navigate(['/login']);
  return false;
};