// Comprehensive Error Handling Utility

// Custom Error Classes
export class AuthenticationError extends Error {
  constructor(message, code, details = {}) {
    super(message);
    this.name = 'AuthenticationError';
    this.code = code;
    this.details = details;
    this.timestamp = new Date().toISOString();
  }
}

export class NetworkError extends Error {
  constructor(message, code, details = {}) {
    super(message);
    this.name = 'NetworkError';
    this.code = code;
    this.details = details;
    this.timestamp = new Date().toISOString();
  }
}

// Advanced Logging Utility
export const Logger = {
  // Log levels
  LEVELS: {
    ERROR: 'ERROR',
    WARN: 'WARN',
    INFO: 'INFO',
    DEBUG: 'DEBUG'
  },

  // Persistent log storage
  _logs: [],
  _maxLogs: 100,

  // Core logging method
  _log(level, message, context = {}) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      context,
      // Optional: add current route or component context
      route: window.location.pathname
    };

    // Store in memory
    this._logs.push(logEntry);

    // Limit log storage
    if (this._logs.length > this._maxLogs) {
      this._logs.shift();
    }

    // Console output based on log level
    switch(level) {
      case this.LEVELS.ERROR:
        console.error(JSON.stringify(logEntry, null, 2));
        break;
      case this.LEVELS.WARN:
        console.warn(JSON.stringify(logEntry, null, 2));
        break;
      case this.LEVELS.INFO:
        console.info(JSON.stringify(logEntry, null, 2));
        break;
      case this.LEVELS.DEBUG:
        console.debug(JSON.stringify(logEntry, null, 2));
        break;
    }

    // Optional: Persist logs to localStorage
    try {
      localStorage.setItem('app_logs', JSON.stringify(this._logs));
    } catch (storageError) {
      console.error('Failed to persist logs', storageError);
    }
  },

  // Public logging methods
  error(message, context = {}) {
    this._log(this.LEVELS.ERROR, message, context);
  },

  warn(message, context = {}) {
    this._log(this.LEVELS.WARN, message, context);
  },

  info(message, context = {}) {
    this._log(this.LEVELS.INFO, message, context);
  },

  debug(message, context = {}) {
    this._log(this.LEVELS.DEBUG, message, context);
  },

  // Retrieve logs
  getLogs(limit = 50) {
    return this._logs.slice(-limit);
  },

  // Clear logs
  clearLogs() {
    this._logs = [];
    localStorage.removeItem('app_logs');
  }
};

// Error Analysis Utility
export const ErrorAnalyzer = {
  // Categorize and analyze errors
  categorizeError(error) {
    if (error instanceof AuthenticationError) {
      return {
        type: 'AUTHENTICATION',
        severity: this._determineSeverity(error.code),
        recoverable: this._isRecoverable(error.code)
      };
    }

    if (error instanceof NetworkError) {
      return {
        type: 'NETWORK',
        severity: this._determineSeverity(error.code),
        recoverable: this._isRecoverable(error.code)
      };
    }

    return {
      type: 'UNKNOWN',
      severity: 'HIGH',
      recoverable: false
    };
  },

  // Determine error severity
  _determineSeverity(errorCode) {
    const severityMap = {
      // Authentication Errors
      'AUTH_INVALID_CREDENTIALS': 'HIGH',
      'AUTH_TOKEN_EXPIRED': 'MEDIUM',
      'AUTH_UNAUTHORIZED': 'HIGH',

      // Network Errors
      'NETWORK_TIMEOUT': 'MEDIUM',
      'NETWORK_UNREACHABLE': 'HIGH',
      'NETWORK_CONNECTION_LOST': 'HIGH'
    };

    return severityMap[errorCode] || 'LOW';
  },

  // Check if error is recoverable
  _isRecoverable(errorCode) {
    const recoverableErrors = [
      'AUTH_TOKEN_EXPIRED',
      'NETWORK_TIMEOUT',
      'NETWORK_CONNECTION_LOST'
    ];

    return recoverableErrors.includes(errorCode);
  }
};

// Global Error Handler
export const globalErrorHandler = (error, context = {}) => {
  // Log the error
  Logger.error('Unhandled Error', {
    ...context,
    errorName: error.name,
    errorMessage: error.message,
    errorStack: error.stack
  });

  // Analyze the error
  const analysis = ErrorAnalyzer.categorizeError(error);

  // Potential error recovery or reporting
  if (analysis.recoverable) {
    // Implement recovery logic
    switch(analysis.type) {
      case 'AUTHENTICATION':
        // Attempt token refresh or re-authentication
        break;
      case 'NETWORK':
        // Retry network request
        break;
    }
  }

  // Optional: Report to error tracking service
  // reportErrorToService(error, analysis);
};

// Removed global error handlers to prevent conflicts with React error boundaries
// Use React error boundaries instead of global error handlers
