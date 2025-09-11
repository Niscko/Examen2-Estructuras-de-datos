export class LinkedListNode {
  // Nodo simple con un valor y referencia al siguiente nodo
  constructor(value) {
    this.value = value;
    this.next = null;
  }
}
export class LinkedList {
  // Lista enlazada simple para almacenar números de cada palabra
  constructor() {
    this.head = null;
    this.tail = null;
    this._size = 0;
  }
  // Agrega un nodo al final
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
  // Extrae y devuelve el primer valor; null si está vacía
  shift() {
    if (!this.head) return null;
    const val = this.head.value;
    this.head = this.head.next;
    if (!this.head) this.tail = null;
    this._size--;
    return val;
  }
  // Indica si no hay elementos
  isEmpty() {
    return this._size === 0;
  }
  // Cantidad de elementos
  size() {
    return this._size;
  }
  // Recorre la lista ejecutando una función por cada valor
  forEach(fn) {
    let cur = this.head;
    let i = 0;
    while (cur) {
      fn(cur.value, i);
      cur = cur.next;
      i++;
    }
  }
  // Convierte la lista a arreglo de valores
  toArray() { 
    const out = [];
    let cur = this.head;
    while (cur) {
      out.push(cur.value);
      cur = cur.next;
    }
    return out;
  }
  // Intercambia pares consecutivos de nodos: (a,b,c,d,...) -> (b,a,d,c,...)
  // Se usa como paso de mezcla en la fase de encriptación
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