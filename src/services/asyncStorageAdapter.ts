import type { AsyncStorageStatic } from '@react-native-async-storage/async-storage';

type AsyncStorageSubset = Pick<
  AsyncStorageStatic,
  'getItem' | 'setItem' | 'removeItem' | 'multiRemove' | 'clear'
>;

const createMemoryStorage = (): AsyncStorageSubset => {
  const store = new Map<string, string>();

  return {
    async getItem(key: string) {
      return store.has(key) ? store.get(key)! : null;
    },
    async setItem(key: string, value: string) {
      store.set(key, value);
    },
    async removeItem(key: string) {
      store.delete(key);
    },
    async multiRemove(keys: readonly string[]) {
      keys.forEach((key) => store.delete(key));
    },
    async clear() {
      store.clear();
    },
  };
};

/**
 * Wraps AsyncStorage operations with retry logic to handle manifest file errors
 */
const createResilientStorage = (storage: AsyncStorageSubset): AsyncStorageSubset => {
  const retryOperation = async <T>(
    operation: () => Promise<T>,
    retries = 2,
    delay = 100
  ): Promise<T> => {
    try {
      return await operation();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);

      // Check if it's a manifest file error
      const isManifestError = errorMessage.includes('manifest.json') ||
                             errorMessage.includes('NSCocoaErrorDomain');

      if (isManifestError && retries > 0) {
        // Wait a bit before retrying
        await new Promise<void>(resolve => setTimeout(() => resolve(), delay));
        return retryOperation(operation, retries - 1, delay * 2);
      }

      throw error;
    }
  };

  return {
    async getItem(key: string) {
      return retryOperation(() => storage.getItem(key));
    },
    async setItem(key: string, value: string) {
      return retryOperation(() => storage.setItem(key, value));
    },
    async removeItem(key: string) {
      return retryOperation(() => storage.removeItem(key));
    },
    async multiRemove(keys: readonly string[]) {
      return retryOperation(() => storage.multiRemove(keys));
    },
    async clear() {
      return retryOperation(() => storage.clear());
    },
  };
};

let asyncStorage: AsyncStorageSubset;

try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires, global-require
  const nativeStorage = require('@react-native-async-storage/async-storage').default;
  asyncStorage = createResilientStorage(nativeStorage);
} catch (error) {
  console.warn(
    '[storage] Native AsyncStorage module unavailable; using in-memory fallback. Data will reset on reload.',
    error
  );
  asyncStorage = createMemoryStorage();
}

export default asyncStorage;
