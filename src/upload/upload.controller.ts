import { Controller, Post, UploadedFiles, Query, UseInterceptors } from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { UploadService } from './upload.service';

@Controller('upload')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  /**
   * Handles the upload of a directory of files.
   * @param {Express.Multer.File[]} files - The files to be uploaded.
   * @param {string} uniqueId - The unique identifier for the directory.
   * @returns {{ status: string, message: string }} - The status and message of the upload operation.
   */
  @Post()
  @UseInterceptors(FilesInterceptor('directory'))
  async uploadDirectory(
      @UploadedFiles() files: Express.Multer.File[],
      @Query('unique_id') uniqueId: string
  ): Promise<{ status: string; message: string }> {
    try {
      await this.uploadService.uploadDirectory(files, uniqueId);
      return { status: 'success', message: 'Directory uploaded successfully.' };
    } catch (error) {
      return { status: 'error', message: error.message };
    }
  }
}