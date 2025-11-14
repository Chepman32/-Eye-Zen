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

let asyncStorage: AsyncStorageSubset;

try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires, global-require
  asyncStorage = require('@react-native-async-storage/async-storage').default;
} catch (error) {
  console.warn(
    '[storage] Native AsyncStorage module unavailable; using in-memory fallback. Data will reset on reload.',
    error
  );
  asyncStorage = createMemoryStorage();
}

export default asyncStorage;
