
import { Injectable } from '@nestjs/common';
import { Storage } from '@google-cloud/storage';
import * as archiver from 'archiver';
import * as path from 'path';
import * as fs from 'fs-extra';

@Injectable()
export class DownloadService {
  private storage: Storage;
  private bucketName: string = 'my_bucket';

  constructor() {
    this.storage = new Storage();
  }

  async downloadDirectory(uniqueId: string): Promise<string> {
    const bucket = this.storage.bucket(this.bucketName);
    const [files] = await bucket.getFiles({ prefix: uniqueId });

      const tempDir = `/tmp/${uniqueId}`;
      if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true });
    }

    for (const file of files) {
        const destination = path.join(tempDir, file.name);
        const localDir = path.dirname(destination);
        if (!fs.existsSync(localDir)) {
            fs.mkdirSync(localDir, { recursive: true });
        }
        await file.download({ destination });
    }

    const zipPath = `/tmp/${uniqueId}.zip`;
    const output = fs.createWriteStream(zipPath);
    const archive = archiver('zip', {
        zlib: { level: 9 },
    });

    return new Promise((resolve, reject) => {
        output.on('close', () => resolve(zipPath));
        archive.on('error', (err) => reject(err));

        archive.pipe(output);
        archive.directory(tempDir, false);
        archive.finalize();
    });
  }
}
