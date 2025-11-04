export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastData {
  id: number;
  message: string;
  type?: ToastType;
  duration?: number; // milliseconds, 0 = no auto hide
  action?: {
    label: string;
    onPress: () => void;
  };
}


