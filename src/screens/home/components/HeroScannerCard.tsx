import React from 'react';
import {View, Text, StyleSheet, Image, TouchableOpacity} from 'react-native';
import Svg, {Path} from 'react-native-svg';
import {Colors, Images, Spacing, Radius} from '../../../constants';
import {usePedalStatus} from '../../../hooks/usePedalStatus';

interface HeroScannerCardProps {
  onPressScan: () => void;
}

export default function HeroScannerCard({onPressScan}: HeroScannerCardProps) {
  const {isConnected} = usePedalStatus();

  return (
    <View style={styles.card}>
      <View style={styles.cardHeaderRow}>
        <View style={styles.systemTag}>
          <Text style={styles.systemTagText}>SISTEM TRIPOD</Text>
        </View>

        <View
          style={[
            styles.telemetryBadge,
            isConnected
              ? styles.telemetryBadgeConnected
              : styles.telemetryBadgeDisconnected,
          ]}>
          <View
            style={[
              styles.statusDot,
              isConnected ? styles.statusDotConnected : styles.statusDotDisconnected,
            ]}
          />
          <Text
            style={[
              styles.telemetryText,
              isConnected
                ? styles.telemetryTextConnected
                : styles.telemetryTextDisconnected,
            ]}>
            {isConnected ? 'Pedal Siap' : 'Mode Tidur'}
          </Text>
        </View>
      </View>

      <View style={styles.imageContainer}>
        <Image
          source={Images.scanner3DDevice}
          style={styles.scannerImage}
          resizeMode="contain"
        />
      </View>

      <Text style={styles.headline}>Siap Memindai BPKB</Text>
      <Text style={styles.subHeadline}>
        Injak pedal kaki Bluetooth atau ketuk tombol di bawah.
      </Text>

      <TouchableOpacity
        style={styles.primaryButton}
        activeOpacity={0.85}
        onPress={onPressScan}>
        <View style={styles.buttonContentRow}>
          <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
            <Path
              d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"
              stroke={Colors.white}
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <Path
              d="M12 17a4 4 0 1 0 0-8 4 4 0 0 0 0 8z"
              stroke={Colors.white}
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </Svg>
          <Text style={styles.buttonText}>Mulai Scan BPKB</Text>
        </View>
      </TouchableOpacity>

      <View
        style={[
          styles.triggerHintPill,
          isConnected
            ? styles.triggerHintPillConnected
            : styles.triggerHintPillDisconnected,
        ]}>
        <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
          <Path
            d="M6.5 6.5l11 11L12 23V1l5.5 5.5-11 11"
            stroke={isConnected ? Colors.primary : Colors.textTertiary}
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Svg>
        <Text
          style={[
            styles.triggerHintText,
            isConnected
              ? styles.triggerHintTextConnected
              : styles.triggerHintTextDisconnected,
          ]}>
          {isConnected
            ? 'Pedal Bluetooth Terhubung '
            : 'Pedal Belum Tersambung • Tahan Pedal Sampai Terkalibrasi'}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.xxl,
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.lg,
    marginHorizontal: Spacing.xl,
    marginBottom: Spacing.lg,
    alignItems: 'center',
    shadowColor: Colors.primary,
    shadowOffset: {width: 0, height: 10},
    shadowOpacity: 0.14,
    shadowRadius: 20,
    elevation: 5,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  cardHeaderRow: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.xs,
  },
  systemTag: {
    backgroundColor: Colors.surfaceAlt,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radius.md,
  },
  systemTagText: {
    fontFamily: 'Poppins-Bold',
    fontSize: 9.5,
    color: Colors.textTertiary,
    letterSpacing: 0.5,
  },
  telemetryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radius.full,
    borderWidth: 1,
    gap: 6,
  },
  telemetryBadgeConnected: {
    backgroundColor: Colors.secondary,
    borderColor: Colors.primary,
  },
  telemetryBadgeDisconnected: {
    backgroundColor: Colors.surfaceAlt,
    borderColor: Colors.borderLight,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: Radius.full,
  },
  statusDotConnected: {
    backgroundColor: Colors.emeraldMint,
  },
  statusDotDisconnected: {
    backgroundColor: Colors.textTertiary,
  },
  telemetryText: {
    fontFamily: 'Poppins-Bold',
    fontSize: 10,
  },
  telemetryTextConnected: {
    color: Colors.primary,
  },
  telemetryTextDisconnected: {
    color: Colors.textTertiary,
  },
  imageContainer: {
    width: '100%',
    height: 125,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xs,
  },
  scannerImage: {
    width: '90%',
    height: '100%',
  },
  headline: {
    fontFamily: 'Poppins-Bold',
    fontSize: 20,
    lineHeight: 26,
    color: Colors.textHeadline,
    textAlign: 'center',
    marginBottom: 4,
  },
  subHeadline: {
    fontFamily: 'Poppins-Regular',
    fontSize: 12,
    lineHeight: 18,
    color: Colors.textSecondary,
    textAlign: 'center',
    maxWidth: '90%',
    marginBottom: Spacing.md,
  },
  primaryButton: {
    width: '100%',
    height: 52,
    backgroundColor: Colors.primary,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.primary,
    shadowOffset: {width: 0, height: 6},
    shadowOpacity: 0.35,
    shadowRadius: 14,
    elevation: 4,
    marginBottom: Spacing.sm,
  },
  buttonContentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  buttonText: {
    fontFamily: 'Poppins-Bold',
    fontSize: 15,
    color: Colors.white,
    letterSpacing: 0.3,
  },
  triggerHintPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: Radius.full,
    borderWidth: 1,
    gap: 6,
  },
  triggerHintPillConnected: {
    backgroundColor: Colors.secondary,
    borderColor: Colors.borderLight,
  },
  triggerHintPillDisconnected: {
    backgroundColor: Colors.surfaceAlt,
    borderColor: Colors.borderLight,
  },
  triggerHintText: {
    fontFamily: 'Poppins-Medium',
    fontSize: 11,
  },
  triggerHintTextConnected: {
    color: Colors.primary,
  },
  triggerHintTextDisconnected: {
    color: Colors.textSecondary,
  },
});

