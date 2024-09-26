import { Controller, Get, Param, Res } from '@nestjs/common';
import { DownloadService } from './download.service';
import { Response } from 'express';

@Controller('download')
export class DownloadController {
  constructor(private readonly downloadService: DownloadService) {}

  /**
   * Handles the download of a directory of files.
   * @param {string} uniqueId - The unique identifier for the directory.
   * @param {Response} res - The response object.
   */
  @Get(':unique_id')
  async getFileLinks(@Param('unique_id') uniqueId: string, @Res() res: Response) {
    try {
      const links = await this.downloadService.getFileLinks(uniqueId);
      if (links) {
        res.json({ status: 'success', links });
      } else {
        res.status(404).send('File not found');
      }
    } catch (error) {
      res.status(500).send({ status: 'error', message: error.message });
    }
  }
}