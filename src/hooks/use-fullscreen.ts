'use client';

import { useEffect, useState, useCallback } from 'react';

interface UseFullscreenReturn {
  isFullscreen: boolean;
  isSupported: boolean;
  enterFullscreen: () => Promise<void>;
  exitFullscreen: () => Promise<void>;
  toggleFullscreen: () => Promise<void>;
}

/**
 * Custom hook to manage fullscreen mode
 * Provides functions to enter/exit fullscreen and tracks current state
 */
export function useFullscreen(
  elementRef?: React.RefObject<HTMLElement>,
  onFullscreenChange?: (isFullscreen: boolean) => void,
  preventExit: boolean = false,
  onUserForcedExit?: () => void
): UseFullscreenReturn {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isSupported, setIsSupported] = useState(false);

  // Check if fullscreen API is supported
  useEffect(() => {
    setIsSupported(
      typeof document !== 'undefined' &&
      (document.fullscreenEnabled ||
        (document as any).webkitFullscreenEnabled ||
        (document as any).mozFullScreenEnabled ||
        (document as any).msFullscreenEnabled)
    );
  }, []);

  // Handle fullscreen change events
  useEffect(() => {
    const handleChange = () => {
      const fullscreenElement =
        document.fullscreenElement ||
        (document as any).webkitFullscreenElement ||
        (document as any).mozFullScreenElement ||
        (document as any).msFullscreenElement;

      const isNowFullscreen = !!fullscreenElement;
      setIsFullscreen(isNowFullscreen);
      onFullscreenChange?.(isNowFullscreen);

      // If prevent exit is enabled and user tries to exit, show warning
      if (preventExit && !isNowFullscreen) {
        const shouldStayInFullscreen = confirm(
          '⚠️ WARNING: You cannot exit fullscreen mode during the test.\n\n' +
          'Exiting fullscreen will end your test attempt immediately.\n\n' +
          'Click OK to EXIT and submit the test, or Cancel to continue.'
        );

        if (shouldStayInFullscreen) {
          // User confirmed they want to exit - call the callback
          console.warn('User forcefully exited fullscreen during test');
          onUserForcedExit?.();
        } else {
          // User clicked Cancel - they want to stay but we CAN'T re-enter fullscreen
          // without a user gesture, so we have to exit anyway
          console.warn('Cannot re-enter fullscreen without user gesture - forcing exit');
          onUserForcedExit?.();
        }
      }
    };

    document.addEventListener('fullscreenchange', handleChange);
    document.addEventListener('webkitfullscreenchange', handleChange);
    document.addEventListener('mozfullscreenchange', handleChange);
    document.addEventListener('MSFullscreenChange', handleChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleChange);
      document.removeEventListener('webkitfullscreenchange', handleChange);
      document.removeEventListener('mozfullscreenchange', handleChange);
      document.removeEventListener('MSFullscreenChange', handleChange);
    };
  }, [preventExit, onFullscreenChange, elementRef, onUserForcedExit]);

  const enterFullscreen = useCallback(async () => {
    if (!isSupported) {
      console.error('Fullscreen API is not supported');
      return;
    }

    try {
      const element = elementRef?.current || document.documentElement;

      if (element.requestFullscreen) {
        await element.requestFullscreen();
      } else if ((element as any).webkitRequestFullscreen) {
        await (element as any).webkitRequestFullscreen();
      } else if ((element as any).mozRequestFullScreen) {
        await (element as any).mozRequestFullScreen();
      } else if ((element as any).msRequestFullscreen) {
        await (element as any).msRequestFullscreen();
      }
    } catch (error) {
      console.error('Failed to enter fullscreen:', error);
    }
  }, [elementRef, isSupported]);

  const exitFullscreen = useCallback(async () => {
    if (!isSupported) {
      console.error('Fullscreen API is not supported');
      return;
    }

    // Check if we're actually in fullscreen mode
    const fullscreenElement =
      document.fullscreenElement ||
      (document as any).webkitFullscreenElement ||
      (document as any).mozFullScreenElement ||
      (document as any).msFullscreenElement;

    if (!fullscreenElement) {
      // Already not in fullscreen, nothing to do
      return;
    }

    try {
      if (document.exitFullscreen) {
        await document.exitFullscreen();
      } else if ((document as any).webkitExitFullscreen) {
        await (document as any).webkitExitFullscreen();
      } else if ((document as any).mozCancelFullScreen) {
        await (document as any).mozCancelFullScreen();
      } else if ((document as any).msExitFullscreen) {
        await (document as any).msExitFullscreen();
      }
    } catch (error) {
      console.error('Failed to exit fullscreen:', error);
      // Don't throw, just log the error
    }
  }, [isSupported]);

  const toggleFullscreen = useCallback(async () => {
    if (isFullscreen) {
      await exitFullscreen();
    } else {
      await enterFullscreen();
    }
  }, [isFullscreen, enterFullscreen, exitFullscreen]);

  return {
    isFullscreen,
    isSupported,
    enterFullscreen,
    exitFullscreen,
    toggleFullscreen,
  };
}
