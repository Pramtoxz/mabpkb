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
import BarcodeScanning, { BarcodeFormat } from '@react-native-ml-kit/barcode-scanning';

interface Props {
  onBack: () => void;
}

const FORMAT_NAMES: Record<number, string> = {
  [BarcodeFormat.QR_CODE]: 'QR Code',
  [BarcodeFormat.EAN_13]: 'EAN-13',
  [BarcodeFormat.EAN_8]: 'EAN-8',
  [BarcodeFormat.CODE_128]: 'Code 128',
  [BarcodeFormat.CODE_39]: 'Code 39',
  [BarcodeFormat.CODE_93]: 'Code 93',
  [BarcodeFormat.UPC_A]: 'UPC-A',
  [BarcodeFormat.UPC_E]: 'UPC-E',
  [BarcodeFormat.PDF417]: 'PDF417',
  [BarcodeFormat.DATA_MATRIX]: 'Data Matrix',
  [BarcodeFormat.AZTEC]: 'Aztec',
  [BarcodeFormat.CODABAR]: 'Codabar',
  [BarcodeFormat.ITF]: 'ITF',
};

interface BarcodeResult {
  format: number;
  value: string;
}

export default function BarcodeScannerScreen({ onBack }: Props) {
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [barcodes, setBarcodes] = useState<BarcodeResult[]>([]);
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
    setBarcodes([]);
    setLoading(true);

    try {
      const results = await BarcodeScanning.scan(uri);
      setBarcodes(results as BarcodeResult[]);
    } catch (error: any) {
      setBarcodes([{ format: -1, value: `Error: ${error.message}` }]);
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
        <Text style={styles.title}>Barcode Scanner</Text>
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
          color="#4CAF50"
          style={styles.loader}
        />
      )}

      {barcodes.length > 0 && !loading && (
        <ScrollView style={styles.resultBox}>
          <Text style={styles.resultLabel}>
            Ditemukan {barcodes.length} barcode:
          </Text>
          {barcodes.map((barcode, index) => (
            <View key={index} style={styles.barcodeItem}>
              <Text style={styles.barcodeFormat}>
                {FORMAT_NAMES[barcode.format] || `Format ${barcode.format}`}
              </Text>
              <Text style={styles.barcodeValue} selectable>
                {barcode.value}
              </Text>
            </View>
          ))}
        </ScrollView>
      )}

      {!loading && imageUri && barcodes.length === 0 && (
        <View style={styles.resultBox}>
          <Text style={styles.noResult}>
            Tidak ada barcode yang terdeteksi
          </Text>
        </View>
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
    color: '#4CAF50',
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
    backgroundColor: '#4CAF50',
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
    marginBottom: 12,
  },
  barcodeItem: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  barcodeFormat: {
    fontSize: 12,
    color: '#4CAF50',
    fontWeight: '600',
    marginBottom: 4,
  },
  barcodeValue: {
    fontSize: 16,
    color: '#1a1a1a',
  },
  noResult: {
    fontSize: 15,
    color: '#999',
    textAlign: 'center',
    padding: 20,
  },
});
