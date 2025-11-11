'use client';

import { useEffect } from 'react';

/**
 * Client component wrapper for test attempts
 * Hides dashboard sidebar and applies full-screen styles
 */
export function TestAttemptWrapper({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Add data attribute to body for CSS targeting
    document.body.setAttribute('data-test-attempt', 'true');
    
    // Add styles to hide dashboard layout elements
    const styleElement = document.createElement('style');
    styleElement.id = 'test-attempt-styles';
    styleElement.textContent = `
      body[data-test-attempt] nav,
      body[data-test-attempt] aside,
      body[data-test-attempt] header.sticky {
        display: none !important;
      }
      body[data-test-attempt] main {
        margin: 0 !important;
        padding: 0 !important;
        width: 100vw !important;
        max-width: 100vw !important;
      }
      body[data-test-attempt] .flex.flex-1.flex-col {
        height: 100vh !important;
      }
    `;
    document.head.appendChild(styleElement);
    
    // Cleanup on unmount
    return () => {
      document.body.removeAttribute('data-test-attempt');
      const style = document.getElementById('test-attempt-styles');
      if (style) {
        style.remove();
      }
    };
  }, []);

  return (
    <div className="w-full min-h-screen">
      {children}
    </div>
  );
}
