// Clase que modela una frase con capacidad de encriptar y
// desencriptar palabra por palabra usando una lista enlazada.
import { LinkedList } from './LinkedList.js';
import { systemLogger, timesLogger } from '../util/Log4js.js';

export class Frase {
  // Inicializa el texto y las estructuras internas
  constructor(texto) {
    this.textoOriginal = texto ?? '';
    this.deque = [];
    this._textoEncriptado = '';
    this._textoDesencriptado = '';
  }

  // ===== FASE 1 =====
  // Encripta cada palabra:
  // 1) A cada carácter se le suma una secuencia de impares creciente a su código.
  // 2) Se aplica una rotación por pares (swap) sobre la lista enlazada.
  // Devuelve el texto completo encriptado.
  encriptar() {
    const palabras = this.textoOriginal.split(/\s+/).filter(Boolean);
    this.deque = [];

    systemLogger.info(`[F1] INICIO  palabras=${palabras.length}`);

    const t0 = Date.now();
    let totalNodos = 0;

    for (let i = 0; i < palabras.length; i++) {
      const p = palabras[i];
      const a0 = Date.now();
      const lista = new LinkedList();

      let inc = 1;
      for (const ch of p) { lista.push(ch.charCodeAt(0) + inc); inc += 2; totalNodos++; }
      const a1 = Date.now();

      lista.swap();                   // rotación por punteros
      const a2 = Date.now();

      this.deque.push(lista);

      timesLogger.info(`[F1] palabra_${i+1} ascii+impares=${a1-a0}ms swap=${a2-a1}ms total=${a2-a0}ms len=${p.length}`);
    }

    this._textoEncriptado = this.deque
      .map(lista => lista.toArray().map(n => String.fromCharCode(n)).join(''))
      .join(' ');

    const t1 = Date.now();
    timesLogger.info(`[F1] total=${t1-t0}ms nodos=${totalNodos} palabras=${palabras.length}`);
    systemLogger.info(`[F1] FIN resumen: palabras=${palabras.length} nodos=${totalNodos}`);

    return this._textoEncriptado;
  }

  get textoEncriptado() { return this._textoEncriptado; }

  // ===== FASE 2 =====
  // Desencripta revirtiendo el proceso de FASE 1:
  // - Se vuelve a aplicar swap para recuperar el orden.
  // - Se resta la misma secuencia de impares para reconstruir el texto.
  // Si retornarDetalle = true, devuelve también el desglose por palabra.
  desencriptar({ destructivo = false, retornarDetalle = false } = {}) {
    systemLogger.info(`[F2] INICIO  deque_size=${this.deque.length}`);

    const palabrasDet = [];
    const getLista = (i) => (destructivo ? this.deque.shift() : this.deque[i]);
    const limite = destructivo ? Infinity : this.deque.length;

    const t0 = Date.now();
    let i = 0, totalNodos = 0;

    while ((destructivo && this.deque.length > 0) || (!destructivo && i < limite)) {
      const b0 = Date.now();
      const lista = getLista(i); i++;

      const b1 = Date.now();
      lista.swap();   // revertir rotación
      const b2 = Date.now();

      let inc = 1; const nums = [];
      lista.forEach(v => { nums.push(v - inc); inc += 2; totalNodos++; });
      const texto = nums.map(n => String.fromCharCode(n)).join('');
      const b3 = Date.now();

      palabrasDet.push({ nums, texto });
      timesLogger.info(`[F2] palabra_${i} extraccion=${b1-b0}ms swap_back=${b2-b1}ms resta=${b3-b2}ms total=${b3-b0}ms`);
    }

    this._textoDesencriptado = palabrasDet.map(p => p.texto).join(' ');

    const t1 = Date.now();
    timesLogger.info(`[F2] total=${t1-t0}ms palabras=${palabrasDet.length} nodos=${totalNodos}`);
    systemLogger.info(`[F2] FIN resumen: palabras=${palabrasDet.length} nodos=${totalNodos}`);

    if (retornarDetalle) return { palabras: palabrasDet, textoCompleto: this._textoDesencriptado };
    return this._textoDesencriptado;
  }

  // Último resultado de desencriptado disponible
  get textoDesencriptado() { return this._textoDesencriptado; }
}
