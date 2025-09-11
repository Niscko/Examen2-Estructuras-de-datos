import { runFases } from './service/EncryptService.js';
import { logger } from './util/Log4js.js';
import { PerformanceMonitor } from './util/PerformanceMonitor.js';

const pm = new PerformanceMonitor('PerformanceMonitor');

async function main() {


  logger.info('Iniciando proceso de encriptacion...');
  await pm.inicio();
  await runFases();
  await pm.finalizado();
  logger.info('Proceso finalizado con exito...');
}

main();