// Debug utility to help identify click issues (Temporarily Disabled)
const debugClicks = () => {
  // Temporarily disabled
  console.log('debugClicks is currently disabled');
  return;
  
  // Only run in development
  if (!import.meta.env.DEV) return;

  console.log('Setting up click debugger (Performance Optimized Version)...');

  // Basic element info getter (no styles for performance)
  const getBasicElementInfo = (el) => {
    try {
      if (!el || !(el instanceof Element)) {
        return null;
      }
      return {
        tag: el.tagName,
        id: el.id || null,
        class: el.className || null,
        text: el.textContent?.trim().substring(0, 50) || null // Short text snippet
      };
    } catch (error) {
      // console.warn('Error in getBasicElementInfo:', { error, element: el });
      return null;
    }
  };

  // Element info getter for the direct target, with very limited styles
  const getTargetElementInfoWithLimitedStyles = (el) => {
    try {
      if (!el || !(el instanceof Element)) {
        return null;
      }

      const info = {
        tag: el.tagName,
        id: el.id || null,
        class: el.className || null,
        nodeType: el.nodeType,
        nodeName: el.nodeName,
        text: el.textContent?.trim().substring(0, 100) || null // Slightly longer for target
      };

      // Only try to get limited computed styles for the Element node (direct target only)
      if (el.nodeType === Node.ELEMENT_NODE) {
        try {
          const style = window.getComputedStyle(el);
          info.style = { // Collect only a few, generally less expensive, common styles
            display: style.display,
            visibility: style.visibility,
            opacity: style.opacity,
            pointerEvents: style.pointerEvents,
            position: style.position,
            // Add other specific styles here if absolutely needed, but be cautious
            // e.g., zIndex: style.zIndex, cursor: style.cursor
          };
        } catch (styleError) {
          // console.warn('Error getting limited computed styles for target:', { element: el, error: styleError });
          info.style = { error: 'Could not compute styles for target' };
        }
      }
      return info;
    } catch (error) {
      // console.warn('Error in getTargetElementInfoWithLimitedStyles:', { error, element: el });
      return null;
    }
  };

  // Safe get elements at point
  const safeElementsFromPoint = (x, y) => {
    try {
      if (
        x < 0 || x > window.innerWidth ||
        y < 0 || y > window.innerHeight
      ) {
        // console.warn('Coordinates out of bounds:', { x, y, innerWidth: window.innerWidth, innerHeight: window.innerHeight });
        return [];
      }
      return document.elementsFromPoint(x, y);
    } catch (error) {
      // console.warn('Error in safeElementsFromPoint:', error);
      return [];
    }
  };

  // Log all click events
  const handleClick = (e) => {
    // Don't prevent default behavior or stop propagation
    if (!e.isTrusted) return; // Skip synthetic events

    // Don't interfere with form submissions or button clicks
    if (e.target.closest('form') || e.target.closest('button') || e.target.closest('a')) {
      return;
    }

    // Use requestIdleCallback to avoid blocking the main thread
    requestIdleCallback(() => {
      const clickData = {
        time: new Date().toISOString(),
        coordinates: { x: e.clientX, y: e.clientY },
        target: getTargetElementInfoWithLimitedStyles(e.target) // Use detailed getter for target
      };

      try {
        const path = [];
        if (e.composedPath) {
          try {
            const rawPath = e.composedPath();
            for (const el of rawPath) {
              if (el === document || el === window) break;
              const info = getBasicElementInfo(el); // Use basic getter for path elements
              if (info) path.push(info);
            }
          } catch (pathError) {
            // console.warn('Error processing event path:', pathError);
          }
        }
        clickData.path = path;

        try {
          const elements = safeElementsFromPoint(e.clientX, e.clientY);
          // Use basic getter for elements at point
          clickData.elementsAtPoint = elements.map(getBasicElementInfo).filter(Boolean);
        } catch (elementsError) {
          // console.warn('Error getting elements at point:', elementsError);
        }

        console.log('Click event:', clickData);
      } catch (error) {
        console.error('Error in click handler:', error);
      }
    });
  };

  // Set up event listener
  try {
    document.removeEventListener('click', handleClick, true);
    document.addEventListener('click', handleClick, true); // Use capture phase
  } catch (error) {
    console.error('Error setting up click listener:', error);
  }
};

// Run debugger in development
if (import.meta.env.DEV) {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', debugClicks);
  } else {
    debugClicks();
  }
}

export default debugClicks;
