import React, {createContext, useContext, useState, useCallback, type ReactNode} from 'react';
import CustomAlert, {type AlertType} from '../components/CustomAlert';

interface AlertOptions {
  title: string;
  message: string;
  type?: AlertType;
  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
}

interface AlertContextValue {
  showAlert: (options: AlertOptions) => void;
  showConfirm: (message: string, onConfirm: () => void, title?: string) => void;
  hideAlert: () => void;
}

const AlertContext = createContext<AlertContextValue | null>(null);

export function AlertProvider({children}: {children: ReactNode}) {
  const [visible, setVisible] = useState(false);
  const [opts, setOpts] = useState<AlertOptions>({title: '', message: ''});

  const showAlert = useCallback((options: AlertOptions) => {
    setOpts(options);
    setVisible(true);
  }, []);

  const showConfirm = useCallback((message: string, onConfirm: () => void, title = 'Konfirmasi') => {
    setOpts({title, message, type: 'confirm', confirmText: 'Ya', cancelText: 'Batal', onConfirm});
    setVisible(true);
  }, []);

  const hideAlert = useCallback(() => {
    setVisible(false);
  }, []);

  const handleConfirm = useCallback(() => {
    setVisible(false);
    opts.onConfirm?.();
  }, [opts]);

  const handleCancel = useCallback(() => {
    setVisible(false);
    opts.onCancel?.();
  }, [opts]);

  return (
    <AlertContext.Provider value={{showAlert, showConfirm, hideAlert}}>
      {children}
      <CustomAlert
        visible={visible}
        title={opts.title}
        message={opts.message}
        type={opts.type}
        confirmText={opts.confirmText}
        cancelText={opts.cancelText}
        onConfirm={handleConfirm}
        onCancel={opts.onCancel ? handleCancel : undefined}
      />
    </AlertContext.Provider>
  );
}

export function useAlert() {
  const ctx = useContext(AlertContext);
  if (!ctx) {
    throw new Error('useAlert must be used within AlertProvider');
  }
  return ctx;
}
