
import { PodcastEpisode } from '../types';

const DB_NAME = 'SuomiCastDB';
const STORE_NAME = 'episodes';
const DB_VERSION = 1;

export interface StoredEpisode {
  dateKey: string;
  episode: PodcastEpisode;
  audioBlob: Blob;
}

export const dbService = {
  openDB: (): Promise<IDBDatabase> => {
    return new Promise((resolve, reject) => {
      if (!window.indexedDB) {
        reject(new Error("IndexedDB not supported"));
        return;
      }
      const request = window.indexedDB.open(DB_NAME, DB_VERSION);
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME, { keyPath: 'dateKey' });
        }
      };
      request.onsuccess = (event) => resolve((event.target as IDBOpenDBRequest).result);
      request.onerror = (event) => reject((event.target as IDBOpenDBRequest).error);
    });
  },

  getEpisode: async (dateKey: string): Promise<StoredEpisode | null> => {
    try {
      const db = await dbService.openDB();
      return new Promise((resolve, reject) => {
        const transaction = db.transaction(STORE_NAME, 'readonly');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.get(dateKey);
        request.onsuccess = () => resolve(request.result || null);
        request.onerror = () => reject(request.error);
      });
    } catch (e) {
      return null;
    }
  },

  getAllEpisodes: async (): Promise<StoredEpisode[]> => {
    try {
      const db = await dbService.openDB();
      return new Promise((resolve, reject) => {
        const transaction = db.transaction(STORE_NAME, 'readonly');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.getAll();
        request.onsuccess = () => {
          const results = request.result as StoredEpisode[];
          results.sort((a, b) => b.dateKey.localeCompare(a.dateKey));
          resolve(results);
        };
        request.onerror = () => reject(request.error);
      });
    } catch (e) {
      return [];
    }
  },

  getLatestEpisode: async (): Promise<StoredEpisode | null> => {
    const all = await dbService.getAllEpisodes();
    return all.length > 0 ? all[0] : null;
  },

  saveEpisode: async (dateKey: string, episode: PodcastEpisode, audioBlob: Blob): Promise<void> => {
    try {
      const db = await dbService.openDB();
      return new Promise((resolve, reject) => {
        const transaction = db.transaction(STORE_NAME, 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        const record: StoredEpisode = { dateKey, episode: { ...episode, audioUrl: '' }, audioBlob };
        store.put(record);
        transaction.oncomplete = () => resolve();
        transaction.onerror = () => reject(transaction.error);
      });
    } catch (e) {
      console.error(e);
    }
  }
};
