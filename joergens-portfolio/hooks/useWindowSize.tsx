import { useState, useEffect } from 'react';

interface WindowSize {
  width: number | null;
  height: number | null;
}

export function useWindowSize() {
  const [windowSize, setWindowSize] = useState<WindowSize>({
    width: null,
    height: null,
  });

  useEffect(() => {
    function handleResize() {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    }

    // Add event listener for window resize
    window.addEventListener('resize', handleResize);

    // Call handleResize immediately to set initial window size
    handleResize();

    // Remove event listener on cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return windowSize;
}
