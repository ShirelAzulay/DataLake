
import { Injectable } from '@nestjs/common';
import { Storage } from '@google-cloud/storage';
import * as path from 'path';

@Injectable()
export class UploadService {
  private storage: Storage;
  private bucketName: string = 'my_bucket';

  constructor() {
    this.storage = new Storage();
  }

  async uploadDirectory(files: Express.Multer.File[], uniqueId: string): Promise<void> {
    const bucket = this.storage.bucket(this.bucketName);

    for (const file of files) {
      const blobPath = path.join(uniqueId, file.originalname).replace(/\\\\/g, '/');
      const blob = bucket.file(blobPath);

      const blobStream = blob.createWriteStream({
        resumable: false,
        contentType: file.mimetype,
      });

      blobStream.end(file.buffer);
    }
  }
}
