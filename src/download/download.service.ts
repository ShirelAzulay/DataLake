import { Injectable, Logger } from '@nestjs/common';
import { Firestore, FieldValue } from '@google-cloud/firestore';
import { Storage } from '@google-cloud/storage';
import * as archiver from 'archiver';
import * as fs from 'fs';
import * as path from 'path';
import { default as pRetry } from 'p-retry';

@Injectable()
export class DownloadService {
    private storage: Storage;
    private firestore: Firestore;
    private bucketName: string = 'my_storage_bucket';
    private collectionName: string = 'fileStorage';
    private logger = new Logger('DownloadService');

    constructor() {
        this.firestore = new Firestore();
        this.storage = new Storage();
    }

    /**
     * Retrieves the file paths associated with the given key from Firestore.
     * Downloads the files from Google Cloud Storage into a temporary directory and zips them.
     * @param {string} uniqueKey - The unique identifier for the directory.
     * @returns {Promise<string>} - The path to the zipped directory.
     */
    async downloadDirectory(uniqueKey: string): Promise<string> {
        try {
            const paths = await pRetry(() => this.getFilePaths(uniqueKey), { retries: 3 });
            if (!paths || paths.length === 0) return null;

            const tempDir = this.createTemporaryDirectory(uniqueKey);
            await this.downloadFiles(paths, tempDir);
            return this.createZipFromDirectory(tempDir, uniqueKey);
        } catch (error) {
            this.logger.error(`Failed to download directory for ${uniqueKey}: ${error.message}`);
            throw new Error(`Failed to download directory for ${uniqueKey}`);
        }
    }

    /**
     * Retrieves file paths from Firestore based on the unique key.
     * @param {string} uniqueKey - The unique key.
     * @returns {Promise<string[]>} - The list of file paths.
     */
    private async getFilePaths(uniqueKey: string): Promise<string[]> {
        this.logger.log(`Fetching file paths for ${uniqueKey}`);
        let doc;
        if (uniqueKey.length === 7) {
            doc = await this.firestore.collection(this.collectionName).doc(uniqueKey).get();
        } else if (uniqueKey.length === 5) {
            doc = await this.firestore.collection(this.collectionName).doc(uniqueKey).get();
        }
        if (!doc || !doc.exists) {
            this.logger.warn(`No file paths found for ${uniqueKey}`);
            return null;
        }
        this.logger.log(`Successfully fetched file paths for ${uniqueKey}`);
        return doc.data().paths;
    }

    /**
     * Creates a temporary directory for downloading files.
     * @param {string} uniqueKey - The unique key.
     * @returns {string} - The path to the temporary directory.
     */
    private createTemporaryDirectory(uniqueKey: string): string {
        const tempDir = `/tmp/${uniqueKey}`;
        if (!fs.existsSync(tempDir)) {
            fs.mkdirSync(tempDir, { recursive: true });
        }
        this.logger.log(`Created temporary directory at ${tempDir}`);
        return tempDir;
    }

    /**
     * Downloads files from Google Cloud Storage to a temporary directory.
     * @param {string[]} paths - The list of file paths to download.
     * @param {string} tempDir - The path to the temporary directory.
     */
    private async downloadFiles(paths: string[], tempDir: string): Promise<void> {
        const bucket = this.storage.bucket(this.bucketName);

        for (const filePath of paths) {
            const file = bucket.file(filePath);
            const destination = path.join(tempDir, file.name);
            const localDir = path.dirname(destination);

            if (!fs.existsSync(localDir)) {
                fs.mkdirSync(localDir, { recursive: true });
            }

            this.logger.log(`Downloading file ${filePath} to ${destination}`);
            await pRetry(() => file.download({ destination }), { retries: 3 })
                .catch(error => {
                    this.logger.error(`Failed to download file ${filePath}: ${error.message}`);
                    throw new Error(`Failed to download file ${filePath}`);
                });
        }
    }

    /**
     * Creates a zip file from a directory.
     * @param {string} tempDir - The path to the temporary directory.
     * @param {string} uniqueKey - The unique key.
     * @returns {Promise<string>} - The path to the zip file.
     */
    private createZipFromDirectory(tempDir: string, uniqueKey: string): Promise<string> {
        this.logger.log(`Creating zip from directory ${tempDir}`);
        const zipPath = `/tmp/${uniqueKey}.zip`;
        const output = fs.createWriteStream(zipPath);
        const archive = archiver('zip', { zlib: { level: 9 } });

        return new Promise((resolve, reject) => {
            output.on('close', () => {
                this.logger.log(`Successfully created zip at ${zipPath}`);
                resolve(zipPath);
            });
            archive.on('error', (error) => {
                this.logger.error(`Failed to create zip: ${error.message}`);
                reject(error);
            });
            archive.pipe(output);
            archive.directory(tempDir, false);
            archive.finalize();
        });
    }
}