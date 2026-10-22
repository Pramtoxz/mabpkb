import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import Svg, {Path, Defs, LinearGradient as SvgLinearGradient, Stop} from 'react-native-svg';
import {Colors, Spacing, Radius} from '../../../constants';

interface ShiftProductivityCardProps {
  completed?: number;
  target?: number;
}

export default function ShiftProductivityCard({
  completed = 78,
  target = 100,
}: ShiftProductivityCardProps) {
  const safeTarget = target > 0 ? target : 100;
  const pct = Math.min(Math.round((completed / safeTarget) * 100), 100);
  const remaining = Math.max(safeTarget - completed, 0);

  return (
   <View style={styles.card}>
  <View style={styles.leftCol}>
    <Text style={styles.categoryTitle}>Semangat Scan BPKB Hari Ini!</Text>
    <Text style={styles.targetLabel}>Progres kamu</Text>
    <View style={styles.numberRow}>
      <Text style={styles.completedNumber}>{completed}</Text>
      <Text style={styles.targetNumber}> / {safeTarget}</Text>
    </View>
    <Text style={styles.unitText}>BPKB Kelar</Text>
    <View style={styles.remainingBadge}>
      <Text style={styles.remainingText}>Tinggal {remaining} lagi</Text>
    </View>
  </View>

      <View style={styles.rightCol}>
        <View style={styles.gaugeContainer}>
          <Svg width={102} height={61} viewBox="0 0 100 60">
            <Defs>
              <SvgLinearGradient id="gaugeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <Stop offset="0%" stopColor={Colors.primary} />
                <Stop offset="100%" stopColor={Colors.emeraldMint} />
              </SvgLinearGradient>
            </Defs>
            <Path
              d="M 15 50 A 35 35 0 0 1 85 50"
              fill="none"
              stroke={Colors.gaugeTrack}
              strokeWidth="9"
              strokeLinecap="round"
            />
            <Path
              d="M 15 50 A 35 35 0 0 1 85 50"
              fill="none"
              stroke="url(#gaugeGrad)"
              strokeWidth="9"
              strokeDasharray="110"
              strokeDashoffset={110 - (110 * pct) / 100}
              strokeLinecap="round"
            />
          </Svg>
          <View style={styles.gaugeTextOverlay}>
            <Text style={styles.gaugePctText}>{pct}%</Text>
            <Text style={styles.gaugeSubText}>Tercapai</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.xl,
    paddingHorizontal: Spacing.lg,
    paddingVertical: 14,
    marginHorizontal: Spacing.xl,
    marginTop: 4,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: Colors.shadowDark,
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.08,
    shadowRadius: 14,
    elevation: 3,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  leftCol: {
    flex: 1,
    paddingRight: Spacing.sm,
  },
  categoryTitle: {
    fontFamily: 'Poppins-Bold',
    fontSize: 12.5,
    color: Colors.textHeadline,
    marginBottom: 2,
  },
  targetLabel: {
    fontFamily: 'Poppins-Regular',
    fontSize: 10.5,
    color: Colors.textSecondary,
    marginBottom: 2,
  },
  numberRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  completedNumber: {
    fontFamily: 'Poppins-Bold',
    fontSize: 25,
    color: Colors.textHeadline,
    lineHeight: 30,
  },
  targetNumber: {
    fontFamily: 'Poppins-Medium',
    fontSize: 14,
    color: Colors.textTertiary,
  },
  unitText: {
    fontFamily: 'Poppins-Medium',
    fontSize: 11,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  remainingBadge: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.secondary,
    paddingHorizontal: 8,
    paddingVertical: 2.5,
    borderRadius: Radius.full,
  },
  remainingText: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 10,
    color: Colors.primary,
  },
  rightCol: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  gaugeContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    width: 102,
    height: 61,
  },
  gaugeTextOverlay: {
    position: 'absolute',
    top: 23,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gaugePctText: {
    fontFamily: 'Poppins-Bold',
    fontSize: 16,
    color: Colors.textHeadline,
    lineHeight: 19,
  },
  gaugeSubText: {
    fontFamily: 'Poppins-Regular',
    fontSize: 9,
    color: Colors.textSecondary,
    lineHeight: 12,
  },
});
