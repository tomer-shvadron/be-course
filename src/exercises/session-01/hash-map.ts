import { createHash } from 'crypto';

export class HashMap {
  private map: Array<{ key: string; value: string }[]> = [];
  private size: number = 0;
  private readonly MAX_SIZE = 100_000;

  constructor(private hashFunction?: (key: string) => number) {
    this.hashFunction =
      hashFunction ??
      ((key: string) => {
        const hash = createHash('sha256').update(key).digest('hex');
        return parseInt(hash.substring(0, 8), 16) % this.MAX_SIZE;
      });
  }

  put(key: string, value: string): void {
    if (this.size >= this.MAX_SIZE) {
      throw new Error('Map is full');
    }

    const index = this.hashFunction(key) % this.MAX_SIZE;

    if (!this.map[index]) {
      this.map[index] = [];
    }

    const existingEntry = this.findEntry(index, key);

    if (existingEntry) {
      existingEntry.value = value;
    } else {
      this.map[index].push({ key, value });
      this.size++;
    }
  }

  get(key: string): string {
    const index = this.hashFunction(key) % this.MAX_SIZE;

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
    const index = this.hashFunction(key) % this.MAX_SIZE;

    if (!this.map[index]) {
      return;
    }

    const entryIndex = this.map[index].findIndex((entry) => entry.key === key);

    if (entryIndex === -1) {
      throw new Error('Key not found');
    }

    this.map[index].splice(entryIndex, 1);
    this.size--;
  }

  private findEntry(index: number, key: string) {
    return this.map[index].find((entry) => entry.key === key);
  }
}
