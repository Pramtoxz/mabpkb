import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import Svg, {Path} from 'react-native-svg';
import {Colors, Radius, Spacing} from '../constants';

interface ScanTopDealerAlertProps {
  dealerName: string;
  paymentType?: 'CASH' | 'CREDIT';
}

export default function ScanTopDealerAlert({
  dealerName,
  paymentType,
}: ScanTopDealerAlertProps) {
  if (!dealerName) {
    return null;
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
