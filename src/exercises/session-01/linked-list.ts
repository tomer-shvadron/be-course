export class Node<T> {
  constructor(
    public value: T,
    public next: Node<T> | null = null
  ) {}
}

export class LinkedList<T> {
  private head: Node<T> | null = null;
  private tail: Node<T> | null = null;
  private size: number = 0;

  append(value: T): void {
    const newNode = new Node(value);

    if (!this.head) {
      this.head = newNode;
      this.tail = newNode;
    } else {
      this.tail!.next = newNode;
      this.tail = newNode;
    }

    this.size++;
  }

  prepend(value: T): void {
    const newNode = new Node(value, this.head);
    this.head = newNode;

    if (!this.tail) {
      this.tail = newNode;
    }

    this.size++;
  }

  removeFirst(): T | null {
    if (!this.head) {
      return null;
    }

    const value = this.head.value;
    this.head = this.head.next;

    if (!this.head) {
      this.tail = null;
    }

    this.size--;

    return value;
  }

  removeLast(): T | null {
    if (!this.head || !this.tail) {
      return null;
    }

    if (this.head === this.tail) {
      const value = this.head.value;
      this.head = null;
      this.tail = null;
      this.size = 0;

      return value;
    }

    let current = this.head;

    while (current.next !== this.tail) {
      current = current.next!;
    }

    const value = this.tail.value;
    this.tail = current;
    this.tail.next = null;
    this.size--;

    return value;
  }

  remove(value: T): boolean {
    if (!this.head) {
      return false;
    }

    if (this.head.value === value) {
      this.head = this.head.next;

      if (!this.head) {
        this.tail = null;
      }

      this.size--;

      return true;
    }

    let current = this.head;

    while (current.next) {
      if (current.next.value === value) {
        current.next = current.next.next;

        if (!current.next) {
          this.tail = current;
        }

        this.size--;

        return true;
      }

      current = current.next;
    }

    return false;
  }

  find(predicate: (value: T) => boolean): T | null {
    let current = this.head;

    while (current) {
      if (predicate(current.value)) {
        return current.value;
      }

      current = current.next;
    }

    return null;
  }

  contains(value: T): boolean {
    let current = this.head;

    while (current) {
      if (current.value === value) {
        return true;
      }
      current = current.next;
    }

    return false;
  }

  getSize(): number {
    return this.size;
  }

  isEmpty(): boolean {
    return this.size === 0;
  }

  toArray(): T[] {
    const result: T[] = [];
    let current = this.head;

    while (current) {
      result.push(current.value);
      current = current.next;
    }

    return result;
  }

  clear(): void {
    this.head = null;
    this.tail = null;
    this.size = 0;
  }
}
