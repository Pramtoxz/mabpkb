import React from 'react';
import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';
import Svg, {Path} from 'react-native-svg';
import {Colors, Spacing, Radius} from '../../../constants';

interface QuickActionGridProps {
  onOpenDealer: () => void;
  onOpenTrack: () => void;
  onOpenHandover: () => void;
  onOpenRevision: () => void;
  onOpenPerformance: () => void;
  onOpenSop: () => void;
  onOpenPedalTest: () => void;
  onOpenTeam: () => void;
}

export default function QuickActionRibbon({
  onOpenDealer,
  onOpenTrack,
  onOpenHandover,
  onOpenRevision,
  onOpenPerformance,
  onOpenSop,
  onOpenPedalTest,
  onOpenTeam,
}: QuickActionGridProps) {
  return (
    <View style={styles.container}>
      <View style={styles.gridRow}>
        <TouchableOpacity
          style={styles.card}
          activeOpacity={0.8}
          onPress={onOpenDealer}>
          <View style={styles.iconBox}>
            <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
              <Path
                d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"
                stroke={Colors.primary}
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <Path
                d="M9 22V12h6v10"
                stroke={Colors.primary}
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </Svg>
          </View>
          <Text style={styles.cardLabel}>List{'\n'}Dealer</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.card}
          activeOpacity={0.8}
          onPress={onOpenTrack}>
          <View style={styles.iconBox}>
            <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
              <Path
                d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"
                stroke={Colors.primary}
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <Path
                d="M14 2v6h6M16 13H8M16 17H8M10 9H8"
                stroke={Colors.primary}
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </Svg>
          </View>
          <Text style={styles.cardLabel}>Riwayat{'\n'}BPKB</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.card}
          activeOpacity={0.8}
          onPress={onOpenHandover}>
          <View style={styles.iconBox}>
            <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
              <Path
                d="M9 11l3 3L22 4"
                stroke={Colors.primary}
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <Path
                d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"
                stroke={Colors.primary}
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </Svg>
          </View>
          <Text style={styles.cardLabel}>Serah{'\n'}Terima</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.card}
          activeOpacity={0.8}
          onPress={onOpenRevision}>
          <View style={styles.iconBox}>
            <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
              <Path
                d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"
                stroke={Colors.primary}
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <Path
                d="M12 9v4M12 17h.01"
                stroke={Colors.primary}
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </Svg>
          </View>
          <Text style={styles.cardLabel}>Berkas{'\n'}Revisi</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.gridRow}>
        <TouchableOpacity
          style={styles.card}
          activeOpacity={0.8}
          onPress={onOpenPerformance}>
          <View style={styles.iconBox}>
            <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
              <Path
                d="M18 20V10M12 20V4M6 20v-6"
                stroke={Colors.primary}
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </Svg>
          </View>
          <Text style={styles.cardLabel}>Grafik{'\n'}Performa</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.card}
          activeOpacity={0.8}
          onPress={onOpenSop}>
          <View style={styles.iconBox}>
            <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
              <Path
                d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"
                stroke={Colors.primary}
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <Path
                d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"
                stroke={Colors.primary}
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </Svg>
          </View>
          <Text style={styles.cardLabel}>Panduan{'\n'}SOP</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.card}
          activeOpacity={0.8}
          onPress={onOpenPedalTest}>
          <View style={styles.iconBox}>
            <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
              <Path
                d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"
                stroke={Colors.primary}
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </Svg>
          </View>
          <Text style={styles.cardLabel}>Tes{'\n'}Pedal</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.card}
          activeOpacity={0.8}
          onPress={onOpenTeam}>
          <View style={styles.iconBox}>
            <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
              <Path
                d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"
                stroke={Colors.primary}
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <Path
                d="M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z"
                stroke={Colors.primary}
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <Path
                d="M23 21v-2a4 4 0 0 0-3-3.87"
                stroke={Colors.primary}
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <Path
                d="M16 3.13a4 4 0 0 1 0 7.75"
                stroke={Colors.primary}
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </Svg>
          </View>
          <Text style={styles.cardLabel}>Tim IT{'\n'}MA</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: Spacing.xl,
    marginBottom: 8,
    gap: 8,
  },
  gridRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  card: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: Radius.xl,
    paddingVertical: 8,
    paddingHorizontal: 2,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.shadowDark,
    shadowOffset: {width: 0, height: 3},
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  iconBox: {
    width: 34,
    height: 34,
    borderRadius: Radius.md,
    backgroundColor: Colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 3,
  },
  cardLabel: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 9.5,
    lineHeight: 12.5,
    color: Colors.textHeadline,
    textAlign: 'center',
  },
});
