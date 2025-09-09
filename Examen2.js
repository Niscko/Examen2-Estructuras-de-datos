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
}

const url = 'https://zenquotes.io/api/quotes';

let si = "";

async function obtenerQuotes() {
  const response = await fetch(url);
  const data = await response.json();
  si = data.map(item => item.q).join(' ');
  procesar(si);
}

function procesar(si) {
  const arrayDeque = [];
  const palabras = si.split(" ");
  palabras.forEach(palabra => {
    const lista = new LinkedList();
    let incremento = 1;
    for (const letra of palabra) {
      let valor = letra.charCodeAt(0) + incremento;
      lista.push(valor);
      incremento += 2;
    }
    arrayDeque.push(lista);
  });
  arrayDeque.forEach((lista, pos) => {
    console.log(`Palabra ${pos + 1}:`, lista.toArray());
    const palabra = lista.toArray().map(num => String.fromCharCode(num)).join('');
    console.log(`Palabra ${pos + 1} desencriptada:`, palabra);
  });
}

obtenerQuotes();

