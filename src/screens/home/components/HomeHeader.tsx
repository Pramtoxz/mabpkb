import React from 'react';
import {View, Text, StyleSheet, Image} from 'react-native';
import {Colors, Images, Spacing, Radius} from '../../../constants';

interface HomeHeaderProps {
  appName?: string;
  greeting?: string;
  operatorName?: string;
}

export default function HomeHeader({
  appName = 'ACIAX MABPKB',
  greeting = 'Halo,',
  operatorName = 'Tim IT MA',
}: HomeHeaderProps) {
  return (
    <View style={styles.container}>
      <View style={styles.textColumn}>
        <Text style={styles.appNameText}>{appName}</Text>
        <Text style={styles.greetingText}>{greeting}</Text>
        <Text style={styles.operatorText}>{operatorName}</Text>
      </View>

      <View style={styles.avatarCard}>
        <Image
          source={Images.scannerMascot}
          style={styles.avatarImage}
          resizeMode="cover"
        />
      </View>
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
});
