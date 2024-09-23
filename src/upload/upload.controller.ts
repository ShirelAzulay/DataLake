
import { Controller, Post, UploadedFiles, Query, UseInterceptors } from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { UploadService } from './upload.service';

@Controller('upload')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post()
  @UseInterceptors(FilesInterceptor('directory'))
  async uploadDirectory(@UploadedFiles() files: Express.Multer.File[], @Query('unique_id') uniqueId: string) {
    await this.uploadService.uploadDirectory(files, uniqueId);
    return { status: 'success', message: 'Directory uploaded successfully.' };
  }
}
