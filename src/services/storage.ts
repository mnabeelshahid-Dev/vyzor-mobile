import AsyncStorage from '@react-native-async-storage/async-storage';
import { DebugConsole } from '../utils/debug';

/**
 * Error types for storage operations
 */
export class StorageError extends Error {
  constructor(
    message: string,
    public readonly key?: string,
    public readonly operation?: string
  ) {
    super(message);
    this.name = 'StorageError';
  }
}

/**
 * Storage service interface for type safety
 */
export interface IStorageService {
  getString(key: string): Promise<string | null>;
  setString(key: string, value: string): Promise<void>;
  getObject<T>(key: string): Promise<T | null>;
  setObject<T>(key: string, value: T): Promise<void>;
  removeItem(key: string): Promise<void>;
  clear(): Promise<void>;
  getAllKeys(): Promise<string[]>;
  multiGet(keys: string[]): Promise<Array<[string, string | null]>>;
  multiSet(keyValuePairs: Array<[string, string]>): Promise<void>;
  multiRemove(keys: string[]): Promise<void>;
  getSecureString(key: string): Promise<string | null>;
  setSecureString(key: string, value: string): Promise<void>;
  removeSecureString(key: string): Promise<void>;
  getBooleanString(key: string): Promise<boolean>;
  setBooleanString(key: string, value: boolean): Promise<void>;
}

/**
 * Storage service providing secure and regular storage capabilities
 * Uses AsyncStorage for regular storage and will be extended with Keychain for secure storage
 */
class StorageService implements IStorageService {
  /**
   * Validates storage key
   * @private
   */
  private validateKey(key: string): void {
    if (!key || typeof key !== 'string' || key.trim().length === 0) {
      throw new StorageError(
        'Storage key must be a non-empty string',
        key,
        'validation'
      );
    }
  }

  /**
   * Logs storage errors with proper context using DebugConsole
   * @private
   */
  private logError(operation: string, key: string, error: unknown): void {
    if (__DEV__) {
      DebugConsole.error(
        'StorageService',
        `${operation} error for key "${key}"`,
        error
      );
    }
  }

  /**
   * Retrieves a string value from storage
   * @param key - The storage key
   * @returns Promise resolving to the stored string or null if not found
   * @throws {StorageError} When key validation fails
   */
  async getString(key: string): Promise<string | null> {
    this.validateKey(key);
    try {
      return await AsyncStorage.getItem(key);
    } catch (error) {
      this.logError('getString', key, error);
      return null;
    }
  }

  /**
   * Stores a string value in storage
   * @param key - The storage key
   * @param value - The string value to store
   * @throws {StorageError} When key validation fails
   */
  async setString(key: string, value: string): Promise<void> {
    this.validateKey(key);
    if (typeof value !== 'string') {
      throw new StorageError('Value must be a string', key, 'setString');
    }
    try {
      await AsyncStorage.setItem(key, value);
    } catch (error) {
      this.logError('setString', key, error);
      throw new StorageError(
        `Failed to store string for key: ${key}`,
        key,
        'setString'
      );
    }
  }

  /**
   * Retrieves and parses an object from storage
   * @param key - The storage key
   * @returns Promise resolving to the parsed object or null if not found
   * @throws {StorageError} When key validation fails
   */
  async getObject<T = unknown>(key: string): Promise<T | null> {
    this.validateKey(key);
    try {
      const value = await AsyncStorage.getItem(key);
      return value ? (JSON.parse(value) as T) : null;
    } catch (error) {
      this.logError('getObject', key, error);
      return null;
    }
  }

  /**
   * Stores an object in storage as JSON
   * @param key - The storage key
   * @param value - The object to store
   * @throws {StorageError} When key validation fails or serialization fails
   */
  async setObject<T = unknown>(key: string, value: T): Promise<void> {
    this.validateKey(key);
    try {
      const serializedValue = JSON.stringify(value);
      await AsyncStorage.setItem(key, serializedValue);
    } catch (error) {
      this.logError('setObject', key, error);
      throw new StorageError(
        `Failed to store object for key: ${key}`,
        key,
        'setObject'
      );
    }
  }

  /**
   * Removes an item from storage
   * @param key - The storage key to remove
   * @throws {StorageError} When key validation fails
   */
  async removeItem(key: string): Promise<void> {
    this.validateKey(key);
    try {
      await AsyncStorage.removeItem(key);
    } catch (error) {
      this.logError('removeItem', key, error);
      throw new StorageError(
        `Failed to remove item for key: ${key}`,
        key,
        'removeItem'
      );
    }
  }

  /**
   * Clears all items from storage
   * @throws {StorageError} When clear operation fails
   */
  async clear(): Promise<void> {
    try {
      await AsyncStorage.clear();
    } catch (error) {
      this.logError('clear', 'all', error);
      throw new StorageError('Failed to clear storage', 'all', 'clear');
    }
  }

  /**
   * Retrieves all storage keys
   * @returns Promise resolving to an array of storage keys
   * @throws {StorageError} When retrieval fails
   */
  async getAllKeys(): Promise<string[]> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      return [...keys]; // Convert readonly array to mutable array
    } catch (error) {
      this.logError('getAllKeys', 'all', error);
      throw new StorageError(
        'Failed to retrieve storage keys',
        'all',
        'getAllKeys'
      );
    }
  }

  /**
   * Retrieves multiple items from storage
   * @param keys - Array of storage keys to retrieve
   * @returns Promise resolving to key-value pairs
   * @throws {StorageError} When key validation fails or retrieval fails
   */
  async multiGet(keys: string[]): Promise<Array<[string, string | null]>> {
    if (!Array.isArray(keys)) {
      throw new StorageError('Keys must be an array', 'multiGet', 'multiGet');
    }
    keys.forEach(key => this.validateKey(key));
    try {
      const result = await AsyncStorage.multiGet(keys);
      return result.map(([key, value]) => [key, value]); // Ensure proper typing
    } catch (error) {
      this.logError('multiGet', keys.join(','), error);
      throw new StorageError(
        'Failed to retrieve multiple items',
        keys.join(','),
        'multiGet'
      );
    }
  }

  /**
   * Stores multiple items in storage
   * @param keyValuePairs - Array of key-value pairs to store
   * @throws {StorageError} When validation fails or storage operation fails
   */
  async multiSet(keyValuePairs: Array<[string, string]>): Promise<void> {
    if (!Array.isArray(keyValuePairs)) {
      throw new StorageError(
        'Key-value pairs must be an array',
        'multiSet',
        'multiSet'
      );
    }
    keyValuePairs.forEach(([key, value]) => {
      this.validateKey(key);
      if (typeof value !== 'string') {
        throw new StorageError(
          `Value for key ${key} must be a string`,
          key,
          'multiSet'
        );
      }
    });
    try {
      await AsyncStorage.multiSet(keyValuePairs);
    } catch (error) {
      const keys = keyValuePairs.map(([key]) => key).join(',');
      this.logError('multiSet', keys, error);
      throw new StorageError(
        'Failed to store multiple items',
        keys,
        'multiSet'
      );
    }
  }

  /**
   * Removes multiple items from storage
   * @param keys - Array of storage keys to remove
   * @throws {StorageError} When key validation fails or removal fails
   */
  async multiRemove(keys: string[]): Promise<void> {
    if (!Array.isArray(keys)) {
      throw new StorageError(
        'Keys must be an array',
        'multiRemove',
        'multiRemove'
      );
    }
    keys.forEach(key => this.validateKey(key));
    try {
      await AsyncStorage.multiRemove(keys);
    } catch (error) {
      this.logError('multiRemove', keys.join(','), error);
      throw new StorageError(
        'Failed to remove multiple items',
        keys.join(','),
        'multiRemove'
      );
    }
  }

  // Secure storage (using AsyncStorage for now, will implement Keychain later)
  /**
   * Retrieves a secure string value from storage
   * @param key - The storage key
   * @returns Promise resolving to the stored string or null if not found
   * @throws {StorageError} When key validation fails
   */
  async getSecureString(key: string): Promise<string | null> {
    this.validateKey(key);
    try {
      return await this.getString(key);
    } catch (error) {
      this.logError('getSecureString', key, error);
      return null;
    }
  }

  /**
   * Stores a secure string value in storage
   * @param key - The storage key
   * @param value - The string value to store securely
   * @throws {StorageError} When key validation fails
   */
  async setSecureString(key: string, value: string): Promise<void> {
    this.validateKey(key);
    if (typeof value !== 'string') {
      throw new StorageError('Value must be a string', key, 'setSecureString');
    }
    try {
      await this.setString(key, value);
    } catch (error) {
      this.logError('setSecureString', key, error);
      throw new StorageError(
        `Failed to store secure string for key: ${key}`,
        key,
        'setSecureString'
      );
    }
  }

  /**
   * Removes a secure string from storage
   * @param key - The storage key to remove
   * @throws {StorageError} When key validation fails
   */
  async removeSecureString(key: string): Promise<void> {
    this.validateKey(key);
    try {
      await this.removeItem(key);
    } catch (error) {
      this.logError('removeSecureString', key, error);
      throw new StorageError(
        `Failed to remove secure string for key: ${key}`,
        key,
        'removeSecureString'
      );
    }
  }

  // Helper methods for common patterns
  /**
   * Retrieves a boolean value stored as a string
   * @param key - The storage key
   * @returns Promise resolving to the boolean value, defaults to false if not found
   * @throws {StorageError} When key validation fails
   */
  async getBooleanString(key: string): Promise<boolean> {
    this.validateKey(key);
    try {
      const value = await this.getString(key);
      return value === 'true';
    } catch (error) {
      this.logError('getBooleanString', key, error);
      return false;
    }
  }

  /**
   * Stores a boolean value as a string
   * @param key - The storage key
   * @param value - The boolean value to store
   * @throws {StorageError} When key validation fails
   */
  async setBooleanString(key: string, value: boolean): Promise<void> {
    this.validateKey(key);
    if (typeof value !== 'boolean') {
      throw new StorageError(
        'Value must be a boolean',
        key,
        'setBooleanString'
      );
    }
    try {
      await this.setString(key, value.toString());
    } catch (error) {
      this.logError('setBooleanString', key, error);
      throw new StorageError(
        `Failed to store boolean for key: ${key}`,
        key,
        'setBooleanString'
      );
    }
  }
}

export const storage = new StorageService();
