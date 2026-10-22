import React, {useRef, useState, useEffect, useCallback} from 'react';
import {View, Text, StyleSheet, AppState, AppStateStatus} from 'react-native';
import {
  Camera,
  CameraRuntimeError,
  useCameraDevice,
  useCameraFormat,
  useCameraPermission,
} from 'react-native-vision-camera';
import {useIsFocused} from '@react-navigation/native';
import {usePedal} from '../contexts/PedalContext';
import {useSound} from '../hooks/useSound';
import {useHaptic} from '../hooks/useHaptic';
import type {ScanImage} from '../contexts/ScanContext';
import ScanFeedback from './ScanFeedback';
import DocumentOverlay from './DocumentOverlay';
import {Colors} from '../constants';

type OverlayVariant = 'document' | 'barcode' | 'none';

interface PedalCameraProps {
  filename: string;
  onCapture: (
    img: ScanImage,
    layout?: {width: number; height: number},
  ) => void;
  overlayVariant?: OverlayVariant;
  isActive?: boolean;
}

export default function PedalCamera({
  filename,
  onCapture,
  overlayVariant = 'document',
  isActive: propIsActive = true,
}: PedalCameraProps) {
  const cameraRef = useRef<Camera>(null);
  const device = useCameraDevice('back');
  const format = useCameraFormat(device, [
    {photoResolution: {width: 1920, height: 1080}},
  ]);
  const {hasPermission, requestPermission} = useCameraPermission();
  const {play} = useSound();
  const {trigger: triggerHaptic} = useHaptic();
  const {register, unregister} = usePedal();
  const isFocused = useIsFocused();
  const [isForeground, setIsForeground] = useState(
    AppState.currentState === 'active',
  );
  const [isFlashing, setIsFlashing] = useState(false);
  const [feedback, setFeedback] = useState<{
    type: 'success' | 'error';
    msg: string;
    subMsg?: string;
  } | null>(null);
  const isCapturingRef = useRef(false);
  const viewLayoutRef = useRef<{width: number; height: number}>({
    width: 0,
    height: 0,
  });

  useEffect(() => {
    const sub = AppState.addEventListener('change', (status: AppStateStatus) => {
      setIsForeground(status === 'active');
    });
    return () => sub.remove();
  }, []);

  const isActive = propIsActive && isFocused && isForeground;

  useEffect(() => {
    if (!hasPermission) {
      requestPermission();
    }
  }, [hasPermission, requestPermission]);

  useEffect(() => {
    if (isFocused) {
      isCapturingRef.current = false;
    }
  }, [isFocused]);

  const handleCapture = useCallback(async () => {
    if (isCapturingRef.current || !cameraRef.current || !isActive) {
      return;
    }
    isCapturingRef.current = true;

    play('tick');
    triggerHaptic('capture');
    setIsFlashing(true);
    setTimeout(() => setIsFlashing(false), 90);

    try {
      const photo = await cameraRef.current.takePhoto({
        flash: 'off',
        enableShutterSound: false,
      });

      play('success');
      onCapture(
        {
          uri: `file://${photo.path}`,
          type: 'image/jpeg',
          name: filename,
          isProcessing: true,
        },
        viewLayoutRef.current,
      );
      isCapturingRef.current = false;
    } catch {
      play('error');
      setFeedback({
        type: 'error',
        msg: 'Gagal Mengambil Foto',
        subMsg: 'Silakan posisikan ulang dokumen dan ulangi scan',
      });
      isCapturingRef.current = false;
    }
  }, [filename, onCapture, play, triggerHaptic, isActive]);

  const captureRef = useRef(handleCapture);
  captureRef.current = handleCapture;

  useEffect(() => {
    if (!hasPermission || device == null || !isActive) {
      return;
    }
    register(() => captureRef.current());
    return () => unregister();
  }, [hasPermission, device, register, unregister, isActive]);

  const handleCameraError = useCallback((_error: CameraRuntimeError) => {}, []);

  if (!hasPermission || device == null) {
    return <View style={styles.container} />;
  }

  return (
    <View
      style={styles.container}
      onLayout={e => {
        const {width, height} = e.nativeEvent.layout;
        if (width > 0 && height > 0) {
          viewLayoutRef.current = {width, height};
        }
      }}>
      <Camera
        ref={cameraRef}
        style={StyleSheet.absoluteFill}
        device={device}
        format={format}
        isActive={isActive}
        photo={true}
        androidPreviewViewType="texture-view"
        outputOrientation="preview"
        onError={handleCameraError}
      />
      {overlayVariant !== 'none' && <DocumentOverlay variant={overlayVariant} />}
      {isFlashing && (
        <View
          style={[StyleSheet.absoluteFill, styles.shutterFlash]}
          pointerEvents="none"
        />
      )}
      <ScanFeedback
        type={feedback?.type ?? 'success'}
        message={feedback?.msg ?? ''}
        subMessage={feedback?.subMsg}
        visible={Boolean(feedback)}
        onClose={() => setFeedback(null)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.neutral,
    borderRadius: 20,
    overflow: 'hidden',
  },
  shutterFlash: {
    backgroundColor: Colors.white,
    opacity: 0.65,
  },
});
