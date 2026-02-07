import CryptoJS from 'crypto-js';
import { createJSONStorage, type StateStorage } from 'zustand/middleware';

// Versioned key for storage encryption - change if schema changes
const STORAGE_KEY = 'hwto-v1';

/**
 * Raw encrypted storage adapter implementing StateStorage interface.
 * Encrypts data before storing in localStorage and decrypts on retrieval.
 * Returns null on decryption failure to trigger state reset.
 */
const rawEncryptedStorage: StateStorage = {
  getItem(key: string): string | null {
    try {
      const value = localStorage.getItem(key);
      if (value === null) {
        return null;
      }

      const decrypted = CryptoJS.AES.decrypt(value, STORAGE_KEY);
      const result = decrypted.toString(CryptoJS.enc.Utf8);

      // Return null if decryption fails (empty string means failure)
      return result || null;
    } catch {
      // Decryption failed - return null to trigger state reset
      return null;
    }
  },

  setItem(key: string, value: string): void {
    const encrypted = CryptoJS.AES.encrypt(value, STORAGE_KEY).toString();
    localStorage.setItem(key, encrypted);
  },

  removeItem(key: string): void {
    localStorage.removeItem(key);
  },
};

/**
 * Encrypted storage for Zustand persist middleware.
 * Wraps rawEncryptedStorage with JSON serialization/deserialization.
 */
export const encryptedStorage = createJSONStorage(() => rawEncryptedStorage);
