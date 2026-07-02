import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Image,
  ScrollView,
  ActivityIndicator,
  PermissionsAndroid,
  Platform,
  Alert,
} from 'react-native';
import { launchImageLibrary, launchCamera } from 'react-native-image-picker';
import TextRecognition, {
  TextRecognitionScript,
} from '@react-native-ml-kit/text-recognition';

interface Props {
  onBack: () => void;
}

export default function TextRecognitionScreen({ onBack }: Props) {
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [result, setResult] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const requestCameraPermission = async (): Promise<boolean> => {
    if (Platform.OS !== 'android') return true;
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.CAMERA,
        {
          title: 'Izin Kamera',
          message: 'Aplikasi membutuhkan akses kamera untuk mengambil gambar',
          buttonPositive: 'Izinkan',
          buttonNegative: 'Tolak',
        },
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    } catch {
      return false;
    }
  };

  const pickImage = async (useCamera: boolean) => {
    if (useCamera) {
      const hasPermission = await requestCameraPermission();
      if (!hasPermission) {
        Alert.alert(
          'Izin Ditolak',
          'Tidak bisa membuka kamera tanpa izin. Aktifkan di Pengaturan.',
        );
        return;
      }
    }

    const options = {
      mediaType: 'photo' as const,
      maxWidth: 1200,
      maxHeight: 1200,
      quality: 0.8 as const,
    };

    const response = useCamera
      ? await launchCamera(options)
      : await launchImageLibrary(options);

    if (response.didCancel || !response.assets?.[0]?.uri) {
      return;
    }

    const uri = response.assets[0].uri;
    setImageUri(uri);
    setResult('');
    setLoading(true);

    try {
      const recognized = await TextRecognition.recognize(
        uri,
        TextRecognitionScript.LATIN,
      );
      setResult(recognized.text || 'Tidak ada teks yang terdeteksi');
    } catch (error: any) {
      setResult(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack}>
          <Text style={styles.backButton}>← Kembali</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Text Recognition</Text>
      </View>

      <View style={styles.buttonRow}>
        <TouchableOpacity
          style={styles.button}
          onPress={() => pickImage(false)}
        >
          <Text style={styles.buttonText}>Galeri</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.button}
          onPress={() => pickImage(true)}
        >
          <Text style={styles.buttonText}>Kamera</Text>
        </TouchableOpacity>
      </View>

      {imageUri && (
        <Image source={{ uri: imageUri }} style={styles.preview} />
      )}

      {loading && (
        <ActivityIndicator
          size="large"
          color="#2196F3"
          style={styles.loader}
        />
      )}

      {result !== '' && !loading && (
        <ScrollView style={styles.resultBox}>
          <Text style={styles.resultLabel}>Hasil:</Text>
          <Text style={styles.resultText}>{result}</Text>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 20,
    paddingBottom: 10,
  },
  backButton: {
    fontSize: 16,
    color: '#2196F3',
    marginBottom: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  buttonRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 12,
  },
  button: {
    flex: 1,
    backgroundColor: '#2196F3',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  preview: {
    width: '90%',
    height: 200,
    resizeMode: 'contain',
    alignSelf: 'center',
    marginTop: 16,
    borderRadius: 8,
    backgroundColor: '#ddd',
  },
  loader: {
    marginTop: 20,
  },
  resultBox: {
    margin: 20,
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 8,
    maxHeight: 300,
  },
  resultLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
  },
  resultText: {
    fontSize: 15,
    color: '#1a1a1a',
    lineHeight: 22,
  },
});
