export class Logger {
  static log(message: string, data?: any) {
    console.log(`[Login] ${message}`, data);
  }

  static error(message: string, error?: any) {
    console.error(`[Login Error] ${message}`, error);
  }
}
