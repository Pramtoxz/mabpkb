import React, {useState} from 'react';
import {View, Text, TextInput, TouchableOpacity, Image, ScrollView, StyleSheet, ActivityIndicator} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import type {ScanStackParamList} from '../../navigation/types';
import {Colors, Fonts} from '../../constants';
import {useScan} from '../../contexts/ScanContext';
import {useAlert} from '../../contexts/AlertContext';
import {showErrorToast} from '../../utils/toast';
import {processBpkb} from '../../api';

type Props = NativeStackScreenProps<ScanStackParamList, 'Review'>;

export default function ReviewScreen({navigation}: Props) {
  const {state, setNobpkb, resetScan} = useScan();
  const {showAlert} = useAlert();
  const insets = useSafeAreaInsets();
  const [nobpkbInput, setNobpkbInput] = useState(state.nobpkb);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    const nobpkb = nobpkbInput.trim();
    if (!nobpkb) {
      showErrorToast('No BPKB harus diisi.');
      return;
    }
    if (!state.photo1 || !state.photo2 || !state.photo3 || !state.photo4) {
      showErrorToast('Semua foto harus diambil.');
      return;
    }

    setNobpkb(nobpkb);
    setIsSubmitting(true);

    try {
      const result = await processBpkb(state.nomesin, nobpkb, [
        state.photo1,
        state.photo2,
        state.photo3,
        state.photo4,
      ]);

      showAlert({
        title: 'Berhasil',
        message: `BPKB sedang diproses.\nTrack ID: ${result.track_id}`,
        type: 'success',
        confirmText: 'Lacak Status',
        cancelText: 'Scan Lagi',
        onConfirm: () => {
          resetScan();
          navigation.getParent()?.navigate('BatchTab', {screen: 'TrackStatus', params: {trackId: result.track_id}});
        },
        onCancel: () => {
          resetScan();
          navigation.getParent()?.navigate('ScanTab', {screen: 'ScanStep1'});
        },
      });
    } catch (error: any) {
      const message = error?.data?.errors
        ? Object.values(error.data.errors).flat().join('\n')
        : error?.data?.message || 'Terjadi kesalahan.';
      showErrorToast(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const photos = [state.photo1, state.photo2, state.photo3, state.photo4];

  return (
    <ScrollView style={styles.container} contentContainerStyle={[styles.content, {paddingBottom: 24 + insets.bottom}]}>
      <Text style={styles.title}>Review Data</Text>

      <View style={styles.section}>
        <Text style={styles.sectionLabel}>No Mesin</Text>
        <Text style={styles.sectionValue}>{state.nomesin || '-'}</Text>
      </View>

      {state.dealer && (
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Dealer</Text>
          <Text style={styles.sectionValue}>{state.dealer.nm_dealer}</Text>
        </View>
      )}

      <View style={styles.section}>
        <Text style={styles.sectionLabel}>No BPKB</Text>
        <TextInput
          style={styles.input}
          placeholder="Masukkan atau edit No BPKB"
          placeholderTextColor={Colors.border}
          value={nobpkbInput}
          onChangeText={setNobpkbInput}
          autoCapitalize="characters"
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Foto (4)</Text>
        <View style={styles.photoGrid}>
          {photos.map((photo, index) => (
            <View key={index} style={styles.photoThumb}>
              {photo ? (
                <Image source={{uri: photo.uri}} style={styles.photoImage} />
              ) : (
                <Text style={styles.photoMissing}>{index + 1}</Text>
              )}
            </View>
          ))}
        </View>
      </View>

      <TouchableOpacity
        style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
        onPress={handleSubmit}
        disabled={isSubmitting}
        activeOpacity={0.8}>
        {isSubmitting ? (
          <ActivityIndicator color={Colors.onPrimary} />
        ) : (
          <Text style={styles.submitButtonText}>Kirim BPKB</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    padding: 24,
  },
  title: {
    fontFamily: Fonts.heading.semiBold,
    fontSize: 22,
    color: Colors.neutral,
    marginBottom: 24,
  },
  section: {
    marginBottom: 20,
  },
  sectionLabel: {
    fontFamily: Fonts.body.medium,
    fontSize: 12,
    color: Colors.neutral,
    opacity: 0.6,
    marginBottom: 4,
  },
  sectionValue: {
    fontFamily: Fonts.heading.semiBold,
    fontSize: 18,
    color: Colors.neutral,
  },
  input: {
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
  photoGrid: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  photoThumb: {
    width: 72,
    height: 96,
    backgroundColor: Colors.secondary,
    borderRadius: 8,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  photoImage: {
    width: '100%',
    height: '100%',
  },
  photoMissing: {
    fontFamily: Fonts.body.medium,
    fontSize: 18,
    color: Colors.neutral,
    opacity: 0.3,
  },
  submitButton: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 24,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    fontFamily: Fonts.heading.semiBold,
    fontSize: 16,
    color: Colors.onPrimary,
  },
});
