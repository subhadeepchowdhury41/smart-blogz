import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SnackbarService } from '../snackbar.service';
import { trigger, transition, style, animate } from '@angular/animations';

@Component({
  selector: 'app-snackbar',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div *ngIf="message$ | async as message"
         [@slideInOut]
         class="fixed bottom-4 right-4 px-6 py-3 rounded-lg shadow-lg z-50"
         [ngClass]="{
           'bg-green-500': message.type === 'success',
           'bg-red-500': message.type === 'error',
           'bg-blue-500': message.type === 'info'
         }">
      <p class="text-white">{{ message.message }}</p>
    </div>
  `,
  animations: [
    trigger('slideInOut', [
      transition(':enter', [
        style({ transform: 'translateY(100%)', opacity: 0 }),
        animate('200ms ease-out', style({ transform: 'translateY(0)', opacity: 1 }))
      ]),
      transition(':leave', [
        animate('200ms ease-in', style({ transform: 'translateY(100%)', opacity: 0 }))
      ])
    ])
  ]
})
export class SnackbarComponent {
  private readonly snackbarService: SnackbarService;
  readonly message$;

  constructor(snackbarService: SnackbarService) {
    this.snackbarService = snackbarService;
    this.message$ = this.snackbarService.snackbar$;
  }
}
