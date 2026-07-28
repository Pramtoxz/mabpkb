import React, {useRef, useState, useEffect, useCallback} from 'react';
import {View, StyleSheet, PermissionsAndroid, Platform} from 'react-native';
import {Camera, CameraType} from 'react-native-camera-kit';
import type {CameraApi} from 'react-native-camera-kit';
import {usePedal} from '../contexts/PedalContext';
import {useSound} from '../hooks/useSound';
import type {ScanImage} from '../contexts/ScanContext';
import ScanFeedback from './ScanFeedback';
import DocumentOverlay from './DocumentOverlay';
import {Colors} from '../constants';

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
  const cameraRef = useRef<CameraApi>(null);
  const {play} = useSound();
  const {register, unregister} = usePedal();
  const [feedback, setFeedback] = useState<{
    type: 'success' | 'error';
    msg: string;
  } | null>(null);
  const [hasPermission, setHasPermission] = useState(false);
  const isCapturingRef = useRef(false);

  useEffect(() => {
    if (Platform.OS !== 'android') {
      setHasPermission(true);
      return;
    }
    PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.CAMERA).then(
      result => setHasPermission(result === PermissionsAndroid.RESULTS.GRANTED),
    );
  }, []);

  const handleCapture = useCallback(async () => {
    if (isCapturingRef.current || !cameraRef.current) {
      return;
    }
    isCapturingRef.current = true;

    try {
      const image = await cameraRef.current.capture();

      play('success');
      setFeedback({type: 'success', msg: 'Foto tersimpan'});
      onCapture({uri: image.uri, type: 'image/jpeg', name: filename});

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
    if (!hasPermission) {
      return;
    }
    register(() => captureRef.current());
    return () => unregister();
  }, [hasPermission, register, unregister]);

  if (!hasPermission) {
    return <View style={styles.container} />;
  }

  return (
    <View style={styles.container}>
      <Camera
        ref={cameraRef}
        style={StyleSheet.absoluteFill}
        cameraType={CameraType.Back}
        flashMode="off"
        focusMode="on"
        shutterPhotoSound={false}
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
