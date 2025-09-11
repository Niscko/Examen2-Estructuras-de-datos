// util/Log4js.js
import fs from 'fs';
import path from 'path';
import log4js from 'log4js';

const LOG_DIR = process.env.LOG_DIR || 'logs';
fs.mkdirSync(LOG_DIR, { recursive: true });

log4js.configure({
  appenders: {
    systemFile:     { type: 'dateFile', filename: path.join(LOG_DIR, 'system.log'),     pattern: 'yyyy-MM-dd', keepFileExt: true, daysToKeep: 14, compress: true },
    timesFile:      { type: 'dateFile', filename: path.join(LOG_DIR, 'times.log'),      pattern: 'yyyy-MM-dd', keepFileExt: true, daysToKeep: 14, compress: true },
    performanceFile:{ type: 'dateFile', filename: path.join(LOG_DIR, 'performance.log'),pattern: 'yyyy-MM-dd', keepFileExt: true, daysToKeep: 14, compress: true },
    spaceFile:      { type: 'dateFile', filename: path.join(LOG_DIR, 'space.log'),      pattern: 'yyyy-MM-dd', keepFileExt: true, daysToKeep: 14, compress: true },
    appFile:        { type: 'dateFile', filename: path.join(LOG_DIR, 'app.log'),        pattern: 'yyyy-MM-dd', keepFileExt: true, daysToKeep: 14, compress: true }
  },
  categories: {
    // SIN 'stdout': nada en consola
    default:     { appenders: ['appFile'],        level: 'info' },
    system:      { appenders: ['systemFile'],     level: 'info' },
    times:       { appenders: ['timesFile'],      level: 'info' },
    performance: { appenders: ['performanceFile'],level: 'info' },
    space:       { appenders: ['spaceFile'],      level: 'info' }
  }
});

export const appLogger   = log4js.getLogger();              // app.log
export const systemLogger= log4js.getLogger('system');      // system.log
export const timesLogger = log4js.getLogger('times');       // times.log
export const perfLogger  = log4js.getLogger('performance'); // performance.log
export const spaceLogger = log4js.getLogger('space');       // space.log
export const logger      = appLogger;                  

process.on('SIGINT',     async () => { await log4js.shutdown(); process.exit(0); });
process.on('beforeExit', async () => { await log4js.shutdown(); });
