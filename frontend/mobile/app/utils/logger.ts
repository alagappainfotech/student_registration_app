export class Logger {
  static info(message: string, ...args: any[]) {
    console.log('[INFO]', message, ...args);
  }

  static error(message: string, error?: any) {
    console.error('[ERROR]', message, error);
  }

  static debug(message: string, ...args: any[]) {
    console.debug('[DEBUG]', message, ...args);
  }

  static log(message: string, ...args: any[]) {
    console.log('[LOG]', message, ...args);
  }
}
