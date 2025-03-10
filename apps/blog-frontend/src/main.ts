import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { providePrimeNG } from 'primeng/config';
import { routes } from './app/app-routing.module';
import { authInterceptor } from './app/auth/auth.interceptor';
import Lara from '@primeng/themes/lara';
import { AuthService } from './app/auth/auth.service';
import { BlogService } from './app/blogs/blog.service';
import { SnackbarService } from './app/shared/snackbar.service';

bootstrapApplication(AppComponent, {
  providers: [
    AuthService,
    BlogService,
    SnackbarService,
    provideRouter(routes),
    provideHttpClient(
      withInterceptors([authInterceptor])
    ),
    provideAnimationsAsync(),
    providePrimeNG({
      theme: {
        preset: Lara,
      },
    })
  ]
}).catch(err => console.error(err));
