
import { Module } from '@nestjs.common';
import { UploadModule } from './upload/upload.module';
import { DownloadModule } from './download/download.module';
import { NotificationModule } from './notification/notification.module';
import { OrchestrationModule } from './orchestration/orchestration.module';

@Module({
  imports: [UploadModule, DownloadModule, NotificationModule, OrchestrationModule],
})
export class AppModule {}
