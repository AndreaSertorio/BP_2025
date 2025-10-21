/**
 * TOAST CONFIGURATION
 * Centralized toast notifications for Value Proposition
 */

import toast from 'react-hot-toast';

// Toast styles
export const toastStyles = {
  success: {
    icon: '✅',
    style: {
      background: '#10B981',
      color: '#fff',
      fontWeight: 500,
    },
    duration: 3000,
  },
  error: {
    icon: '❌',
    style: {
      background: '#EF4444',
      color: '#fff',
      fontWeight: 500,
    },
    duration: 5000,
  },
  loading: {
    icon: '⏳',
    style: {
      background: '#3B82F6',
      color: '#fff',
      fontWeight: 500,
    },
  },
  info: {
    icon: 'ℹ️',
    style: {
      background: '#6366F1',
      color: '#fff',
      fontWeight: 500,
    },
    duration: 4000,
  },
};

// Success toasts
export const showSuccess = (message: string) => {
  toast.success(message, toastStyles.success);
};

export const showSaveSuccess = () => {
  toast.success('Salvato con successo!', toastStyles.success);
};

export const showDeleteSuccess = (itemType: string) => {
  toast.success(`${itemType} eliminato`, toastStyles.success);
};

export const showCreateSuccess = (itemType: string) => {
  toast.success(`${itemType} creato!`, toastStyles.success);
};

// Error toasts
export const showError = (message: string) => {
  toast.error(message, toastStyles.error);
};

export const showSaveError = () => {
  toast.error('Errore salvataggio. Riprova.', {
    ...toastStyles.error,
    duration: 5000,
  });
};

export const showNetworkError = () => {
  toast.error('Errore di rete. Controlla la connessione.', {
    ...toastStyles.error,
    duration: 6000,
  });
};

// Loading toasts
export const showLoading = (message: string = 'Caricamento...') => {
  return toast.loading(message, toastStyles.loading);
};

export const showSaving = () => {
  return toast.loading('Salvando...', toastStyles.loading);
};

// Info toasts
export const showInfo = (message: string) => {
  toast(message, toastStyles.info);
};

// Update toast (for loading -> success/error)
export const updateToast = (toastId: string, type: 'success' | 'error', message: string) => {
  if (type === 'success') {
    toast.success(message, { id: toastId });
  } else {
    toast.error(message, { id: toastId });
  }
};

// Toast with undo action (simplified)
export const showDeleteWithUndo = (
  itemType: string,
  onUndo: () => void,
  duration: number = 8000
) => {
  return toast.success(`${itemType} eliminato`, {
    duration,
    style: {
      background: '#10B981',
      color: '#fff',
    },
  });
};

// Promise toast (auto-handles loading/success/error)
export const showPromiseToast = async <T,>(
  promise: Promise<T>,
  messages: {
    loading: string;
    success: string;
    error: string;
  }
): Promise<T> => {
  return toast.promise(
    promise,
    {
      loading: messages.loading,
      success: messages.success,
      error: messages.error,
    },
    {
      success: toastStyles.success,
      error: toastStyles.error,
      loading: toastStyles.loading,
    }
  );
};
