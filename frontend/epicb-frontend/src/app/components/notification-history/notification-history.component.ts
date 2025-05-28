import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationService, Notification } from '../../services/notification.service';

@Component({
  standalone: true,
  selector: 'app-notification-history',
  templateUrl: './notification-history.component.html',
  styleUrls: ['./notification-history.component.css'],
  imports: [CommonModule]
})
export class NotificationHistoryComponent {
  get history(): Notification[] {
    return this.notificationService.getHistory();
  }

  constructor(private notificationService: NotificationService) {}
}
