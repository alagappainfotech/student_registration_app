import React, { StrictMode, Suspense, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './index.css';
import './fix-overlay.css';
import './global-styles.css';
import { performanceMonitor } from './utils/performanceMonitor';

// Lazy load the main App component
const App = React.lazy(() => {
  console.log('Loading App component...');
  return import('./App.jsx').then(module => {
    console.log('App component loaded');
    return module;
  }).catch(error => {
    console.error('Failed to load App component:', error);
    throw error;
  });
});

// Loading fallback component
function LoadingFallback() {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      fontSize: '1.2rem',
      fontFamily: 'sans-serif'
    }}>
      <div>Loading application...</div>
    </div>
  );
}

// Create global error container
const errorContainer = document.createElement('div');
errorContainer.id = 'global-error';
document.body.prepend(errorContainer);

// Only import debug utility in development
if (import.meta.env.DEV) {
  import('./utils/debugClicks').catch(console.error);
}

// Debugging: Log when the app starts
console.log('Application starting...');

// Global error handler
window.addEventListener('error', (event) => {
  const error = event.error || event;
  console.error('Global error:', error.message || error);
  console.error('Error stack:', error.stack);
  
  // Try to show error in UI if possible
  try {
    const errorContainer = document.getElementById('global-error');
    if (errorContainer) {
      errorContainer.textContent = `Error: ${error.message || 'An unexpected error occurred'}`;
      errorContainer.style.display = 'block';
    }
  } catch (e) {
    console.error('Error in global error handler:', e);
  }
  
  return false;
});

// Unhandled promise rejections
window.addEventListener('unhandledrejection', (event) => {
  const reason = event.reason || event;
  console.error('Unhandled rejection:', reason);
  console.error('Rejection stack:', reason?.stack);
  
  // Try to show error in UI if possible
  try {
    const errorContainer = document.getElementById('global-error');
    if (errorContainer) {
      errorContainer.textContent = `Unhandled error: ${reason.message || 'An unexpected error occurred'}`;
      errorContainer.style.display = 'block';
    }
  } catch (e) {
    console.error('Error in unhandled rejection handler:', e);
  }
  
  return false;
});

// Watchdog timer to detect unresponsive pages
let lastActivity = Date.now();
const WATCHDOG_TIMEOUT = 15000; // 15 seconds

function resetWatchdog() {
  lastActivity = Date.now();
}

// Reset watchdog on user interaction - disabled in development
if (!import.meta.env.DEV) {
  ['click', 'keydown', 'mousemove', 'scroll'].forEach(event => {
    window.addEventListener(event, resetWatchdog, { passive: true });
  });

  // Check for unresponsive state - disabled in development
  setInterval(() => {
    const timeSinceLastActivity = Date.now() - lastActivity;
    if (timeSinceLastActivity > WATCHDOG_TIMEOUT) {
      console.warn(`Page unresponsive for ${Math.floor(timeSinceLastActivity / 1000)} seconds`);
      // Try to recover by reloading the page
      if (window.confirm('The page seems unresponsive. Would you like to reload?')) {
        window.location.reload();
      }
      resetWatchdog();
    }
  }, 5000); // Check every 5 seconds
}

// Error boundary for the entire app
class AppErrorBoundary extends React.Component {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('App Error Boundary caught:', error, errorInfo);
    // Log to error tracking service if available
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          padding: '2rem',
          maxWidth: '800px',
          margin: '0 auto',
          fontFamily: 'sans-serif',
          lineHeight: '1.6',
          color: '#333'
        }}>
          <h1>Something went wrong</h1>
          <p>We're sorry, but the application encountered an error.</p>
          <button 
            onClick={() => window.location.reload()}
            style={{
              background: '#4CAF50',
              color: 'white',
              border: 'none',
              padding: '10px 20px',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '1rem',
              marginTop: '1rem'
            }}
          >
            Reload Application
          </button>
          {import.meta.env.DEV && (
            <div style={{ marginTop: '2rem', color: '#721c24', backgroundColor: '#f8d7da', padding: '1rem', borderRadius: '4px' }}>
              <h3>Error Details (Development Only)</h3>
              <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                {this.state.error?.toString()}
              </pre>
            </div>
          )}
        </div>
      );
    }
    return this.props.children;
  }
}

// Initialize the app with better error handling
function initializeApp() {
  try {
    const rootElement = document.getElementById('root');
    if (!rootElement) {
      throw new Error('Root element not found. Make sure you have a <div id="root"></div> in your HTML.');
    }

    // Clear any existing content
    rootElement.innerHTML = '';
    
    // Create a new root
    const root = createRoot(rootElement);
    
    console.log('Starting application render...');
    
    // Render the app with error boundaries and suspense
    root.render(
      <StrictMode>
        <AppErrorBoundary>
          <BrowserRouter>
            <Suspense fallback={<LoadingFallback />}>
              <App />
              <ToastContainer 
                position="bottom-right" 
                autoClose={5000}
                closeOnClick
                pauseOnHover
                draggable
                pauseOnFocusLoss={false}
              />
            </Suspense>
          </BrowserRouter>
        </AppErrorBoundary>
      </StrictMode>
    );
    
    console.log('Application render completed');
    return true;
  } catch (error) {
    console.error('Failed to render app:', error);
    
    // Show error in the UI if possible
    const rootElement = document.getElementById('root') || document.body;
    const errorHtml = `
      <div style="
        padding: 2rem;
        margin: 2rem;
        color: #721c24;
        background-color: #f8d7da;
        border: 1px solid #f5c6cb;
        border-radius: 4px;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      ">
        <h2 style="margin-top: 0;">🚨 Application Error</h2>
        <p><strong>${error.name}:</strong> ${error.message}</p>
        <details style="margin-top: 1rem;">
          <summary style="cursor: pointer; color: #721c24; font-weight: bold;">Show error details</summary>
          <pre style="
            margin-top: 0.5rem;
            padding: 1rem;
            background: rgba(0,0,0,0.05);
            border-radius: 4px;
            overflow-x: auto;
            white-space: pre-wrap;
            word-wrap: break-word;
          ">${error.stack || 'No stack trace available'}</pre>
        </details>
      </div>
    `;
    
    try {
      rootElement.innerHTML = errorHtml;
    } catch (innerError) {
      console.error('Failed to render error UI:', innerError);
      // Last resort: use document.write
      document.write(errorHtml);
    }
    
    return false;
  }
}

// Function to initialize performance monitoring
function initializePerformanceMonitoring() {
  // Performance monitoring is disabled by default
  // To enable, uncomment the code below and call performanceMonitor.start() manually when needed
  /*
  if (import.meta.env.PROD) {
    // In production, only start monitoring after user interaction
    const startMonitoring = () => {
      performanceMonitor.start();
      document.removeEventListener('click', startMonitoring);
      document.removeEventListener('keydown', startMonitoring);
    };
    
    document.addEventListener('click', startMonitoring, { once: true });
    document.addEventListener('keydown', startMonitoring, { once: true });
  } else {
    // In development, start monitoring immediately
    performanceMonitor.start();
  }
  
  // Log performance metrics periodically in production
  if (import.meta.env.PROD) {
    setInterval(() => {
      const metrics = performanceMonitor.getMetrics();
      if (metrics.timeSinceLastInteraction < 60000) { // Only log if user was active in the last minute
        console.log('Performance metrics:', metrics);
      }
    }, 30000);
  }
  */
}

// Start the app with error handling
function startApplication() {
  try {
    console.log('Starting application initialization...');
    initializePerformanceMonitoring();
    initializeApp();
  } catch (error) {
    console.error('Failed to start application:', error);
    
    // Show error in the UI if possible
    const rootElement = document.getElementById('root') || document.body;
    const errorHtml = `
      <div style="
        padding: 2rem;
        margin: 2rem;
        color: #721c24;
        background-color: #f8d7da;
        border: 1px solid #f5c6cb;
        border-radius: 4px;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      ">
        <h2 style="margin-top: 0;">🚨 Application Failed to Start</h2>
        <p>${error.message || 'An unknown error occurred during application startup.'}</p>
        <button 
          onclick="window.location.reload()"
          style="
            background: #4CAF50;
            color: white;
            border: none;
            padding: 10px 20px;
            border-radius: 4px;
            cursor: pointer;
            margin-top: 1rem;
            font-size: 1rem;
          "
        >
          Try Again
        </button>
      </div>
    `;
    
    try {
      rootElement.innerHTML = errorHtml;
    } catch (e) {
      console.error('Failed to render error UI:', e);
      document.write(errorHtml);
    }
  }
}

// Start the application when the DOM is ready
if (document.readyState === 'loading') {
  console.log('Waiting for DOM to load...');
  document.addEventListener('DOMContentLoaded', startApplication);
} else {
  console.log('DOM already loaded, starting application...');
  startApplication();
}

// Add global error handler for unhandled promise rejections
window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason);
  
  // Notify performance monitor
  performanceMonitor.notifyObservers({
    type: 'UNHANDLED_REJECTION',
    error: event.reason,
    timestamp: Date.now()
  });
  
  // Prevent the default browser handler
  event.preventDefault();
});
