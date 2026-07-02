import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Image,
  ScrollView,
  Alert,
} from 'react-native';
import { launchScanner, ImageObject } from '@dariyd/react-native-document-scanner';

interface Props {
  onBack: () => void;
}

export default function DocumentScannerScreen({ onBack }: Props) {
  const [pages, setPages] = useState<ImageObject[]>([]);
  const [status, setStatus] = useState('');

  const scan = async () => {
    try {
      setStatus('Membuka scanner...');
      const result = await launchScanner({
        quality: 0.8,
        includeExif: false,
      });

      if (result.didCancel) {
        setStatus('Dibatalkan');
      } else if (result.error) {
        setStatus(`Error: ${result.errorMessage}`);
        Alert.alert('Error', result.errorMessage || 'Gagal scan dokumen');
      } else {
        setPages(result.images ?? []);
        setStatus(`Berhasil scan ${result.images?.length ?? 0} halaman`);
      }
    } catch (err: any) {
      setStatus(`Exception: ${err.message}`);
      Alert.alert('Error', err.message);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack}>
          <Text style={styles.backButton}>← Kembali</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Document Scanner</Text>
      </View>

      <TouchableOpacity style={styles.scanButton} onPress={scan}>
        <Text style={styles.scanButtonText}>Scan Dokumen</Text>
      </TouchableOpacity>

      {status !== '' && <Text style={styles.status}>{status}</Text>}

      {pages.length > 0 && (
        <ScrollView horizontal style={styles.pagesScroll}>
          {pages.map((img, i) => (
            <View key={img.fileName || i} style={styles.pageCard}>
              <Image source={{ uri: img.uri }} style={styles.pageImage} />
              <Text style={styles.pageInfo}>
                Halaman {i + 1} — {Math.round(img.fileSize / 1024)} KB
              </Text>
              <Text style={styles.pageDim}>
                {img.width} x {img.height}
              </Text>
            </View>
          ))}
        </ScrollView>
      )}

      {pages.length > 0 && (
        <ScrollView style={styles.detailBox}>
          <Text style={styles.detailLabel}>Detail Gambar:</Text>
          {pages.map((img, i) => (
            <View key={i} style={styles.detailItem}>
              <Text style={styles.detailText}>
                {i + 1}. {img.fileName}{'\n'}
                Tipe: {img.type}{'\n'}
                Ukuran: {Math.round(img.fileSize / 1024)} KB
              </Text>
            </View>
          ))}
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
    color: '#FF9800',
    marginBottom: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  scanButton: {
    backgroundColor: '#FF9800',
    marginHorizontal: 20,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  scanButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  status: {
    marginHorizontal: 20,
    marginTop: 12,
    fontSize: 14,
    color: '#666',
  },
  pagesScroll: {
    marginTop: 16,
    paddingLeft: 20,
    maxHeight: 250,
  },
  pageCard: {
    marginRight: 12,
    alignItems: 'center',
    width: 150,
  },
  pageImage: {
    width: 150,
    height: 180,
    borderRadius: 8,
    backgroundColor: '#ddd',
    resizeMode: 'cover',
  },
  pageInfo: {
    fontSize: 12,
    color: '#666',
    marginTop: 6,
  },
  pageDim: {
    fontSize: 11,
    color: '#999',
  },
  detailBox: {
    margin: 20,
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 8,
    maxHeight: 200,
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
  },
  detailItem: {
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  detailText: {
    fontSize: 13,
    color: '#1a1a1a',
    lineHeight: 20,
  },
});
