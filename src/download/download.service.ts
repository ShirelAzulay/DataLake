import { Injectable, Logger } from '@nestjs/common';
import { Firestore } from '@google-cloud/firestore';
import { Storage } from '@google-cloud/storage';
import pRetry from 'p-retry';

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
     * Generates and returns links to the files in Google Cloud Storage.
     * @param {string} uniqueKey - The unique identifier for the directory.
     * @returns {Promise<object[]>} - The hierarchical structure with URLs to the files.
     */
    async getFileLinks(uniqueKey: string): Promise<any[]> {
        try {
            const paths = await pRetry(() => this.getFilePaths(uniqueKey), { retries: 3 });
            if (!paths || paths.length === 0) return null;

            const links = paths.map((entry: { id: string; path: string }) => ({
                id: entry.id,
                directory: `https://storage.googleapis.com/${this.bucketName}/${entry.path}`
            }));
            return links;
        } catch (error) {
            this.logger.error(`Failed to retrieve file links for ${uniqueKey}: ${error.message}`);
            throw new Error(`Failed to retrieve file links for ${uniqueKey}`);
        }
    }

    /**
     * Retrieves file paths from Firestore based on the unique key.
     * @param {string} uniqueKey - The unique key.
     * @returns {Promise<any[]>} - The list of file paths.
     */
    private getFilePaths = async (uniqueKey: string): Promise<any[]> => {
        this.logger.log(`Fetching file paths for ${uniqueKey}`);
        let doc;
        if (uniqueKey.length === 7) {
            doc = await this.firestore.collection(this.collectionName).doc(uniqueKey).get();
        } else {
            doc = await this.firestore.collection(this.collectionName).doc(uniqueKey).get();
        }
        if (!doc || !doc.exists) {
            this.logger.warn(`No file paths found for ${uniqueKey}`);
            return [];
        }
        this.logger.log(`Successfully fetched file paths for ${uniqueKey}`);
        return doc.data()?.paths || [];
    }
}