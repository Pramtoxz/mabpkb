import React, {useRef, useState, useEffect} from 'react';
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

export default function PedalCamera({filename, onCapture, overlayVariant = 'document'}: PedalCameraProps) {
  const cameraRef = useRef<CameraApi>(null);
  const {play} = useSound();
  const [feedback, setFeedback] = useState<{type: 'success' | 'error'; msg: string} | null>(null);
  const [hasPermission, setHasPermission] = useState(false);
  const isCapturingRef = useRef(false);

  useEffect(() => {
    console.log('[PedalCamera] mounted — requesting permission');
    if (Platform.OS !== 'android') {
      setHasPermission(true);
      return;
    }
    PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.CAMERA).then(result => {
      console.log('[PedalCamera] permission result:', result);
      setHasPermission(result === PermissionsAndroid.RESULTS.GRANTED);
    });
  }, []);

  useEffect(() => {
    console.log('[PedalCamera] hasPermission:', hasPermission);
  }, [hasPermission]);

  const handleCapture = async () => {
    console.log('[PedalCamera] handleCapture called — isCapturing:', isCapturingRef.current, 'hasPermission:', hasPermission, 'cameraRef:', !!cameraRef.current);
    if (isCapturingRef.current || !cameraRef.current || !hasPermission) {
      console.log('[PedalCamera] capture skipped');
      return;
    }
    isCapturingRef.current = true;

    try {
      console.log('[PedalCamera] calling camera.capture()');
      const image = await cameraRef.current.capture();
      console.log('[PedalCamera] capture success:', image.uri);

      const img: ScanImage = {
        uri: image.uri,
        type: 'image/jpeg',
        name: filename,
      };

      play('success');
      setFeedback({type: 'success', msg: 'Foto tersimpan'});
      onCapture(img);

      setTimeout(() => {
        setFeedback(null);
        isCapturingRef.current = false;
      }, 1200);
    } catch (e) {
      console.log('[PedalCamera] capture error:', e);
      play('error');
      setFeedback({type: 'error', msg: 'Gagal mengambil foto'});
      isCapturingRef.current = false;
    }
  };

  const {register, unregister} = usePedal();

  useEffect(() => {
    if (hasPermission) {
      register(handleCapture);
    }
    return () => unregister();
  }, [hasPermission]);

  if (!hasPermission) {
    console.log('[PedalCamera] rendering empty — no permission');
    return <View style={styles.container} />;
  }

  console.log('[PedalCamera] rendering camera');
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
      {overlayVariant !== 'none' && (
        <DocumentOverlay variant={overlayVariant} />
      )}
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
