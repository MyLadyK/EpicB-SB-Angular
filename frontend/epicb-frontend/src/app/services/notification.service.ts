import { Injectable } from '@angular/core';
import { Subject, Observable } from 'rxjs';

export type NotificationType = 'error' | 'success' | 'info';
export interface Notification {
  type: NotificationType;
  message: string;
  timestamp: Date;
}

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private notificationSubject = new Subject<Notification>();
  private history: Notification[] = [];
  private maxHistory = 50;

  showError(message: string) {
    this.addNotification({ type: 'error', message, timestamp: new Date() });
  }
  showSuccess(message: string) {
    this.addNotification({ type: 'success', message, timestamp: new Date() });
  }
  showInfo(message: string) {
    this.addNotification({ type: 'info', message, timestamp: new Date() });
  }

  private addNotification(notif: Notification) {
    this.notificationSubject.next(notif);
    this.history.unshift(notif);
    if (this.history.length > this.maxHistory) {
      this.history.pop();
    }
  }

  getNotifications(): Observable<Notification> {
    return this.notificationSubject.asObservable();
  }

  getHistory(): Notification[] {
    return [...this.history];
  }
}
