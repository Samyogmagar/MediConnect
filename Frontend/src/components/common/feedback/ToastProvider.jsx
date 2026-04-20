/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import AppToast from './AppToast';
import styles from './ToastProvider.module.css';

const ToastContext = createContext(null);

let toastCounter = 0;

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const dismissToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const showToast = useCallback((toast) => {
    const id = ++toastCounter;
    const nextToast = {
      id,
      type: toast.type || 'info',
      title: toast.title || '',
      message: toast.message || '',
      duration: toast.duration ?? 3500,
    };

    setToasts((prev) => [...prev, nextToast]);

    if (nextToast.duration > 0) {
      window.setTimeout(() => {
        dismissToast(id);
      }, nextToast.duration);
    }

    return id;
  }, [dismissToast]);

  const value = useMemo(
    () => ({ showToast, dismissToast }),
    [showToast, dismissToast]
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className={styles.toastViewport} aria-live="polite" aria-atomic="true">
        {toasts.map((toast) => (
          <AppToast
            key={toast.id}
            toast={toast}
            onClose={() => dismissToast(toast.id)}
          />
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
};
