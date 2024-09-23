
import { Controller, Get, Param, Res } from '@nestjs.common';
import { DownloadService } from './download.service';
import { Response } from 'express';

@Controller('download')
export class DownloadController {
  constructor(private readonly downloadService: DownloadService) {}

  @Get(':unique_id')
  async downloadDirectory(@Param('unique_id') uniqueId: string, @Res() res: Response) {
    const filePath = await this.downloadService.downloadDirectory(uniqueId);
    res.download(filePath);
  }
}
