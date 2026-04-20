import { useCallback, useEffect, useRef, useState } from 'react';

const useSidebarResize = ({ minWidth = 220, maxWidth = 360, defaultWidth = 240 } = {}) => {
  const [sidebarWidth, setSidebarWidth] = useState(defaultWidth);
  const isResizingRef = useRef(false);

  const stopResizing = useCallback(() => {
    if (!isResizingRef.current) {
      return;
    }

    isResizingRef.current = false;
    document.body.style.removeProperty('cursor');
    document.body.style.removeProperty('user-select');
  }, []);

  const onResizeHandleMouseDown = useCallback((event) => {
    event.preventDefault();
    isResizingRef.current = true;
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  }, []);

  useEffect(() => {
    const onMouseMove = (event) => {
      if (!isResizingRef.current) {
        return;
      }

      const nextWidth = Math.max(minWidth, Math.min(maxWidth, event.clientX));
      setSidebarWidth(nextWidth);
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', stopResizing);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', stopResizing);
      stopResizing();
    };
  }, [maxWidth, minWidth, stopResizing]);

  return {
    sidebarWidth,
    setSidebarWidth,
    onResizeHandleMouseDown,
  };
};

export default useSidebarResize;
