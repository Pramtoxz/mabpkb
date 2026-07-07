import React, {useState} from 'react';
import {View, Text, TouchableOpacity, Image, TextInput, StyleSheet, Alert, ActivityIndicator} from 'react-native';
import {launchCamera} from 'react-native-image-picker';
import TextRecognition from '@react-native-ml-kit/text-recognition';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import type {ScanStackParamList} from '../../navigation/types';
import {Colors, Fonts} from '../../constants';
import {useScan, type ScanImage} from '../../contexts/ScanContext';
import {getDealer} from '../../api';

type Props = NativeStackScreenProps<ScanStackParamList, 'ScanNoMesin'>;

const NO_MESIN_REGEX = /[A-Z0-9]{8,16}/;

export default function ScanNoMesinScreen({navigation}: Props) {
  const {state, setPhoto3, setNomesin, setDealer} = useScan();
  const insets = useSafeAreaInsets();
  const [manualInput, setManualInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const captureAndOCR = async () => {
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
      name: asset.fileName || 'no_mesin.jpg',
    };
    setPhoto3(img);

    setIsProcessing(true);
    try {
      const result = await TextRecognition.recognize(asset.uri!);
      const fullText = result.text;
      const match = fullText.match(NO_MESIN_REGEX);

      if (match) {
        setNomesin(match[0]);
        await fetchDealer(match[0]);
      } else {
        Alert.alert('OCR', 'Nomor mesin tidak terdeteksi. Masukkan manual.');
      }
    } catch {
      Alert.alert('Error', 'Gagal membaca teks. Masukkan manual.');
    } finally {
      setIsProcessing(false);
    }
  };

  const fetchDealer = async (nomesin: string) => {
    try {
      const data = await getDealer(nomesin);
      if (data) {
        setDealer(data);
      } else {
        Alert.alert('Info', 'Dealer tidak ditemukan untuk nomor mesin ini.');
      }
    } catch {
      Alert.alert('Error', 'Gagal mengambil data dealer.');
    }
  };

  const handleManualSubmit = async () => {
    const trimmed = manualInput.trim().toUpperCase();
    if (!trimmed) {
      return;
    }
    setNomesin(trimmed);
    setIsProcessing(true);
    try {
      await fetchDealer(trimmed);
    } finally {
      setIsProcessing(false);
    }
  };

  const canProceed = state.nomesin.length > 0;

  return (
    <View style={[styles.container, {paddingBottom: 80 + insets.bottom}]}>
      <Text style={styles.title}>No Mesin Kendaraan</Text>
      <Text style={styles.desc}>Foto halaman 3 untuk OCR, atau masukkan manual</Text>

      <TouchableOpacity
        style={[styles.photoBox, state.photo3 && styles.photoBoxFilled]}
        onPress={captureAndOCR}
        activeOpacity={0.8}>
        {state.photo3 ? (
          <Image source={{uri: state.photo3.uri}} style={styles.photoPreview} />
        ) : (
          <Text style={styles.photoLabel}>Tap untuk foto</Text>
        )}
      </TouchableOpacity>

      {isProcessing && (
        <View style={styles.processingRow}>
          <ActivityIndicator size="small" color={Colors.primary} />
          <Text style={styles.processingText}>Memproses OCR...</Text>
        </View>
      )}

      <View style={styles.manualSection}>
        <Text style={styles.manualLabel}>Atau masukkan manual:</Text>
        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            placeholder="Contoh: JFP1E2714484"
            placeholderTextColor={Colors.border}
            value={manualInput}
            onChangeText={setManualInput}
            autoCapitalize="characters"
            autoCorrect={false}
          />
          <TouchableOpacity style={styles.searchButton} onPress={handleManualSubmit}>
            <Text style={styles.searchButtonText}>Cari</Text>
          </TouchableOpacity>
        </View>
      </View>

      {state.nomesin.length > 0 && (
        <View style={styles.resultCard}>
          <Text style={styles.resultLabel}>No Mesin:</Text>
          <Text style={styles.resultValue}>{state.nomesin}</Text>
          {state.dealer && (
            <>
              <Text style={styles.resultLabel}>Dealer:</Text>
              <Text style={styles.resultValue}>{state.dealer.nm_dealer}</Text>
            </>
          )}
        </View>
      )}

      <TouchableOpacity
        style={[styles.nextButton, !canProceed && styles.nextButtonDisabled]}
        onPress={() => canProceed && navigation.navigate('ScanBarcode')}
        disabled={!canProceed}
        activeOpacity={0.8}>
        <Text style={styles.nextButtonText}>Selanjutnya</Text>
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
    height: 180,
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
  processingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    gap: 8,
  },
  processingText: {
    fontFamily: Fonts.body.regular,
    fontSize: 14,
    color: Colors.primary,
  },
  manualSection: {
    marginTop: 20,
  },
  manualLabel: {
    fontFamily: Fonts.body.medium,
    fontSize: 14,
    color: Colors.neutral,
    marginBottom: 8,
  },
  inputRow: {
    flexDirection: 'row',
    gap: 8,
  },
  input: {
    flex: 1,
    fontFamily: Fonts.body.regular,
    fontSize: 16,
    backgroundColor: Colors.secondary,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: Colors.neutral,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  searchButton: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingHorizontal: 20,
    justifyContent: 'center',
  },
  searchButtonText: {
    fontFamily: Fonts.heading.semiBold,
    fontSize: 14,
    color: Colors.onPrimary,
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
    marginBottom: 8,
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
