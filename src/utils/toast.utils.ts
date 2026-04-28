import { useUIStore } from '@/store/ui.store';

// Get the store instance (this works since zustand creates a singleton)
const getStore = () => useUIStore.getState();

export const Toast = {
  success: (message: string, duration?: number) => {
    getStore().addToast({
      type: 'success',
      message,
      duration: duration || 5000,
    });
  },

  error: (message: string, duration?: number) => {
    getStore().addToast({
      type: 'error',
      message,
      duration: duration || 5000,
    });
  },

  warning: (message: string, duration?: number) => {
    getStore().addToast({
      type: 'warning',
      message,
      duration: duration || 5000,
    });
  },

  info: (message: string, duration?: number) => {
    getStore().addToast({
      type: 'info',
      message,
      duration: duration || 5000,
    });
  },
};
