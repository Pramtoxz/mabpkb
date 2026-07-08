import React, {useCallback, useState} from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import type {ScanStackParamList} from '../../navigation/types';
import {Colors, Fonts} from '../../constants';
import {useScan, type ScanImage} from '../../contexts/ScanContext';
import {CheckIcon} from '../../components/TabIcons';
import ScanStepIndicator from '../../components/ScanStepIndicator';
import PedalCamera from '../../components/PedalCamera';

type Props = NativeStackScreenProps<ScanStackParamList, 'ScanStep2'>;

export default function ScanStep2Screen({navigation}: Props) {
  const insets = useSafeAreaInsets();
  const {setPhoto2} = useScan();
  const [captured, setCaptured] = useState(false);

  const handleCapture = useCallback((img: ScanImage) => {
    setPhoto2(img);
    setCaptured(true);
    setTimeout(() => navigation.navigate('ScanStep3'), 1000);
  }, [navigation, setPhoto2]);

  return (
    <View style={[styles.container, {paddingBottom: 24 + insets.bottom}]}>
      <ScanStepIndicator currentStep={2} totalSteps={4} />

      <View style={styles.cameraArea}>
        {!captured ? (
          <PedalCamera filename="hal2.jpg" onCapture={handleCapture} />
        ) : (
          <View style={styles.doneCard}>
            <CheckIcon size={56} color="#16a34a" />
            <Text style={styles.doneText}>Foto 2 tersimpan</Text>
          </View>
        )}
      </View>

      <View style={styles.hintCard}>
        <Text style={styles.hintTitle}>Foto Halaman 2</Text>
        <Text style={styles.hintDesc}>Tekan tombol Volume Up atau pedal untuk foto</Text>
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
