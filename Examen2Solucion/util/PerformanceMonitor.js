// util/PerformanceMonitor.js
import os from 'os';
import si from 'systeminformation';
import { perfLogger } from './Log4js.js';

const fmt = (n, d = 2) => Number.isFinite(n) ? n.toFixed(d) : '0.00';

export class PerformanceMonitor {
  constructor(nombreProceso) {
    this.nombre = nombreProceso ?? 'proceso';
    this.t0 = 0; this.t1 = 0;
    this.cpuStart = null;
    this.cpuPctProceso = 0;
    this.cpuSis0 = 0; this.cpuSis1 = 0;
    this.memProc0 = 0; this.memProc1 = 0;
    this.memFisicaTotal = 0; this.memFisicaUsada = 0;
    this.hilos = null;
    this.osInfo = null;
    this.lines = [];
  }

  bytesToMB(b){ return b/(1024*1024); }

  async inicio() {
    this.t0 = Date.now();
    this.memProc0 = process.memoryUsage().rss;
    this.cpuStart = process.cpuUsage();

    let load = null;
    try { load = await si.currentLoad(); } catch {}
    this.cpuSis0 = Number.isFinite(load?.currentload) ? load.currentload : 0;

    this.osInfo = await si.osInfo().catch(() => null);
    const mem = await si.mem().catch(() => ({ total:0, available:0 }));
    this.memFisicaTotal = mem.total;
    this.memFisicaUsada = mem.total - mem.available;

    this.lines.push(
      `\n=== ${this.nombre} : INICIO ===`,
      `Mem proceso inicio: ${Math.round(this.bytesToMB(this.memProc0))} MB`,
      `CPU sistema inicio: ${fmt(this.cpuSis0)} %`
    );
  }

  async finalizado() {
    this.t1 = Date.now();
    this.memProc1 = process.memoryUsage().rss;

    const delta = process.cpuUsage(this.cpuStart);
    const elapsedMs = Math.max(1, this.t1 - this.t0);
    const cores = os.cpus()?.length || 1;
    const us = delta.user + delta.system;
    this.cpuPctProceso = (us / (elapsedMs * 1000 * cores)) * 100;

    let load2 = null;
    try { load2 = await si.currentLoad(); } catch {}
    this.cpuSis1 = Number.isFinite(load2?.currentload) ? load2.currentload : 0;

    const mem2 = await si.mem().catch(() => ({ total:0, available:0 }));
    this.memFisicaUsada = mem2.total - mem2.available;

    try {
      const plist = await si.processes();
      const me = plist.list.find(p => p.pid === process.pid);
      this.hilos = me?.threads ?? null;
    } catch { this.hilos = null; }

    const dMem = this.memProc1 - this.memProc0;
    const dCpuSis = this.cpuSis1 - this.cpuSis0;

    this.lines.push(
      `Mem proceso final : ${Math.round(this.bytesToMB(this.memProc1))} MB`,
      `CPU sistema final : ${fmt(this.cpuSis1)} %`,
      `Δ Mem proceso     : ${Math.round(this.bytesToMB(dMem))} MB`,
      `Δ CPU sistema     : ${fmt(dCpuSis)} %`,
      `%CPU del proceso  : ${fmt(this.cpuPctProceso)} %`,
      `Tiempo ejecución  : ${this.t1 - this.t0} ms`,
      `Mem física total  : ${Math.round(this.bytesToMB(mem2.total))} MB`,
      `Mem física usada  : ${Math.round(this.bytesToMB(this.memFisicaUsada))} MB`,
      `Hilos del proceso : ${this.hilos ?? 'N/D'}`,
      `SO                : ${this.osInfo?.distro ?? ''} ${this.osInfo?.release ?? ''}`,
      `=== ${this.nombre} : FIN ===\n`
    );

    perfLogger.info(this.lines.join('\n'));
  }
}
