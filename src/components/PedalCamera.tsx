import React, {useRef, useEffect, useState} from 'react';
import {View, StyleSheet} from 'react-native';
import {Camera, useCameraDevice, useCameraPermission} from 'react-native-vision-camera';
import {useVolumeKey} from '../hooks/useVolumeKey';
import {useSound} from '../hooks/useSound';
import type {ScanImage} from '../contexts/ScanContext';
import ScanFeedback from './ScanFeedback';
import {Colors} from '../constants';

interface PedalCameraProps {
  filename: string;
  onCapture: (img: ScanImage) => void;
  enabled?: boolean;
}

export default function PedalCamera({filename, onCapture, enabled = true}: PedalCameraProps) {
  const {hasPermission, requestPermission} = useCameraPermission();
  const device = useCameraDevice('back');
  const cameraRef = useRef<Camera>(null);
  const {play} = useSound();
  const [feedback, setFeedback] = useState<{type: 'success' | 'error'; msg: string} | null>(null);
  const isCapturingRef = useRef(false);

  useEffect(() => {
    if (!hasPermission) {
      requestPermission();
    }
  }, [hasPermission, requestPermission]);

  const handleCapture = async () => {
    if (isCapturingRef.current || !cameraRef.current) {return;}
    isCapturingRef.current = true;

    try {
      const photo = await cameraRef.current.takePhoto({
        qualityPrioritization: 'balanced',
        flash: 'off',
      });

      const img: ScanImage = {
        uri: `file://${photo.path}`,
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
    } catch {
      play('error');
      setFeedback({type: 'error', msg: 'Gagal mengambil foto'});
      isCapturingRef.current = false;
    }
  };

  useVolumeKey(handleCapture, enabled && !isCapturingRef.current && !feedback && hasPermission && !!device);

  if (!hasPermission || !device) {
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
        enableZoomGesture={false}
      />
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
