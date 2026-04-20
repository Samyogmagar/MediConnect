/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import ConfirmActionModal from './ConfirmActionModal';
import SuccessModal from './SuccessModal';
import ErrorModal from './ErrorModal';
import InfoModal from './InfoModal';

const ModalContext = createContext(null);

export const ModalProvider = ({ children }) => {
  const [modalState, setModalState] = useState(null);

  const closeModal = useCallback(() => {
    setModalState(null);
  }, []);

  const showConfirm = useCallback((options) => {
    return new Promise((resolve) => {
      setModalState({
        type: 'confirm',
        options,
        loading: false,
        resolve,
      });
    });
  }, []);

  const showSuccess = useCallback((options) => {
    return new Promise((resolve) => {
      setModalState({ type: 'success', options, resolve });
    });
  }, []);

  const showError = useCallback((options) => {
    return new Promise((resolve) => {
      setModalState({ type: 'error', options, resolve });
    });
  }, []);

  const showInfo = useCallback((options) => {
    return new Promise((resolve) => {
      setModalState({ type: 'info', options, resolve });
    });
  }, []);

  const handleConfirmCancel = useCallback(() => {
    if (modalState?.type !== 'confirm') return;
    modalState.resolve({ confirmed: false, inputValue: '' });
    closeModal();
  }, [modalState, closeModal]);

  const handleConfirmProceed = useCallback(async (inputValue) => {
    if (modalState?.type !== 'confirm') return;

    const options = modalState.options || {};
    const onConfirm = options.onConfirm;

    if (!onConfirm) {
      modalState.resolve({ confirmed: true, inputValue });
      closeModal();
      return;
    }

    setModalState((prev) => (prev ? { ...prev, loading: true } : prev));

    try {
      const result = await onConfirm(inputValue);
      modalState.resolve({ confirmed: true, inputValue, result });
      closeModal();
    } catch (error) {
      setModalState((prev) => (prev ? { ...prev, loading: false } : prev));
      if (typeof options.onError === 'function') {
        options.onError(error);
      }
    }
  }, [modalState, closeModal]);

  const closeCurrentSimpleModal = useCallback(() => {
    if (!modalState || modalState.type === 'confirm') return;
    modalState.resolve({ closed: true });
    closeModal();
  }, [modalState, closeModal]);

  const value = useMemo(
    () => ({ showConfirm, showSuccess, showError, showInfo, closeModal }),
    [showConfirm, showSuccess, showError, showInfo, closeModal]
  );

  return (
    <ModalContext.Provider value={value}>
      {children}

      {modalState?.type === 'confirm' ? (
        <ConfirmActionModal
          open
          title={modalState.options?.title || 'Confirm action'}
          message={modalState.options?.message}
          details={modalState.options?.details || []}
          inputConfig={modalState.options?.inputConfig}
          confirmText={modalState.options?.confirmText || 'Confirm'}
          cancelText={modalState.options?.cancelText || 'Cancel'}
          confirmVariant={modalState.options?.confirmVariant || 'danger'}
          loading={Boolean(modalState.loading)}
          onCancel={handleConfirmCancel}
          onConfirm={handleConfirmProceed}
        />
      ) : null}

      {modalState?.type === 'success' ? (
        <SuccessModal
          open
          title={modalState.options?.title || 'Success'}
          message={modalState.options?.message}
          primaryText={modalState.options?.primaryText || 'Continue'}
          secondaryText={modalState.options?.secondaryText}
          onPrimary={modalState.options?.onPrimary || closeCurrentSimpleModal}
          onSecondary={modalState.options?.onSecondary}
        />
      ) : null}

      {modalState?.type === 'error' ? (
        <ErrorModal
          open
          title={modalState.options?.title || 'Something went wrong'}
          message={modalState.options?.message}
          details={modalState.options?.details}
          actionText={modalState.options?.actionText || 'Close'}
          onAction={modalState.options?.onAction || closeCurrentSimpleModal}
          onClose={closeCurrentSimpleModal}
        />
      ) : null}

      {modalState?.type === 'info' ? (
        <InfoModal
          open
          title={modalState.options?.title || 'Information'}
          message={modalState.options?.message}
          details={modalState.options?.details}
          primaryText={modalState.options?.primaryText || 'OK'}
          secondaryText={modalState.options?.secondaryText}
          onPrimary={modalState.options?.onPrimary || closeCurrentSimpleModal}
          onSecondary={modalState.options?.onSecondary}
          onClose={closeCurrentSimpleModal}
        />
      ) : null}
    </ModalContext.Provider>
  );
};

export const useModal = () => {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error('useModal must be used within ModalProvider');
  }
  return context;
};
