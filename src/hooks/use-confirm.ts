import { create } from 'zustand';

interface ConfirmOptions {
  title?: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel?: () => void;
  variant?: 'default' | 'destructive';
}

interface ConfirmStore {
  isOpen: boolean;
  options: ConfirmOptions | null;
  confirm: (options: ConfirmOptions) => void;
  close: () => void;
}

export const useConfirm = create<ConfirmStore>((set) => ({
  isOpen: false,
  options: null,
  confirm: (options) => set({ isOpen: true, options }),
  close: () => set({ isOpen: false, options: null }),
}));
