import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {Colors, Fonts} from '../../constants';

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>MABPKB</Text>
        <Text style={styles.subtitle}>Scan Dokumen BPKB</Text>
      </View>

      <View style={styles.stats}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>0</Text>
          <Text style={styles.statLabel}>Hari Ini</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>0</Text>
          <Text style={styles.statLabel}>Pending</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>0</Text>
          <Text style={styles.statLabel}>Selesai</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    padding: 24,
    paddingBottom: 100,
  },
  header: {
    marginTop: 16,
    marginBottom: 32,
  },
  title: {
    fontFamily: Fonts.heading.bold,
    fontSize: 28,
    color: Colors.primary,
  },
  subtitle: {
    fontFamily: Fonts.body.regular,
    fontSize: 16,
    color: Colors.neutral,
    marginTop: 4,
  },
  stats: {
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.secondary,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  statNumber: {
    fontFamily: Fonts.heading.bold,
    fontSize: 28,
    color: Colors.primary,
  },
  statLabel: {
    fontFamily: Fonts.body.medium,
    fontSize: 12,
    color: Colors.neutral,
    marginTop: 4,
    opacity: 0.7,
  },
});
