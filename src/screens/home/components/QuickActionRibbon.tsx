import React from 'react';
import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';
import Svg, {Path} from 'react-native-svg';
import {Colors, Spacing, Radius} from '../../../constants';

interface QuickActionRibbonProps {
  onOpenTeam: () => void;
  onOpenDealer: () => void;
  onOpenSop: () => void;
  onOpenPedalTest: () => void;
}

export default function QuickActionRibbon({
  onOpenTeam,
  onOpenDealer,
  onOpenSop,
  onOpenPedalTest,
}: QuickActionRibbonProps) {
  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.8}
        onPress={onOpenTeam}>
        <View style={styles.iconBox}>
          <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
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

      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.8}
        onPress={onOpenDealer}>
        <View style={styles.iconBox}>
          <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
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
        <Text style={styles.cardLabel}>Cabang{'\n'}Dealer</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.8}
        onPress={onOpenSop}>
        <View style={styles.iconBox}>
          <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
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
          <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.xl,
    marginBottom: Spacing.md,
    gap: 8,
  },
  card: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: Radius.xl,
    paddingVertical: 12,
    paddingHorizontal: 4,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.shadowDark,
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  iconBox: {
    width: 42,
    height: 42,
    borderRadius: Radius.lg,
    backgroundColor: Colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  cardLabel: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 10.5,
    lineHeight: 14,
    color: Colors.textHeadline,
    textAlign: 'center',
  },
});
