import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
} from 'react-native';

interface HomeScreenProps {
  onNavigate: (screen: 'text' | 'barcode' | 'document') => void;
}

export default function HomeScreen({ onNavigate }: HomeScreenProps) {
  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>MABPKB ML Kit</Text>
      <Text style={styles.subtitle}>Pilih fitur yang ingin digunakan</Text>

      <TouchableOpacity
        style={styles.card}
        onPress={() => onNavigate('text')}
        activeOpacity={0.7}
      >
        <Text style={styles.cardIcon}>A</Text>
        <View style={styles.cardContent}>
          <Text style={styles.cardTitle}>Text Recognition</Text>
          <Text style={styles.cardDesc}>
            Ambil gambar, lalu kenali teks di dalamnya
          </Text>
        </View>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.card}
        onPress={() => onNavigate('barcode')}
        activeOpacity={0.7}
      >
        <Text style={styles.cardIcon}>|||</Text>
        <View style={styles.cardContent}>
          <Text style={styles.cardTitle}>Barcode Scanner</Text>
          <Text style={styles.cardDesc}>
            Scan barcode atau QR code dari gambar
          </Text>
        </View>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.card}
        onPress={() => onNavigate('document')}
        activeOpacity={0.7}
      >
        <Text style={styles.cardIcon}>[]</Text>
        <View style={styles.cardContent}>
          <Text style={styles.cardTitle}>Document Scanner</Text>
          <Text style={styles.cardDesc}>
            Scan dokumen dengan deteksi tepi otomatis
          </Text>
        </View>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginTop: 20,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 8,
    marginBottom: 30,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  cardIcon: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2196F3',
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#E3F2FD',
    textAlign: 'center',
    lineHeight: 50,
    overflow: 'hidden',
  },
  cardContent: {
    marginLeft: 16,
    flex: 1,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  cardDesc: {
    fontSize: 14,
    color: '#888',
    marginTop: 4,
  },
});
