import React, {useState} from 'react';
import {View, Text, TouchableOpacity, Image, StyleSheet, Alert} from 'react-native';
import {launchCamera} from 'react-native-image-picker';
import BarcodeScanning from '@react-native-ml-kit/barcode-scanning';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import type {ScanStackParamList} from '../../navigation/types';
import {Colors, Fonts} from '../../constants';
import {useScan, type ScanImage} from '../../contexts/ScanContext';

type Props = NativeStackScreenProps<ScanStackParamList, 'ScanBarcode'>;

export default function ScanBarcodeScreen({navigation}: Props) {
  const {state, setPhoto4, setNobpkb} = useScan();
  const insets = useSafeAreaInsets();
  const [isProcessing, setIsProcessing] = useState(false);

  const captureAndScan = async () => {
    const response = await launchCamera({
      mediaType: 'photo',
      cameraType: 'back',
      quality: 0.8,
      maxWidth: 1920,
      maxHeight: 1080,
      saveToPhotos: false,
    });

    if (response.didCancel || !response.assets?.[0]) {
      return;
    }

    const asset = response.assets[0];
    const img: ScanImage = {
      uri: asset.uri!,
      type: asset.type || 'image/jpeg',
      name: asset.fileName || 'barcode_bpkb.jpg',
    };
    setPhoto4(img);

    setIsProcessing(true);
    try {
      const barcodes = await BarcodeScanning.scan(asset.uri!);

      if (barcodes.length > 0) {
        const barcodeValue = barcodes[0].value || '';
        setNobpkb(barcodeValue);
        Alert.alert('Barcode Terdeteksi', barcodeValue);
      } else {
        Alert.alert('Info', 'Barcode tidak terdeteksi. Masukkan manual di halaman Review.');
      }
    } catch {
      Alert.alert('Error', 'Gagal scan barcode. Masukkan manual di halaman Review.');
    } finally {
      setIsProcessing(false);
    }
  };

  const canProceed = state.photo4 !== null;

  return (
    <View style={[styles.container, {paddingBottom: 80 + insets.bottom}]}>
      <Text style={styles.title}>Scan Barcode BPKB</Text>
      <Text style={styles.desc}>Foto halaman barcode BPKB (No BPKB)</Text>

      <TouchableOpacity
        style={[styles.photoBox, state.photo4 && styles.photoBoxFilled]}
        onPress={captureAndScan}
        activeOpacity={0.8}>
        {state.photo4 ? (
          <Image source={{uri: state.photo4.uri}} style={styles.photoPreview} />
        ) : (
          <Text style={styles.photoLabel}>Tap untuk foto & scan</Text>
        )}
      </TouchableOpacity>

      {isProcessing && (
        <Text style={styles.processingText}>Memindai barcode...</Text>
      )}

      {state.nobpkb.length > 0 && (
        <View style={styles.resultCard}>
          <Text style={styles.resultLabel}>No BPKB terdeteksi:</Text>
          <Text style={styles.resultValue}>{state.nobpkb}</Text>
        </View>
      )}

      <TouchableOpacity
        style={[styles.nextButton, !canProceed && styles.nextButtonDisabled]}
        onPress={() => canProceed && navigation.navigate('Review')}
        disabled={!canProceed}
        activeOpacity={0.8}>
        <Text style={styles.nextButtonText}>Review & Kirim</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    padding: 24,
  },
  title: {
    fontFamily: Fonts.heading.semiBold,
    fontSize: 22,
    color: Colors.neutral,
  },
  desc: {
    fontFamily: Fonts.body.regular,
    fontSize: 14,
    color: Colors.neutral,
    opacity: 0.6,
    marginTop: 4,
    marginBottom: 20,
  },
  photoBox: {
    height: 250,
    backgroundColor: Colors.secondary,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: Colors.border,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  photoBoxFilled: {
    borderStyle: 'solid',
    borderColor: Colors.primary,
  },
  photoPreview: {
    width: '100%',
    height: '100%',
    borderRadius: 14,
  },
  photoLabel: {
    fontFamily: Fonts.body.medium,
    fontSize: 16,
    color: Colors.neutral,
    opacity: 0.4,
  },
  processingText: {
    fontFamily: Fonts.body.regular,
    fontSize: 14,
    color: Colors.primary,
    marginTop: 12,
    textAlign: 'center',
  },
  resultCard: {
    backgroundColor: Colors.secondary,
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  resultLabel: {
    fontFamily: Fonts.body.medium,
    fontSize: 12,
    color: Colors.neutral,
    opacity: 0.6,
  },
  resultValue: {
    fontFamily: Fonts.heading.semiBold,
    fontSize: 18,
    color: Colors.neutral,
  },
  nextButton: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 'auto',
  },
  nextButtonDisabled: {
    opacity: 0.4,
  },
  nextButtonText: {
    fontFamily: Fonts.heading.semiBold,
    fontSize: 16,
    color: Colors.onPrimary,
  },
});
