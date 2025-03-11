import { HttpInterceptorFn } from '@angular/common/http';
import { environment } from '../../environments/environment';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  // Skip token for auth endpoints except validate
  if (req.url.startsWith(`${environment.apiUrl}/auth/`) && 
      !req.url.includes('/validate')) {
    return next(req);
  }

  const token = localStorage.getItem('token');
  if (token) {
    const authReq = req.clone({
      headers: req.headers.set('Authorization', `Bearer ${token}`)
    });
    return next(authReq);
  }

  return next(req);
};