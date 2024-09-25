import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UploadModule } from './upload/upload.module';
import { DownloadModule } from './download/download.module';
import { NotificationModule } from './notification/notification.module';  // If needed
import { OrchestrationModule } from './orchestration/orchestration.module';  // If needed

@Module({
  imports: [UploadModule, DownloadModule, NotificationModule, OrchestrationModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}