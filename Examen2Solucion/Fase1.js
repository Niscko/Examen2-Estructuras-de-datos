import fetch from 'node-fetch';
import { Frase } from './Frase.js';

// API
const ZENQUOTES_URL = "https://zenquotes.io/api/quotes";

async function fase1() {
  try {
    const res = await fetch(ZENQUOTES_URL);
    const data = await res.json();
    const texto = (Array.isArray(data) && data.length > 0)
      ? data.map(item => item.q).join(" ")
      : "ERROR API";
    const f = new Frase(texto);
    const encriptado = f.encriptar();
    console.log("Texto original:", texto);
    console.log("Texto encriptado:", encriptado);
    f.deque.forEach((lista, i) => {
      console.log(`Palabra ${i + 1} (nums):`, lista.toArray());
      console.log(`Palabra ${i + 1} (encriptada legible):`, lista.toArray().map(n => String.fromCharCode(n)).join(""));
    });
  } catch (e) {
    const texto = "Se produjo un error en la lectura de la API, esto es un texo de prueba, reintentar el run";
    const f = new Frase(texto);
    const encriptado = f.encriptar();
    console.log("Texto original:", texto);
    console.log("Texto encriptado:", encriptado);
    f.deque.forEach((lista, i) => {
      console.log(`Palabra ${i + 1} (nums):`, lista.toArray());
      console.log(`Palabra ${i + 1} (encriptada legible):`, lista.toArray().map(n => String.fromCharCode(n)).join(""));
    });
  }
}

fase1();