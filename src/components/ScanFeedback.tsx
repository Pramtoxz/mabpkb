import React from 'react';
import FloatingToast from './FloatingToast';

type FeedbackType = 'success' | 'error' | 'result';

interface ScanFeedbackProps {
  type: FeedbackType;
  message: string;
  subMessage?: string;
  visible: boolean;
  onClose?: () => void;
}

export default function ScanFeedback({
  type,
  message,
  subMessage,
  visible,
  onClose = () => {},
}: ScanFeedbackProps) {
  if (!visible) {
    return null;
  }

  const isResult = type === 'result';
  const toastType = type === 'error' ? 'error' : 'success';
  const primaryMessage = isResult ? 'Nomor Rangka Terdeteksi' : message;
  const secondaryMessage = isResult ? message : subMessage;

  return (
    <FloatingToast
      visible={visible}
      type={toastType}
      message={primaryMessage}
      subMessage={secondaryMessage}
      onClose={onClose}
      duration={2200}
    />
  );
}