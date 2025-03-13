import { HttpInterceptorFn } from '@angular/common/http';
import { environment } from '../../environments/environment';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  // Skip token for auth endpoints except validate
  if (req.url.startsWith(`${environment.apiUrl}/auth/`) && 
      !req.url.includes('/validate')) {
    return next(req);
  }

  const token = localStorage.getItem('auth_token'); // Match the TOKEN_KEY from AuthService
  console.log('Token found:', !!token); // Debug log
  console.log('Request URL:', req.url); // Debug log

  if (token) {
    console.log('Adding auth header'); // Debug log
    const authReq = req.clone({
      headers: req.headers.set('Authorization', `Bearer ${token}`)
    });
    return next(authReq);
  }

  console.log('No token found, proceeding without auth'); // Debug log
  return next(req);
};