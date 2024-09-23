
import { Controller, Post, Body } from '@nestjs/common';
import { NotificationService } from './notification.service';

@Controller('notify')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Post()
  sendNotification(@Body() body: { event_type: string; unique_id: string; details?: string }) {
    this.notificationService.sendNotification(body.event_type, body.unique_id, body.details);
    return { status: 'success', message: 'Notification sent.' };
  }
}
