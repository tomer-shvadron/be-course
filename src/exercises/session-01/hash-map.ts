import { createHash } from 'crypto';

export class HashMap {
  private size: number = 0;
  private buckets: number = 8;
  private readonly MAX_SIZE = 100_000;
  private readonly MAX_ITEMS_IN_BUCKET = 100;
  private map: Array<{ key: string; value: string }[]> = []; // Ron: this is a "lazy" approach. in general, an eager approach is easier to understand and maintain.

  constructor(private hashFunction?: (key: string) => number) {
    this.hashFunction =
      hashFunction ??
      ((key: string) => {
        const hash = createHash('sha256').update(key).digest('hex');
        return parseInt(hash.substring(0, 8), 16) % this.buckets; // Ron: seems that `% this.buckets` is redundant.
      });
  }

  private resize(): void {
    const oldMap = this.map;

    this.size = 0;
    this.buckets *= 2;
    this.map = new Array(this.buckets);

    oldMap.forEach((bucket) => {
      bucket.forEach(({ key, value }) => {
        this.put(key, value);
      });
    });
  }

  put(key: string, value: string): void {
    if (this.size >= this.MAX_SIZE) {
      throw new Error('Map is full');
    }

    const index = this.hashFunction(key) % this.buckets;

    // Ron: implementing the bucket as an array is ok for educational purposes.
    // in production grade, a linked list would be more efficient, especially for removing
    if (!this.map[index]) {
      this.map[index] = [];
    }

    const existingEntry = this.findEntry(index, key);

    if (existingEntry) {
      existingEntry.value = value;
    } else {
      this.map[index].push({ key, value });
      this.size++;

      if (this.map[index].length > this.MAX_ITEMS_IN_BUCKET) {
        this.resize(); // Ron: nice work! while you're at it, consider also reducing when needed :)
      }
    }
  }

  get(key: string): string {
    const index = this.hashFunction(key) % this.buckets;

    if (!this.map[index]) {
      throw new Error('Key not found');
    }

    const entry = this.findEntry(index, key);

    if (!entry) {
      throw new Error('Key not found');
    }

    return entry.value;
  }

  remove(key: string): void {
    const index = this.hashFunction(key) % this.buckets;

    if (!this.map[index]) {
      return;
    }

    const entryIndex = this.map[index].findIndex((entry) => entry.key === key);

    if (entryIndex === -1) {
      throw new Error('Key not found'); // Ron: incorrect implementation
    }

    this.map[index].splice(entryIndex, 1); // Ron: this is the performance issue: O(n) in time.
    this.size--;
  }

  private findEntry(index: number, key: string) {
    return this.map[index].find((entry) => entry.key === key);
  }
}
