// Enhanced logging utility for cross-browser compatibility
export const createLogger = (moduleName) => {
  const logLevels = {
    ERROR: 0,
    WARN: 1,
    INFO: 2,
    DEBUG: 3
  };

  const currentLogLevel = localStorage.getItem('logLevel') 
    ? parseInt(localStorage.getItem('logLevel'), 10) 
    : logLevels.INFO;

  const formatMessage = (level, message, ...args) => {
    const timestamp = new Date().toISOString();
    const formattedArgs = args.map(arg => 
      typeof arg === 'object' ? JSON.stringify(arg) : arg
    );
    return `[${timestamp}] [${moduleName}] [${level}] ${message} ${formattedArgs.join(' ')}`;
  };

  const log = (level, message, ...args) => {
    if (level <= currentLogLevel) {
      const fullMessage = formatMessage(
        Object.keys(logLevels).find(key => logLevels[key] === level), 
        message, 
        ...args
      );

      // Console logging
      switch (level) {
        case logLevels.ERROR:
          console.error(fullMessage);
          break;
        case logLevels.WARN:
          console.warn(fullMessage);
          break;
        case logLevels.INFO:
          console.info(fullMessage);
          break;
        case logLevels.DEBUG:
          console.debug(fullMessage);
          break;
      }

      // Optional: Send logs to a server or store in localStorage
      try {
        const logs = JSON.parse(localStorage.getItem('appLogs') || '[]');
        logs.push(fullMessage);
        // Keep only last 100 logs
        localStorage.setItem('appLogs', JSON.stringify(logs.slice(-100)));
      } catch (error) {
        console.error('Failed to store logs', error);
      }
    }
  };

  return {
    error: (message, ...args) => log(logLevels.ERROR, message, ...args),
    warn: (message, ...args) => log(logLevels.WARN, message, ...args),
    info: (message, ...args) => log(logLevels.INFO, message, ...args),
    debug: (message, ...args) => log(logLevels.DEBUG, message, ...args),
    
    // Utility to view stored logs
    viewLogs: () => {
      try {
        return JSON.parse(localStorage.getItem('appLogs') || '[]');
      } catch {
        return [];
      }
    },

    // Set log level dynamically
    setLogLevel: (level) => {
      if (level in logLevels) {
        localStorage.setItem('logLevel', logLevels[level]);
      }
    }
  };
};
