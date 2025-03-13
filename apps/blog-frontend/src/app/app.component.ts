import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { NavbarComponent } from './shared/navbar/navbar.component';
import { SnackbarComponent } from './shared/snackbar/snackbar.component';

@Component({
  selector: 'app-root',
  template: `
    <div class="min-h-screen bg-gray-50">
      <app-navbar></app-navbar>
      <main class="container mx-auto px-4 py-8 mt-16">
        <router-outlet></router-outlet>
      </main>
      <app-snackbar></app-snackbar>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      height: 100%;
    }
  `],
  standalone: true,
  imports: [RouterModule, NavbarComponent, SnackbarComponent]
})
export class AppComponent {}
