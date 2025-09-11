// Script que genera textos de distintos tamaños y mide el costo de estos
// encriptar y desencriptar con la clase Frase. Exporta resultados a CSV.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Frase } from '../model/Frase.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

// Tamaños (en palabras) y repeticiones para promediar
const SIZES = [100, 250, 500, 750, 1000, 2500, 5000, 7500, 10000];
const REPEATS = 5; 

// Entero aleatorio uniforme en [a, b]
function randInt(a, b) { return Math.floor(Math.random() * (b - a + 1)) + a; }

// Genera una palabra aleatoria de 3 a 10 letras minúsculas
function randomWord() {
  const len = randInt(3, 10);
  let s = '';
  for (let i = 0; i < len; i++) s += String.fromCharCode(97 + randInt(0, 25));
  return s;
}

// Arma un texto con nWords palabras separadas por espacios
function makeText(nWords) {
  const arr = new Array(nWords).fill(0).map(() => randomWord());
  return arr.join(' ');
}

// Mide tiempo transcurrido y %CPU del proceso mientras se ejecuta fn()
function measure(fn) {
  const startUsage = process.cpuUsage();
  const t0 = process.hrtime.bigint();

  fn();

  const t1 = process.hrtime.bigint();
  const diffUsage = process.cpuUsage(startUsage);

  const elapsedMs = Number(t1 - t0) / 1e6;
  const cpuMs = (diffUsage.user + diffUsage.system) / 1000;
  const cpuPercent = elapsedMs > 0 ? (cpuMs / elapsedMs) * 100 : 0;

  return { elapsedMs, cpuPercent };
}

// Ejecuta una encriptación y su desencriptación sobre el mismo texto
function runOnce(texto) {
  const f = new Frase(texto);
  f.encriptar();
  f.desencriptar({ destructivo: false });
}

// Recorre cada tamaño, promedia métricas y arma filas de resultados
const rows = [];
for (const nWords of SIZES) {
  const texto = makeText(nWords);
  const nChars = texto.length;

  let sumMs = 0;
  let sumCpu = 0;

  for (let r = 0; r < REPEATS; r++) {
    const { elapsedMs, cpuPercent } = measure(() => runOnce(texto));
    sumMs += elapsedMs;
    sumCpu += cpuPercent;
  }

  const avgMs = +(sumMs / REPEATS).toFixed(2);
  const avgCpu = +(sumCpu / REPEATS).toFixed(2);

  rows.push({
    palabras: nWords,
    caracteres: nChars,
    tiempo_ms_prom: avgMs,
    cpu_porcentaje_prom: avgCpu,
  });
}

// Muestra una tabla legible en consola
console.log('\nResultados del experimento (REPEATS =', REPEATS, '):\n');
const pretty = rows.map(r => ({
  'Cantidad de palabras': r.palabras,
  'Cantidad de Caracteres': r.caracteres,
  'Tiempo de respuesta promedio(ms)': r.tiempo_ms_prom,
  '% de CPU del proceso': r.cpu_porcentaje_prom,
}));
console.table(pretty);

// Guarda también los resultados en CSV junto al script
const csvHeader = [
  'Cantidad de palabras',
  'Cantidad de Caracteres',
  'Tiempo de respuesta promedio(ms)',
  '% de CPU del proceso',
].join(',');

const csvBody = rows.map(r =>
  [r.palabras, r.caracteres, r.tiempo_ms_prom, r.cpu_porcentaje_prom].join(',')
).join('\n');

const csv = csvHeader + '\n' + csvBody;
const outPath = path.join(__dirname, 'experimentos.csv');
fs.writeFileSync(outPath, csv, 'utf8');
console.log('CSV guardado en:', outPath);
