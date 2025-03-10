import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface SnackbarMessage {
  message: string;
  type: 'success' | 'error' | 'info';
}

@Injectable({
  providedIn: 'root'
})
export class SnackbarService {
  private snackbarSubject = new BehaviorSubject<SnackbarMessage | null>(null);
  snackbar$ = this.snackbarSubject.asObservable();

  showMessage(message: string, type: 'success' | 'error' | 'info' = 'info') {
    this.snackbarSubject.next({ message, type });
    setTimeout(() => {
      this.snackbarSubject.next(null);
    }, 3000);
  }
}
