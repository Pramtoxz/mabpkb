import React, {useCallback, useRef, useState} from 'react';
import {View, Text, StyleSheet, ActivityIndicator} from 'react-native';
import {launchScanner} from '@dariyd/react-native-document-scanner';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import type {ScanStackParamList} from '../../navigation/types';
import {Colors, Fonts} from '../../constants';
import {useScan} from '../../contexts/ScanContext';
import {useSound} from '../../hooks/useSound';
import {useHardwareKey} from '../../hooks/useHardwareKey';
import {CameraIcon, CheckIcon} from '../../components/TabIcons';
import ScanStepIndicator from '../../components/ScanStepIndicator';

type Props = NativeStackScreenProps<ScanStackParamList, 'ScanStep1'>;
type Phase = 'idle' | 'scanning' | 'done';

export default function ScanStep1Screen({navigation}: Props) {
  const insets = useSafeAreaInsets();
  const {setPhoto1} = useScan();
  const {play} = useSound();
  const [phase, setPhase] = useState<Phase>('idle');
  const nextTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const triggerScan = useCallback(async () => {
    setPhase('scanning');
    try {
      const result = await launchScanner({quality: 0.8});

      if (result.didCancel) {
        setPhase('idle');
        return;
      }
      if (result.error || !result.images?.length) {
        play('error');
        setPhase('idle');
        return;
      }

      const image = result.images[0];
      setPhoto1({uri: image.uri, type: image.type || 'image/jpeg', name: 'hal1.jpg'});
      play('success');
      setPhase('done');
      nextTimerRef.current = setTimeout(() => navigation.navigate('ScanStep2'), 1000);
    } catch {
      play('error');
      setPhase('idle');
    }
  }, [navigation, play, setPhoto1]);

  const handleRetake = useCallback(() => {
    if (nextTimerRef.current) {clearTimeout(nextTimerRef.current);}
    setPhase('idle');
  }, []);

  useHardwareKey(triggerScan, phase === 'idle', 'volumeDown');
  useHardwareKey(handleRetake, phase === 'done', 'volumeUp');

  return (
    <View style={[styles.container, {paddingBottom: 24 + insets.bottom}]}>
      <ScanStepIndicator currentStep={1} totalSteps={5} />

      <View style={styles.cameraArea}>
        {phase === 'idle' && (
          <View style={styles.idleCard}>
            <CameraIcon size={48} color={Colors.primary} />
            <Text style={styles.idleText}>Siap untuk scan</Text>
          </View>
        )}
        {phase === 'scanning' && (
          <View style={styles.processingCard}>
            <ActivityIndicator size="large" color={Colors.primary} />
            <Text style={styles.processingText}>Membuka scanner...</Text>
          </View>
        )}
        {phase === 'done' && (
          <View style={styles.doneCard}>
            <CheckIcon size={56} color="#16a34a" />
            <Text style={styles.doneText}>Foto 1 tersimpan</Text>
          </View>
        )}
      </View>

      <View style={styles.hintCard}>
        <Text style={styles.hintTitle}>Foto Halaman 1</Text>
        <Text style={styles.hintDesc}>
          {phase === 'done'
            ? 'Tekan Volume Atas untuk ulang'
            : 'Tekan pedal (Volume Bawah) untuk scan'}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    padding: 16,
  },
  cameraArea: {
    flex: 1,
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 16,
  },
  idleCard: {
    flex: 1,
    backgroundColor: Colors.secondary,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Colors.border,
    borderStyle: 'dashed',
    gap: 12,
  },
  idleText: {
    fontFamily: Fonts.heading.semiBold,
    fontSize: 16,
    color: Colors.primary,
  },
  processingCard: {
    flex: 1,
    backgroundColor: '#eff6ff',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Colors.primary,
    gap: 12,
  },
  processingText: {
    fontFamily: Fonts.heading.semiBold,
    fontSize: 18,
    color: Colors.primary,
  },
  doneCard: {
    flex: 1,
    backgroundColor: '#dcfce7',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#16a34a',
    gap: 8,
  },
  doneText: {
    fontFamily: Fonts.heading.semiBold,
    fontSize: 18,
    color: '#16a34a',
  },
  hintCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  hintTitle: {
    fontFamily: Fonts.heading.bold,
    fontSize: 20,
    color: Colors.primary,
    marginBottom: 4,
  },
  hintDesc: {
    fontFamily: Fonts.body.regular,
    fontSize: 14,
    color: Colors.neutral,
    opacity: 0.6,
    textAlign: 'center',
  },
});
