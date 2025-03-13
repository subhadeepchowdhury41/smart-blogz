import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SnackbarService, SnackbarMessage } from '../snackbar.service';
import { Observable } from 'rxjs';
import { trigger, transition, style, animate } from '@angular/animations';

@Component({
  selector: 'app-snackbar',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div *ngIf="message$ | async as message" 
         [@slideInOut]
         class="fixed bottom-4 right-4 px-4 py-2 rounded shadow-lg transition-all duration-300"
         [ngClass]="{
           'bg-green-500': message.type === 'success',
           'bg-red-500': message.type === 'error'
         }">
      <p class="text-white">{{ message.text }}</p>
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
export class SnackbarComponent implements OnInit {
  message$!: Observable<SnackbarMessage | null>;

  constructor(private snackbarService: SnackbarService) {}

  ngOnInit() {
    this.message$ = this.snackbarService.message$;
  }
}
