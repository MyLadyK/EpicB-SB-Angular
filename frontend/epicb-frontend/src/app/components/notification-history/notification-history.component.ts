import { Component } from '@angular/core';
import { NotificationService, Notification } from '../../services/notification.service';

@Component({
  selector: 'app-notification-history',
  templateUrl: './notification-history.component.html',
  styleUrls: ['./notification-history.component.css']
})
export class NotificationHistoryComponent {
  get history(): Notification[] {
    return this.notificationService.getHistory();
  }

  constructor(private notificationService: NotificationService) {}
}
