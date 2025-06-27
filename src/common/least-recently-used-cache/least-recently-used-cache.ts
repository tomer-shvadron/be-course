export class LeastRecentlyUsedCache {
  private readonly capacity: number;
  private cache = new Map<string, NonNullable<any>>();

  constructor(capacity: number) {
    this.capacity = capacity;
  }

  tryGet(key: string): NonNullable<any> {
    if (!this.cache.has(key)) {
      return null;
    }

    return this.cache.get(key);
  }

  put(key: string, value: NonNullable<any>) {
    if (this.cache.has(key)) {
      this.cache.delete(key);
    }

    this.cache.set(key, value);

    if (this.cache.size > this.capacity) {
      this.cache.delete(this.cache.keys().next().value);
    }
  }

  remove(key: string) {
    this.cache.delete(key);
  }

  clear() {
    this.cache.clear();
  }
}
