// util/SpaceMonitor.js
import v8 from 'v8';
import { spaceLogger } from './Log4js.js';

// --- helpers ---
const isObj = v => v !== null && (typeof v === 'object' || typeof v === 'function');
const isPrimitive = v => v === null || (typeof v !== 'object' && typeof v !== 'function');

function typeOf(x) {
  if (x === null) return 'null';
  if (Buffer.isBuffer(x)) return 'Buffer';
  if (Array.isArray(x)) return 'Array';
  if (ArrayBuffer.isView(x)) return x.constructor.name;
  return Object.prototype.toString.call(x).slice(8, -1); // "String","Object",...
}

const previewVal = v => {
  const t = typeof v;
  if (t === 'string')  return JSON.stringify(v.length > 18 ? v.slice(0,18)+'…' : v);
  if (t === 'number' || t === 'boolean' || t === 'bigint') return String(v);
  if (Buffer.isBuffer(v))    return `<Buffer ${v.byteLength}b>`;
  if (ArrayBuffer.isView(v)) return `<${v.constructor.name} ${v.byteLength}b>`;
  if (Array.isArray(v))      return `[Array(${v.length})]`;
  if (v === null)            return 'null';
  if (t === 'function')      return '[Function]';
  return `(${typeOf(v)})`;
};

function deepSize(val, seen = new WeakSet()) {
  const t = typeof val;
  if (t === 'string')  return Buffer.byteLength(val, 'utf8');
  if (t === 'number')  return 8;
  if (t === 'boolean') return 4;
  if (t === 'bigint')  return 8;
  if (t === 'undefined' || t === 'symbol' || t === 'function' || val === null) return 0;

  if (Buffer.isBuffer(val))       return val.byteLength;
  if (ArrayBuffer.isView(val))    return val.byteLength;
  if (val instanceof ArrayBuffer) return val.byteLength;

  if (!isObj(val)) return 0;
  if (seen.has(val)) return 0;
  seen.add(val);

  let bytes = 32;
  if (val instanceof Date)   return bytes + 8;
  if (val instanceof RegExp) return bytes + Buffer.byteLength(val.source, 'utf8');

  if (val instanceof Map) { for (const [k,v] of val) bytes += deepSize(k,seen)+deepSize(v,seen); return bytes; }
  if (val instanceof Set) { for (const v of val) bytes += deepSize(v,seen); return bytes; }
  if (Array.isArray(val))   { bytes += val.length*8; for (const it of val) bytes += deepSize(it,seen); return bytes; }

  for (const k of Object.keys(val)) {
    bytes += 8;
    bytes += Buffer.byteLength(k,'utf8');
    bytes += deepSize(val[k], seen);
  }
  return bytes;
}

function layoutInterno(obj, title = `${typeOf(obj)} object internals:`) {
  const lines = [];
  lines.push('|====== Layout Interno ======|');
  lines.push(title);
  lines.push('OFF  SZ                        TYPE DESCRIPTION               VALUE');

  let off = 0;
  const push = (sz, typ, desc, val) => {
    lines.push(`${String(off).padStart(3)}  ${String(sz).padStart(2)}  ${typ.padEnd(24)} ${desc.padEnd(25)} ${val}`);
    off += sz;
  };

  push(8, '(object header: pseudo)', '-', '-');


  if (isPrimitive(obj)) {
    let sz = 0;
    switch (typeof obj) {
      case 'string':  sz = Buffer.byteLength(obj, 'utf8'); break;
      case 'number':  sz = 8; break;
      case 'boolean': sz = 4; break;
      case 'bigint':  sz = 8; break;
      default:        sz = 0;
    }
    push(sz, typeof obj, 'value', previewVal(obj));
    lines.push(`Instance size (estimated): ${off} bytes`);
    lines.push('Space losses: n/a (JS runtime)');
    return lines.join('\n');
  }

  const visit = (val, path) => {
    const T = typeOf(val);
    if (T === 'Object') {
      for (const k of Object.keys(val)) push(8, typeOf(val[k]), `${path}.${k}`.slice(0,25), previewVal(val[k]));
    } else if (T === 'Array') {
      for (let i = 0; i < val.length; i++) push(8, typeOf(val[i]), `${path}[${i}]`.slice(0,25), previewVal(val[i]));
    } else if (T === 'Map') {
      let i=0; for (const [k,v] of val) { push(8, typeOf(k), `${path}.<key#${i}>`.slice(0,25), previewVal(k));
                                          push(8, typeOf(v), `${path}.<val#${i}>`.slice(0,25), previewVal(v)); i++; }
    } else if (T === 'Set') {
      let i=0; for (const v of val) { push(8, typeOf(v), `${path}[${i}]`.slice(0,25), previewVal(v)); i++; }
    }
  };
  
  visit(obj, typeOf(obj));

  lines.push(`Instance size (estimated): ${off} bytes`);
  lines.push('Space losses: n/a (JS runtime)');
  return lines.join('\n');
}

function layoutReferencias(obj) {
  const lines = [];
  lines.push('|====== Layout con Referencias ======|');

  if (isPrimitive(obj)) {
    const label = `${typeOf(obj)}@1`;
    const addr  = (0x700000000 + 0x1000).toString(16);
    lines.push(`${typeOf(obj)} value (primitive):`);
    lines.push('      ADDRESS       SIZE TYPE                 PATH                           VALUE');
    lines.push(`        ${addr.padEnd(12)}     - ${label.padEnd(21)} (node)`);
    lines.push('');
    lines.push('Primitives have no reference edges.');
    return lines.join('\n');
  }

  const seen = new WeakMap(); let id = 1; const nodes=[]; const edges=[];
  const nid = (o) => { if (!seen.has(o)) { seen.set(o,id++); nodes.push({ id: seen.get(o), label: `${typeOf(o)}@${seen.get(o)}` }); } return seen.get(o); };
  const visit = (val, path='root') => {
    if (!isObj(val)) return;
    const from = nid(val);

    if (val instanceof Map) {
      let i=0;
      for (const [k,v] of val) {
        if (isObj(k)) { const t=nid(k); edges.push({ from, to:t, label:`${path}.<key#${i}>` }); visit(k, `${path}.<key#${i}>`); }
        if (isObj(v)) { const t=nid(v); edges.push({ from, to:t, label:`${path}.<val#${i}>` }); visit(v, `${path}.<val#${i}>`); }
        i++;
      }
      return;
    }
    if (val instanceof Set) {
      let i=0; for (const v of val) if (isObj(v)) { const t=nid(v); edges.push({ from, to:t, label:`${path}[${i}]` }); visit(v, `${path}[${i}]`); i++; }
      return;
    }
    if (Array.isArray(val)) {
      for (let i=0;i<val.length;i++){ const v=val[i]; if (isObj(v)) { const t=nid(v); edges.push({ from, to:t, label:`${path}[${i}]` }); visit(v, `${path}[${i}]`); } }
      return;
    }
    for (const k of Object.keys(val)) {
      const v = val[k];
      if (isObj(v)) { const t=nid(v); edges.push({ from, to:t, label:`${path}.${k}` }); visit(v, `${path}.${k}`); }
    }
  };
  visit(obj);

  const addr = i => (0x700000000 + i*0x1000).toString(16);
  lines.push(`${typeOf(obj)} object externals (pseudo):`);
  lines.push('      ADDRESS       SIZE TYPE                 PATH                           VALUE');
  for (const n of nodes)  lines.push(`        ${addr(n.id).padEnd(12)}     - ${n.label.padEnd(21)} (node)`);
  for (const e of edges)  lines.push(`edge node#${e.from} -> node#${e.to} ${e.label}`);
  lines.push('\nAddresses are pseudo (V8 does not expose real addresses).');
  return lines.join('\n');
}

function layoutTotal(obj) {
  return `|====== Tamaño total en memoria ======|\n${deepSize(obj)} bytes`;
}

export function medirPesoObjeto(obj, titulo) {
  const rep = `${layoutInterno(obj, titulo)}\n\n${layoutReferencias(obj)}\n\n${layoutTotal(obj)}`;
  spaceLogger.info(rep);
  return rep;
}

export const snapSizes = obj => ({
  v8SerializedBytes: v8.serialize(obj).length,
  jsonBytes: Buffer.byteLength(JSON.stringify(obj), 'utf8'),
  deepEstimatedBytes: deepSize(obj)
});
