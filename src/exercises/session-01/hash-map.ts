import { createHash } from 'crypto';
import { LinkedList } from './linked-list';

interface Entry {
  key: string;
  value: string;
}

export class HashMap {
  private size: number = 0;
  private readonly MAX_SIZE = 100_000;
  private readonly MAX_ITEMS_IN_BUCKET = 100;

  private map: Array<LinkedList<Entry>> = new Array(8);

  constructor(private hashFunction?: (key: string) => number) {
    this.hashFunction =
      hashFunction ??
      ((key: string) => {
        const hash = createHash('sha256').update(key).digest('hex');
        return parseInt(hash.substring(0, 8), 16) % this.map.length;
      });
  }

  private resize(): void {
    const oldMap = this.map;

    this.size = 0;
    this.map.length *= 2;
    this.map = new Array(this.map.length);

    oldMap.forEach((bucket) => {
      if (bucket) {
        bucket.toArray().forEach(({ key, value }: Entry) => {
          this.put(key, value);
        });
      }
    });
  }

  put(key: string, value: string): void {
    if (this.size >= this.MAX_SIZE) {
      throw new Error('Map is full');
    }

    const index = this.hashFunction!(key) % this.map.length;

    if (!this.map[index]) {
      this.map[index] = new LinkedList<Entry>();
    }

    const existingEntry = this.findEntry(index, key);

    if (existingEntry) {
      existingEntry.value = value;
    } else {
      const bucket = this.map[index];
      if (bucket) {
        bucket.append({ key, value });
        this.size++;

        if (bucket.getSize() > this.MAX_ITEMS_IN_BUCKET) {
          this.resize();
        }
      }
    }
  }

  get(key: string): string {
    const index = this.hashFunction!(key) % this.map.length;

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
    const index = this.hashFunction!(key) % this.map.length;
    const bucket = this.map[index];

    if (!bucket) {
      return;
    }

    const entry = this.findEntry(index, key);

    if (!entry) {
      return;
    }

    bucket.remove(entry);
    this.size--;
  }

  private findEntry(index: number, key: string): Entry | null {
    const bucket = this.map[index];

    if (!bucket) {
      return null;
    }

    return bucket.find((entry: Entry) => entry.key === key);
  }

  values(): string[] {
    const result: string[] = [];

    this.map.forEach((bucket) => {
      if (bucket) {
        bucket.toArray().forEach((entry: Entry) => result.push(entry.value));
      }
    });

    return result;
  }
}
