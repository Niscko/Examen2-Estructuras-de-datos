export class LinkedListNode {
  constructor(value) {
    this.value = value;
    this.next = null;
  }
}
export class LinkedList {
  constructor() {
    this.head = null;
    this.tail = null;
    this._size = 0;
  }
  push(value) {
    const n = new LinkedListNode(value);
    if (!this.head) {
      this.head = n;
      this.tail = n;
    } else {
      this.tail.next = n;
      this.tail = n;
    }
    this._size++;
  }
  shift() {
    if (!this.head) return null;
    const val = this.head.value;
    this.head = this.head.next;
    if (!this.head) this.tail = null;
    this._size--;
    return val;
  }
  isEmpty() {
    return this._size === 0;
  }
  size() {
    return this._size;
  }
  forEach(fn) {
    let cur = this.head;
    let i = 0;
    while (cur) {
      fn(cur.value, i);
      cur = cur.next;
      i++;
    }
  }
  toArray() { 
    const out = [];
    let cur = this.head;
    while (cur) {
      out.push(cur.value);
      cur = cur.next;
    }
    return out;
  }
  swap() {
    if (!this.head || !this.head.next) return;
    let prev = null;
    let cur = this.head;
    this.head = cur.next;
    while (cur && cur.next) {
      let next = cur.next;
      let nextPair = next.next;
      next.next = cur;
      cur.next = nextPair;
      if (prev) {
        prev.next = next;
      }
      prev = cur;
      cur = nextPair;
    }
  }
}