import { compressPayload, decompressPayload } from '@/lib/compression/payloadCompressor';

// IndexedDB wrapper for offline queue
const DB_NAME = 'leadya_offline';
const DB_VERSION = 2; // Upgraded for compression
const QUEUE_STORE = 'save_queue';
const DRAFTS_STORE = 'drafts';

export interface QueuedSave {
  id: string;
  campaignId: string;
  data: any;
  timestamp: number;
  retries: number;
  error?: string;
  compressed?: boolean;
  isDiff?: boolean;
}

class OfflineDB {
  private db: IDBDatabase | null = null;

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        if (!db.objectStoreNames.contains(QUEUE_STORE)) {
          db.createObjectStore(QUEUE_STORE, { keyPath: 'id' });
        }

        if (!db.objectStoreNames.contains(DRAFTS_STORE)) {
          db.createObjectStore(DRAFTS_STORE, { keyPath: 'campaignId' });
        }
      };
    });
  }

  async addToQueue(save: QueuedSave): Promise<void> {
    if (!this.db) await this.init();
    
    // Compress data before storing
    const compressed = compressPayload(save.data);
    const compressedSave = {
      ...save,
      data: compressed,
      compressed: true,
    };
    
    return new Promise((resolve, reject) => {
      const tx = this.db!.transaction(QUEUE_STORE, 'readwrite');
      const store = tx.objectStore(QUEUE_STORE);
      const request = store.put(compressedSave);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async getQueue(): Promise<QueuedSave[]> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const tx = this.db!.transaction(QUEUE_STORE, 'readonly');
      const store = tx.objectStore(QUEUE_STORE);
      const request = store.getAll();

      request.onsuccess = () => {
        const items = request.result || [];
        // Decompress data on retrieval
        const decompressed = items.map((item: QueuedSave) => ({
          ...item,
          data: item.compressed ? decompressPayload(item.data) : item.data,
        }));
        resolve(decompressed);
      };
      request.onerror = () => reject(request.error);
    });
  }

  async removeFromQueue(id: string): Promise<void> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const tx = this.db!.transaction(QUEUE_STORE, 'readwrite');
      const store = tx.objectStore(QUEUE_STORE);
      const request = store.delete(id);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async saveDraft(campaignId: string, data: any): Promise<void> {
    if (!this.db) await this.init();

    // Compress draft data
    const compressed = compressPayload(data);

    return new Promise((resolve, reject) => {
      const tx = this.db!.transaction(DRAFTS_STORE, 'readwrite');
      const store = tx.objectStore(DRAFTS_STORE);
      const request = store.put({
        campaignId,
        data: compressed,
        timestamp: Date.now(),
        compressed: true,
      });

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async getDraft(campaignId: string): Promise<any> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const tx = this.db!.transaction(DRAFTS_STORE, 'readonly');
      const store = tx.objectStore(DRAFTS_STORE);
      const request = store.get(campaignId);

      request.onsuccess = () => {
        const result = request.result;
        if (!result) {
          resolve(null);
          return;
        }
        // Decompress if needed
        const data = result.compressed ? decompressPayload(result.data) : result.data;
        resolve(data);
      };
      request.onerror = () => reject(request.error);
    });
  }

  async clearDraft(campaignId: string): Promise<void> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const tx = this.db!.transaction(DRAFTS_STORE, 'readwrite');
      const store = tx.objectStore(DRAFTS_STORE);
      const request = store.delete(campaignId);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }
}

export const offlineDB = new OfflineDB();
