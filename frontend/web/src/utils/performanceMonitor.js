// Performance monitoring utility
class PerformanceMonitor {
  constructor() {
    this.metrics = {};
    this.longTaskThreshold = 200; // Increased from 100ms
    this.unresponsiveThreshold = 10000; // Increased from 5000ms
    this.lastInteraction = Date.now();
    this.checkInterval = null;
    this.observers = [];
    this.isMonitoring = false;
    this.interactionEvents = ['mousedown', 'keydown', 'touchstart', 'scroll', 'mousemove'];
    this.lastWarningTime = 0;
    this.warningCooldown = 30000; // 30 seconds between warnings
    
    // Bind methods
    this.handleLongTask = this.handleLongTask.bind(this);
    this.handleInteraction = this.handleInteraction.bind(this);
    this.checkResponsiveness = this.checkResponsiveness.bind(this);
  }
  
  // Start monitoring
  start() {
    if (this.isMonitoring) return;
    
    // Set up PerformanceObserver for long tasks
    if ('PerformanceObserver' in window) {
      try {
        this.observer = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            this.handleLongTask(entry);
          }
        });
        this.observer.observe({ entryTypes: ['longtask'] });
      } catch (e) {
        console.warn('PerformanceObserver not supported', e);
      }
    }
    
    // Set up interaction listeners
    this.interactionEvents.forEach(event => {
      window.addEventListener(event, this.handleInteraction, { passive: true });
    });
    
    // Start responsiveness check
    this.checkInterval = setInterval(this.checkResponsiveness, 1000);
    this.isMonitoring = true;
    
    console.log('Performance monitoring started');
  }
  
  // Stop monitoring
  stop() {
    if (!this.isMonitoring) return;
    
    if (this.observer) {
      try {
        this.observer.disconnect();
      } catch (e) {
        console.warn('Error disconnecting observer:', e);
      }
    }
    
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
    
    // Remove all event listeners
    this.interactionEvents.forEach(event => {
      try {
        window.removeEventListener(event, this.handleInteraction);
      } catch (e) {
        console.warn(`Error removing ${event} listener:`, e);
      }
    });
    
    this.isMonitoring = false;
    console.log('Performance monitoring stopped');
  }
  
  // Handle long tasks
  handleLongTask(entry) {
    const duration = entry.duration;
    if (duration >= this.longTaskThreshold) {
      console.warn(`Long task detected: ${duration.toFixed(2)}ms`);
      this.notifyObservers({
        type: 'LONG_TASK',
        duration,
        timestamp: Date.now(),
        entry
      });
    }
  }
  
  // Handle user interaction
  handleInteraction() {
    const now = Date.now();
    this.lastInteraction = now;
    
    // Reset warning time if user is interacting
    if (now - this.lastWarningTime < this.warningCooldown) {
      this.lastWarningTime = 0;
    }
  }
  
  // Check if the page is responsive
  checkResponsiveness() {
    const now = Date.now();
    const timeSinceLastInteraction = now - this.lastInteraction;
    const timeSinceLastWarning = now - this.lastWarningTime;
    
    if (timeSinceLastInteraction > this.unresponsiveThreshold && 
        timeSinceLastWarning > this.warningCooldown) {
      
      console.warn(`Page potentially unresponsive for ${timeSinceLastInteraction}ms`);
      this.lastWarningTime = now;
      
      // Only notify observers if we haven't warned recently
      this.notifyObservers({
        type: 'UNRESPONSIVE',
        duration: timeSinceLastInteraction,
        timestamp: now,
        lastInteraction: this.lastInteraction
      });
      
      // Try to recover by forcing garbage collection (if available)
      if (window.gc) {
        try {
          window.gc();
          console.log('Forced garbage collection');
        } catch (e) {
          console.warn('Failed to force garbage collection:', e);
        }
      }
    }
  }
  
  // Add observer
  addObserver(callback) {
    if (typeof callback === 'function') {
      this.observers.push(callback);
    }
    return () => this.removeObserver(callback);
  }
  
  // Remove observer
  removeObserver(callback) {
    this.observers = this.observers.filter(obs => obs !== callback);
  }
  
  // Notify all observers
  notifyObservers(data) {
    this.observers.forEach(observer => {
      try {
        observer(data);
      } catch (e) {
        console.error('Error in performance observer', e);
      }
    });
  }
  
  // Get current metrics
  getMetrics() {
    return {
      timeSinceLastInteraction: Date.now() - this.lastInteraction,
      isMonitoring: this.isMonitoring,
      longTaskThreshold: this.longTaskThreshold,
      unresponsiveThreshold: this.unresponsiveThreshold
    };
  }
}

// Create a singleton instance
const performanceMonitor = new PerformanceMonitor();

// Export the instance and the class
export { performanceMonitor, PerformanceMonitor };

// Performance monitoring is completely disabled
// To enable, uncomment the code below and call performanceMonitor.start() manually when needed
/*
if (import.meta.env.DEV) {
  // Start with a small delay to avoid capturing initial load
  setTimeout(() => {
    performanceMonitor.start();
    
    // Log performance metrics periodically
    setInterval(() => {
      const metrics = performanceMonitor.getMetrics();
      console.log('Performance metrics:', metrics);
    }, 30000); // Log every 30 seconds
  }, 5000);
}
*/

// Add global error handler for uncaught exceptions
if (typeof window !== 'undefined') {
  window.addEventListener('error', (event) => {
    console.error('Uncaught error:', event.error || event.message || event);
    performanceMonitor.notifyObservers({
      type: 'UNCAUGHT_ERROR',
      error: event.error || event.message || event,
      timestamp: Date.now()
    });
  });
}
