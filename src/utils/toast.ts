import Toast from 'react-native-toast-message';

export function showSuccessToast(message: string, title = 'Berhasil') {
  Toast.show({
    type: 'success',
    text1: title,
    text2: message,
    visibilityTime: 2500,
  });
}

export function showErrorToast(message: string, title = 'Gagal') {
  Toast.show({
    type: 'error',
    text1: title,
    text2: message,
    visibilityTime: 3500,
  });
}

export function showInfoToast(message: string, title = 'Info') {
  Toast.show({
    type: 'info',
    text1: title,
    text2: message,
    visibilityTime: 2500,
  });
}
