import { Injectable, Logger } from '@nestjs/common';
import { Storage } from '@google-cloud/storage';
import { Firestore, FieldValue } from '@google-cloud/firestore';
import * as path from 'path';
import { default as pRetry } from 'p-retry';

@Injectable()
export class UploadService {
  private storage: Storage;
  private firestore: Firestore;
  private bucketName: string = 'my_storage_bucket';
  private collectionName: string = 'fileStorage';
  private logger = new Logger('UploadService');

  constructor() {
    this.storage = new Storage();
    this.firestore = new Firestore();
  }

  /**
   * Uploads a directory of files to Google Cloud Storage and updates Firestore.
   * @param {Express.Multer.File[]} files - The files to be uploaded.
   * @param {string} uniqueId - The unique identifier for the directory.
   */
  async uploadDirectory(files: Express.Multer.File[], uniqueId: string): Promise<void> {
    const bucket = this.storage.bucket(this.bucketName);

    for (const file of files) {
      try {
        const blobPath = await pRetry(() => this.uploadFile(bucket, file, uniqueId), { retries: 3 });
        const fullKey = this.generateFullKey(blobPath, uniqueId);

        await this.updateFirestore(uniqueId, fullKey, blobPath);
      } catch (error) {
        this.logger.error(`Failed to upload file ${file.originalname}: ${error.message}`);
        throw new Error(`Failed to upload file ${file.originalname}`);
      }
    }
  }

  /**
   * Uploads a single file to Google Cloud Storage.
   * @param bucket - The GCS bucket.
   * @param file - The file to be uploaded.
   * @param uniqueId - The unique identifier for the directory.
   * @returns The full path of the uploaded file.
   */
  private async uploadFile(bucket: any, file: Express.Multer.File, uniqueId: string): Promise<string> {
    this.logger.log(`Uploading file ${file.originalname} to bucket ${this.bucketName}`);
    const blobPath = path.join(uniqueId, file.originalname).replace(/\\/g, '/');
    const blob = bucket.file(blobPath);
    const blobStream = blob.createWriteStream({ resumable: false, contentType: file.mimetype });

    return new Promise((resolve, reject) => {
      blobStream.on('finish', () => {
        this.logger.log(`Successfully uploaded file ${file.originalname} to ${blobPath}`);
        resolve(blobPath);
      });
      blobStream.on('error', (error) => {
        this.logger.error(`Error uploading file ${file.originalname}: ${error.message}`);
        reject(error);
      });
      blobStream.end(file.buffer);
    });
  }

  /**
   * Generates a full key based on the unique identifier and the additional key from the file path.
   * @param filePath - The full file path.
   * @param dirKeyUnique - The unique key of the directory.
   * @returns The generated full key.
   */
  private generateFullKey(filePath: string, dirKeyUnique: string): string {
    const additionalKey = this.extractAdditionalKey(filePath, dirKeyUnique);
    return dirKeyUnique.slice(0, 5) + additionalKey;
  }

  /**
   * Updates Firestore with the file paths under both keys.
   * @param uniqueId - The unique identifier for the directory.
   * @param fullKey - The full key.
   * @param blobPath - The full path of the uploaded file.
   */
  private async updateFirestore(uniqueId: string, fullKey: string, blobPath: string): Promise<void> {
    this.logger.log(`Updating Firestore for uniqueId ${uniqueId} and fullKey ${fullKey}`);

    await pRetry(() =>
            this.firestore.collection(this.collectionName).doc(uniqueId.slice(0, 5)).set({
              paths: FieldValue.arrayUnion(blobPath)
            }, { merge: true }),
        { retries: 3 }
    ).catch(error => {
      this.logger.error(`Failed to update Firestore for ${uniqueId}: ${error.message}`);
      throw new Error(`Failed to update Firestore for ${uniqueId}`);
    });

    if (fullKey.length === 7) {
      await pRetry(() =>
              this.firestore.collection(this.collectionName).doc(fullKey).set({
                paths: [blobPath]
              }),
          { retries: 3 }
      ).catch(error => {
        this.logger.error(`Failed to update Firestore for ${fullKey}: ${error.message}`);
        throw new Error(`Failed to update Firestore for ${fullKey}`);
      });
    }

    this.logger.log(`Successfully updated Firestore for ${uniqueId} and ${fullKey}`);
  }

  /**
   * Extracts additional key from the file path.
   * @param filePath - The full file path.
   * @param dirKeyUnique - The unique key of the directory.
   * @returns The extracted additional key.
   */
  private extractAdditionalKey(filePath: string, dirKeyUnique: string): string {
    const subpath = filePath.substring(filePath.indexOf(dirKeyUnique) + dirKeyUnique.length + 1);
    return subpath.replace('/', '').slice(0, 2);
  }
}