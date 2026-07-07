import React, {useState} from 'react';
import {View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {Colors, Fonts} from '../../constants';
import {useBpkbStream} from '../../hooks/useBpkbStream';

const STAGE_LABELS: Record<string, string> = {
  pending: 'Menunggu...',
  create_pdf: 'Membuat PDF...',
  update_stok_unit: 'Update Stok Unit...',
  update_tgl_bpkb_siap: 'Update Tanggal BPKB Siap...',
  completed: 'Selesai!',
  failed: 'Gagal',
};

const STATUS_COLORS: Record<string, string> = {
  queued: Colors.neutral,
  processing: Colors.primary,
  completed: '#16a34a',
  failed: Colors.destructive,
};

export default function TrackStatusScreen() {
  const [trackIdInput, setTrackIdInput] = useState('');
  const [trackId, setTrackId] = useState<string | null>(null);
  const {data, connected} = useBpkbStream(trackId);
  const insets = useSafeAreaInsets();

  const handleTrack = () => {
    const trimmed = trackIdInput.trim();
    if (trimmed) {
      setTrackId(trimmed);
    }
  };

  return (
    <View style={[styles.container, {paddingBottom: 80 + insets.bottom}]}>
      <Text style={styles.title}>Lacak Status BPKB</Text>

      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          placeholder="Masukkan Track ID"
          placeholderTextColor={Colors.border}
          value={trackIdInput}
          onChangeText={setTrackIdInput}
          autoCapitalize="none"
          autoCorrect={false}
        />
        <TouchableOpacity style={styles.trackButton} onPress={handleTrack}>
          <Text style={styles.trackButtonText}>Lacak</Text>
        </TouchableOpacity>
      </View>

      {trackId && (
        <View style={styles.statusCard}>
          <View style={styles.statusHeader}>
            <Text style={styles.statusTitle}>Status</Text>
            <View style={[styles.statusDot, {backgroundColor: STATUS_COLORS[data?.status || 'queued']}]} />
            <Text style={[styles.statusText, {color: STATUS_COLORS[data?.status || 'queued']}]}>
              {data?.status || 'queued'}
            </Text>
            {connected && <Text style={styles.connectedBadge}>LIVE</Text>}
          </View>

          {data?.stage && (
            <View style={styles.stageRow}>
              <Text style={styles.stageLabel}>Stage:</Text>
              <Text style={styles.stageValue}>{STAGE_LABELS[data.stage] || data.stage}</Text>
            </View>
          )}

          {data?.status === 'processing' && (
            <ActivityIndicator size="small" color={Colors.primary} style={styles.spinner} />
          )}

          {data?.status === 'completed' && data.pdf_url && (
            <View style={styles.pdfRow}>
              <Text style={styles.pdfLabel}>PDF siap:</Text>
              <Text style={styles.pdfUrl} numberOfLines={2}>{data.pdf_url}</Text>
            </View>
          )}

          {data?.error_message && (
            <View style={styles.errorRow}>
              <Text style={styles.errorLabel}>Error:</Text>
              <Text style={styles.errorText}>{data.error_message}</Text>
            </View>
          )}

          {!data && (
            <View style={styles.waitingRow}>
              <ActivityIndicator size="small" color={Colors.primary} />
              <Text style={styles.waitingText}>Menunggu update...</Text>
            </View>
          )}
        </View>
      )}
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
  title: {
    fontFamily: Fonts.heading.semiBold,
    fontSize: 22,
    color: Colors.neutral,
    marginBottom: 20,
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
  trackButton: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingHorizontal: 20,
    justifyContent: 'center',
  },
  trackButtonText: {
    fontFamily: Fonts.heading.semiBold,
    fontSize: 14,
    color: Colors.onPrimary,
  },
  statusCard: {
    backgroundColor: Colors.secondary,
    borderRadius: 16,
    padding: 20,
    marginTop: 24,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  statusTitle: {
    fontFamily: Fonts.heading.semiBold,
    fontSize: 16,
    color: Colors.neutral,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  statusText: {
    fontFamily: Fonts.heading.semiBold,
    fontSize: 16,
    textTransform: 'uppercase',
  },
  connectedBadge: {
    fontFamily: Fonts.body.medium,
    fontSize: 10,
    color: '#16a34a',
    backgroundColor: '#dcfce7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    overflow: 'hidden',
    marginLeft: 'auto',
  },
  stageRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  stageLabel: {
    fontFamily: Fonts.body.medium,
    fontSize: 14,
    color: Colors.neutral,
    opacity: 0.6,
  },
  stageValue: {
    fontFamily: Fonts.body.semiBold,
    fontSize: 14,
    color: Colors.neutral,
  },
  spinner: {
    marginTop: 8,
  },
  pdfRow: {
    marginTop: 12,
    padding: 12,
    backgroundColor: '#dcfce7',
    borderRadius: 8,
  },
  pdfLabel: {
    fontFamily: Fonts.body.medium,
    fontSize: 12,
    color: '#16a34a',
  },
  pdfUrl: {
    fontFamily: Fonts.body.regular,
    fontSize: 14,
    color: '#16a34a',
    marginTop: 4,
  },
  errorRow: {
    marginTop: 12,
    padding: 12,
    backgroundColor: '#fef2f2',
    borderRadius: 8,
  },
  errorLabel: {
    fontFamily: Fonts.body.medium,
    fontSize: 12,
    color: Colors.destructive,
  },
  errorText: {
    fontFamily: Fonts.body.regular,
    fontSize: 14,
    color: Colors.destructive,
    marginTop: 4,
  },
  waitingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
  },
  waitingText: {
    fontFamily: Fonts.body.regular,
    fontSize: 14,
    color: Colors.neutral,
    opacity: 0.6,
  },
});
