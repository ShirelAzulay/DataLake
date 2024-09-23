
import { Injectable } from '@nestjs/common';
@Injectable()
export class NotificationService {
  sendNotification(
      eventType: string,
      uniqueId: string,
      details?: string,
  ): void {
    // Implement your notification logic here
    console.log(`Event: ${eventType}, Unique ID: ${uniqueId}, Details: ${details}`);
  }

}
