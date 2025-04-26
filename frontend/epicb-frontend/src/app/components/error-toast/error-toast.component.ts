import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { NotificationService, Notification, NotificationType } from '../../services/notification.service';

@Component({
  selector: 'app-error-toast',
  templateUrl: './error-toast.component.html',
  styleUrls: ['./error-toast.component.css']
})
export class ErrorToastComponent implements OnInit, OnDestroy {
  queue: Notification[] = [];
  message: string | null = null;
  show = false;
  type: NotificationType = 'error';
  private sub!: Subscription;
  private timeoutId: any;
  private displayDuration = 4000;

  constructor(private notificationService: NotificationService) {}

  ngOnInit() {
    this.sub = this.notificationService.getNotifications().subscribe((notif: Notification) => {
      this.queue.push(notif);
      if (!this.show) {
        this.displayNext();
      }
    });
  }

  displayNext() {
    if (this.queue.length === 0) {
      this.show = false;
      this.message = null;
      return;
    }
    const notif = this.queue.shift()!;
    this.message = notif.message;
    this.type = notif.type;
    this.show = true;
    clearTimeout(this.timeoutId);
    this.timeoutId = setTimeout(() => {
      this.show = false;
      setTimeout(() => this.displayNext(), 300); // animación out
    }, this.displayDuration);
  }

  ngOnDestroy() {
    this.sub?.unsubscribe();
    clearTimeout(this.timeoutId);
  }
}
