import React from 'react';
import {View, Text, StyleSheet, Image, TouchableOpacity} from 'react-native';
import {Colors, Images, Spacing, Radius} from '../../../constants';

interface HomeHeaderProps {
  appName?: string;
  greeting?: string;
  operatorName?: string;
  onPressMascot?: () => void;
}

export default function HomeHeader({
  appName = 'ACIAX MABPKB',
  greeting = 'Hey,',
  operatorName = 'MA People',
  onPressMascot,
}: HomeHeaderProps) {
  return (
    <View style={styles.container}>
      <View style={styles.textColumn}>
        <Text style={styles.appNameText}>{appName}</Text>
        <Text style={styles.greetingText}>{greeting}</Text>
        <Text style={styles.operatorText}>{operatorName}</Text>
      </View>

      <TouchableOpacity
        style={styles.avatarCard}
        onPress={onPressMascot}
        activeOpacity={0.8}
        accessibilityRole="button"
        accessibilityLabel="Mulai Panduan">
        <Image
          source={Images.scannerMascot}
          style={styles.avatarImage}
          resizeMode="cover"
        />
        <View style={styles.guideBadge}>
          <Text style={styles.guideBadgeText}>Panduan</Text>
        </View>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.sm,
  },
  textColumn: {
    flex: 1,
    justifyContent: 'center',
  },
  appNameText: {
    fontFamily: 'Poppins-Bold',
    fontSize: 14,
    color: Colors.primary,
    letterSpacing: 0.8,
    marginBottom: 2,
  },
  greetingText: {
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  operatorText: {
    fontFamily: 'Poppins-Bold',
    fontSize: 22,
    color: Colors.textHeadline,
    lineHeight: 28,
  },
  avatarCard: {
    width: 64,
    height: 64,
    borderRadius: Radius.xl,
    backgroundColor: Colors.surface,
    padding: 3,
    shadowColor: Colors.primary,
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.16,
    shadowRadius: 10,
    elevation: 4,
    borderWidth: 1.5,
    borderColor: Colors.borderLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: Radius.lg,
  },
  guideBadge: {
    position: 'absolute',
    bottom: -6,
    backgroundColor: Colors.primary,
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: Colors.surface,
    shadowColor: Colors.black,
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.15,
    shadowRadius: 2,
    elevation: 2,
  },
  guideBadgeText: {
    fontFamily: 'Poppins-Bold',
    fontSize: 9,
    color: Colors.white,
    letterSpacing: 0.3,
  },
});

