import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface SnackbarMessage {
  text: string;
  type: 'success' | 'error';
}

@Injectable({
  providedIn: 'root'
})
export class SnackbarService {
  private messageSubject = new BehaviorSubject<SnackbarMessage | null>(null);
  message$ = this.messageSubject.asObservable();

  showSuccess(text: string) {
    this.messageSubject.next({ text, type: 'success' });
    this.autoHide();
  }

  showError(text: string) {
    this.messageSubject.next({ text, type: 'error' });
    this.autoHide();
  }

  private autoHide() {
    setTimeout(() => {
      this.messageSubject.next(null);
    }, 5000);
  }
}
