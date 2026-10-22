import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import Svg, {Path} from 'react-native-svg';
import {Colors, Radius, Spacing} from '../constants';

interface ScanTopDealerAlertProps {
  dealerName?: string;
  paymentType?: 'CASH' | 'CREDIT';
  nomesin?: string;
  isUnverified?: boolean;
}

export default function ScanTopDealerAlert({
  dealerName,
  paymentType,
  nomesin,
  isUnverified = false,
}: ScanTopDealerAlertProps) {
  if (isUnverified || !dealerName) {
    return (
      <View style={styles.floatingContainer}>
        <View style={[styles.card, styles.unverifiedCard]}>
          <View style={styles.leftContent}>
            <View style={[styles.iconCircle, styles.unverifiedIconCircle]}>
              <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
                <Path
                  d="M12 9v4M12 17h.01M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z"
                  stroke={Colors.warning}
                  strokeWidth={2.4}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </Svg>
            </View>
            <View style={styles.unverifiedTextCol}>
              <Text style={styles.unverifiedTitleText} numberOfLines={1}>
                Mesin: {nomesin || 'Belum Terbaca'}
              </Text>
              <Text style={styles.unverifiedSubText} numberOfLines={1}>
                Dealer belum ada • Lengkapi di web
              </Text>
            </View>
          </View>

          <View style={styles.unverifiedBadge}>
            <Text style={styles.unverifiedBadgeText}>WARNING</Text>
          </View>
        </View>
      </View>
    );
  }

  const isCash = paymentType === 'CASH';

  return (
    <View style={styles.floatingContainer}>
      <View style={styles.card}>
        <View style={styles.leftContent}>
          <View style={styles.iconCircle}>
            <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
              <Path
                d="M20 6L9 17l-5-5"
                stroke={Colors.aciaxSuccessGreen}
                strokeWidth={3}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </Svg>
          </View>
          <Text style={styles.dealerNameText} numberOfLines={1}>
            {dealerName}
          </Text>
        </View>

        {paymentType ? (
          <View
            style={[
              styles.paymentBadge,
              isCash ? styles.cashBadge : styles.creditBadge,
            ]}>
            <Text
              style={[
                styles.paymentBadgeText,
                isCash ? styles.cashBadgeText : styles.creditBadgeText,
              ]}>
              {paymentType}
            </Text>
          </View>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  floatingContainer: {
    width: '100%',
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.xs,
    paddingBottom: Spacing.xs,
    alignItems: 'center',
    zIndex: 100,
  },
  card: {
    width: '100%',
    maxWidth: 480,
    backgroundColor: Colors.aciaxSuccessGreen,
    borderRadius: Radius.full,
    paddingVertical: 8,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1.5,
    borderColor: Colors.emeraldMint,
    shadowColor: Colors.shadowDark,
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.16,
    shadowRadius: 8,
    elevation: 6,
  },
  unverifiedCard: {
    backgroundColor: Colors.unverifiedDarkCard,
    borderWidth: 1.5,
    borderColor: Colors.warning,
  },
  leftContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
    gap: 8,
  },
  iconCircle: {
    width: 22,
    height: 22,
    borderRadius: Radius.full,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  unverifiedIconCircle: {
    backgroundColor: Colors.unverifiedIconCircle,
  },
  unverifiedTextCol: {
    flex: 1,
    justifyContent: 'center',
  },
  unverifiedTitleText: {
    fontFamily: 'JetBrainsMono-Bold',
    fontSize: 12,
    color: Colors.white,
  },
  unverifiedSubText: {
    fontFamily: 'Poppins-Regular',
    fontSize: 10,
    color: Colors.unverifiedSubText,
  },
  unverifiedBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: Radius.full,
    backgroundColor: Colors.unverifiedBadgeBg,
    borderWidth: 1,
    borderColor: Colors.warning,
  },
  unverifiedBadgeText: {
    fontFamily: 'Poppins-Bold',
    fontSize: 9.5,
    color: Colors.warning,
    letterSpacing: 0.5,
  },
  dealerNameText: {
    fontFamily: 'Poppins-Bold',
    fontSize: 12.5,
    color: Colors.white,
    flex: 1,
  },
  paymentBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Radius.full,
  },
  cashBadge: {
    backgroundColor: Colors.emeraldMint,
    borderWidth: 1,
    borderColor: Colors.emeraldMint,
  },
  creditBadge: {
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.white,
  },
  paymentBadgeText: {
    fontFamily: 'Poppins-Bold',
    fontSize: 10.5,
    letterSpacing: 0.5,
  },
  cashBadgeText: {
    color: Colors.neutral,
  },
  creditBadgeText: {
    color: Colors.primary,
  },
});
