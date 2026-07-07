import React from 'react';
import {View, Text, TouchableOpacity, Image, StyleSheet} from 'react-native';
import {launchCamera} from 'react-native-image-picker';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import type {ScanStackParamList} from '../../navigation/types';
import {Colors, Fonts} from '../../constants';
import {useScan, type ScanImage} from '../../contexts/ScanContext';

type Props = NativeStackScreenProps<ScanStackParamList, 'ScanIdentity'>;

export default function ScanIdentityScreen({navigation}: Props) {
  const {state, setPhoto1, setPhoto2} = useScan();
  const insets = useSafeAreaInsets();

  const capturePhoto = async (slot: 1 | 2) => {
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
      name: asset.fileName || `identity_${slot}.jpg`,
    };

    if (slot === 1) {
      setPhoto1(img);
    } else {
      setPhoto2(img);
    }
  };

  const canProceed = state.photo1 && state.photo2;

  return (
    <View style={[styles.container, {paddingBottom: 80 + insets.bottom}]}>
      <Text style={styles.title}>Foto Identitas BPKB</Text>
      <Text style={styles.desc}>Ambil foto halaman 1 dan halaman 2</Text>

      <View style={styles.photoRow}>
        <TouchableOpacity
          style={[styles.photoBox, state.photo1 && styles.photoBoxFilled]}
          onPress={() => capturePhoto(1)}
          activeOpacity={0.8}>
          {state.photo1 ? (
            <Image source={{uri: state.photo1.uri}} style={styles.photoPreview} />
          ) : (
            <Text style={styles.photoLabel}>Foto 1</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.photoBox, state.photo2 && styles.photoBoxFilled]}
          onPress={() => capturePhoto(2)}
          activeOpacity={0.8}>
          {state.photo2 ? (
            <Image source={{uri: state.photo2.uri}} style={styles.photoPreview} />
          ) : (
            <Text style={styles.photoLabel}>Foto 2</Text>
          )}
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={[styles.nextButton, !canProceed && styles.nextButtonDisabled]}
        onPress={() => canProceed && navigation.navigate('ScanNoMesin')}
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
    marginBottom: 24,
  },
  photoRow: {
    flexDirection: 'row',
    gap: 16,
  },
  photoBox: {
    flex: 1,
    aspectRatio: 3 / 4,
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
