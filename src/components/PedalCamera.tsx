import React, {useRef, useState, useEffect, useCallback} from 'react';
import {View, StyleSheet} from 'react-native';
import {
  Camera,
  useCameraDevice,
  useCameraPermission,
} from 'react-native-vision-camera';
import {usePedal} from '../contexts/PedalContext';
import {useSound} from '../hooks/useSound';
import type {ScanImage} from '../contexts/ScanContext';
import ScanFeedback from './ScanFeedback';
import DocumentOverlay from './DocumentOverlay';
import {Colors} from '../constants';
import {processScanImage} from '../utils/documentScanner';

type OverlayVariant = 'document' | 'barcode' | 'none';

interface PedalCameraProps {
  filename: string;
  onCapture: (img: ScanImage) => void;
  overlayVariant?: OverlayVariant;
}

const FEEDBACK_DURATION_MS = 1200;

export default function PedalCamera({
  filename,
  onCapture,
  overlayVariant = 'document',
}: PedalCameraProps) {
  const cameraRef = useRef<Camera>(null);
  const device = useCameraDevice('back');
  const {hasPermission, requestPermission} = useCameraPermission();
  const {play} = useSound();
  const {register, unregister} = usePedal();
  const [feedback, setFeedback] = useState<{
    type: 'success' | 'error';
    msg: string;
  } | null>(null);
  const isCapturingRef = useRef(false);

  useEffect(() => {
    if (!hasPermission) {
      requestPermission();
    }
  }, [hasPermission, requestPermission]);

  const handleCapture = useCallback(async () => {
    if (isCapturingRef.current || !cameraRef.current) {
      return;
    }
    isCapturingRef.current = true;

    try {
      const photo = await cameraRef.current.takePhoto({
        flash: 'off',
        enableShutterSound: false,
      });

      const scanResult = await processScanImage(`file://${photo.path}`);

      play('success');
      setFeedback({
        type: 'success',
        msg: scanResult.borderDetected
          ? 'Foto tersimpan'
          : 'Foto tersimpan (border tidak terdeteksi)',
      });
      onCapture({
        uri: scanResult.uri,
        type: 'image/jpeg',
        name: filename,
      });

      setTimeout(() => {
        setFeedback(null);
        isCapturingRef.current = false;
      }, FEEDBACK_DURATION_MS);
    } catch {
      play('error');
      setFeedback({type: 'error', msg: 'Gagal mengambil foto'});
      isCapturingRef.current = false;
    }
  }, [filename, onCapture, play]);

  const captureRef = useRef(handleCapture);
  captureRef.current = handleCapture;

  useEffect(() => {
    if (!hasPermission || device == null) {
      return;
    }
    register(() => captureRef.current());
    return () => unregister();
  }, [hasPermission, device, register, unregister]);

  if (!hasPermission || device == null) {
    return <View style={styles.container} />;
  }

  return (
    <View style={styles.container}>
      <Camera
        ref={cameraRef}
        style={StyleSheet.absoluteFill}
        device={device}
        isActive={true}
        photo={true}
      />
      {overlayVariant !== 'none' && <DocumentOverlay variant={overlayVariant} />}
      <ScanFeedback
        type={feedback?.type ?? 'success'}
        message={feedback?.msg ?? ''}
        visible={!!feedback}
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
});
