// scripts/runFases.js
import fetch from 'node-fetch';
import { Frase } from '../model/Frase.js';
import { PerformanceMonitor } from '../util/PerformanceMonitor.js';
import { medirPesoObjeto } from '../util/SpaceMonitor.js';

const ZENQUOTES_URL = 'https://zenquotes.io/api/quotes';

// para no saturar consola
const MAX_QUOTES = 5;
const MAX_WORDS_TO_SHOW = 40;

const normalizar = s => (s ?? '').replace(/\s+/g, ' ').trim();

async function getTexto() {
  try {
    const res = await fetch(ZENQUOTES_URL);
    const data = await res.json();
    const arr = Array.isArray(data) ? data : [];
    return normalizar(arr.slice(0, MAX_QUOTES).map(x => x.q).join(' '));
  } catch {
    return normalizar('Se produjo un error en la lectura de la API, esto es un texto de prueba, reintentar el run');
  }
}

export async function runFases() {
  const texto = await getTexto();

  // === Space (texto) ===
  medirPesoObjeto(texto, 'Texto original (normalizado)');

  // ===== Fase 1 =====
  const mon1 = new PerformanceMonitor('Fase1: encriptar');
  await mon1.inicio();
  const f = new Frase(texto);
  const encriptado = f.encriptar();
  await mon1.finalizado();

  console.log('=== FASE 1 ===');
  console.log('Texto original:', texto);
  console.log('Texto encriptado:', encriptado);

  const hasta1 = Math.min(f.deque.length, MAX_WORDS_TO_SHOW);
  for (let i = 0; i < hasta1; i++) {
    const nums = f.deque[i].toArray();
    const legible = nums.map(n => String.fromCharCode(n)).join('');
    console.log(`Palabra ${i + 1} (nums):`, nums);
    console.log(`Palabra ${i + 1} (encriptada legible):`, legible);
  }
  if (f.deque.length > MAX_WORDS_TO_SHOW) {
    console.log(`... (${f.deque.length - MAX_WORDS_TO_SHOW} palabras más omitidas)`);
  }

  // medir espacio del deque (se auto-guarda en space.log)
  medirPesoObjeto(f.deque, 'Deque de listas (F1)');

  // ===== Fase 2 =====
  const mon2 = new PerformanceMonitor('Fase2: desencriptar');
  await mon2.inicio();
  const detalle = f.desencriptar({ destructivo: false, retornarDetalle: true });
  await mon2.finalizado();

  console.log('\n=== FASE 2 ===');
  const hasta2 = Math.min(detalle.palabras.length, MAX_WORDS_TO_SHOW);
  for (let i = 0; i < hasta2; i++) {
    const p = detalle.palabras[i];
    console.log(`Palabra ${i + 1} (desencriptada nums):`, p.nums);
    console.log(`Palabra ${i + 1} (desencriptada legible):`, p.texto);
  }
  if (detalle.palabras.length > MAX_WORDS_TO_SHOW) {
    console.log(`... (${detalle.palabras.length - MAX_WORDS_TO_SHOW} palabras más omitidas)`);
  }

  console.log('\nTexto desencriptado:', detalle.textoCompleto);
  console.log('¿Coincide con el original normalizado?', detalle.textoCompleto === texto);

  // medir espacio del resultado (se auto-guarda)
  medirPesoObjeto(detalle, 'Detalle (F2)');
}
