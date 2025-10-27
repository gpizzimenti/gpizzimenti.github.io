/**
 * Polyfill for the 'scrollend' event
 * ES Module version - only activates if native scrollend is not supported
 */

// Check if scrollend is already supported
if (!('onscrollend' in window)) {
  const scrollEndDelay = 100; // ms to wait after last scroll event
  const scrollTimers = new WeakMap();

  // Store original addEventListener
  const originalAddEventListener = EventTarget.prototype.addEventListener;
  const originalRemoveEventListener = EventTarget.prototype.removeEventListener;
  
  // Map to store scrollend listeners
  const scrollendListeners = new WeakMap();

  // Override addEventListener
  EventTarget.prototype.addEventListener = function(type, listener, options) {
    if (type === 'scrollend') {
      // Initialize listener storage for this element
      if (!scrollendListeners.has(this)) {
        scrollendListeners.set(this, new Map());
      }
      
      const listeners = scrollendListeners.get(this);
      
      // Create wrapper if not already created for this listener
      if (!listeners.has(listener)) {
        const scrollHandler = function(e) {
          // Clear existing timer
          if (scrollTimers.has(this)) {
            clearTimeout(scrollTimers.get(this));
          }
          
          // Set new timer
          const timer = setTimeout(() => {
            // Create and dispatch scrollend event
            const scrollendEvent = new Event('scrollend', {
              bubbles: options?.bubbles !== false,
              cancelable: false
            });
            
            // Copy scroll position properties
            Object.defineProperty(scrollendEvent, 'target', {
              value: this,
              enumerable: true
            });
            
            this.dispatchEvent(scrollendEvent);
          }, scrollEndDelay);
          
          scrollTimers.set(this, timer);
        };
        
        listeners.set(listener, scrollHandler);
        
        // Add the actual scroll listener
        originalAddEventListener.call(this, 'scroll', scrollHandler, options);
      }
      
      // Store the scrollend listener for potential direct dispatch
      originalAddEventListener.call(this, 'scrollend', listener, options);
    } else {
      originalAddEventListener.call(this, type, listener, options);
    }
  };

  // Override removeEventListener
  EventTarget.prototype.removeEventListener = function(type, listener, options) {
    if (type === 'scrollend') {
      const listeners = scrollendListeners.get(this);
      
      if (listeners && listeners.has(listener)) {
        const scrollHandler = listeners.get(listener);
        
        // Remove the scroll listener
        originalRemoveEventListener.call(this, 'scroll', scrollHandler, options);
        
        // Clean up
        listeners.delete(listener);
        if (listeners.size === 0) {
          scrollendListeners.delete(this);
        }
        
        // Clear any pending timer
        if (scrollTimers.has(this)) {
          clearTimeout(scrollTimers.get(this));
          scrollTimers.delete(this);
        }
      }
      
      // Remove the scrollend listener
      originalRemoveEventListener.call(this, 'scrollend', listener, options);
    } else {
      originalRemoveEventListener.call(this, type, listener, options);
    }
  };

  // Add property to indicate polyfill is active
  Object.defineProperty(window, 'onscrollend', {
    get: function() {
      return this._onscrollend || null;
    },
    set: function(handler) {
      if (this._onscrollend) {
        this.removeEventListener('scrollend', this._onscrollend);
      }
      this._onscrollend = handler;
      if (handler) {
        this.addEventListener('scrollend', handler);
      }
    },
    enumerable: true,
    configurable: true
  });
}

// Export a function to check if polyfill was applied
export function isPolyfilled() {
  return !('onscrollend' in EventTarget.prototype);
}

// Export for side-effect import
export default {};