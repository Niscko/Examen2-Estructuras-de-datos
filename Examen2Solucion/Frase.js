import { LinkedList } from './LinkedList.js';

export class Frase {
  constructor(texto) {
    this.textoOriginal = texto ?? "";
    this.deque = [];            // ArrayDeque de palabras
    this._textoEncriptado = ""; // Vista legible
  }
  encriptar() {
    const palabras = this.textoOriginal.split(/\s+/).filter(Boolean);
    this.deque = [];
    for (const palabra of palabras) {
      const lista = new LinkedList();
      let inc = 1;
      for (const ch of palabra) {
        lista.push(ch.charCodeAt(0) + inc);
        inc += 2;
      }
      lista.swap();
      this.deque.push(lista);
    }
    this._textoEncriptado = this.deque
      .map(lista => lista.toArray().map(n => String.fromCharCode(n)).join(""))
      .join(" ");
    return this._textoEncriptado;
  }
  get textoEncriptado() { return this._textoEncriptado; }
}