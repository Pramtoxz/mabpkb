import React, {useCallback, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Dimensions,
  ScrollView,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import type {HomeStackParamList} from '../../navigation/types';
import Svg, {Path} from 'react-native-svg';
import {Colors, Images, Typography, Spacing, Radius} from '../../constants';
import {useSound} from '../../hooks/useSound';
import {useHaptic} from '../../hooks/useHaptic';
import {useTabNav} from '../../contexts/TabNavContext';
import {
  StarIcon,
  ShieldCheckIcon,
  LeafIcon,
  ChartBarIcon,
  ScannerButtonIcon,
  ArrowRightIcon,
} from '../../components/WelcomeIcons';

type Props = NativeStackScreenProps<HomeStackParamList, 'Welcome'>;

const {width: SCREEN_WIDTH} = Dimensions.get('window');

export default function WelcomeScreen({navigation}: Props) {
  const insets = useSafeAreaInsets();
  const {play: playSound} = useSound();
  const {trigger: haptic} = useHaptic();
  const {setIsTabBarHidden} = useTabNav();

  useEffect(() => {
    setIsTabBarHidden(true);
    return () => {
      setIsTabBarHidden(false);
    };
  }, [setIsTabBarHidden]);

  const handleStart = useCallback(() => {
    haptic('capture');
    playSound('tick');
    setIsTabBarHidden(false);
    navigation.navigate('HomeMain');
  }, [navigation, haptic, playSound, setIsTabBarHidden]);

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        bounces={false}
        showsVerticalScrollIndicator={false}>
        <View style={[styles.headerContainer, {paddingTop: insets.top + Spacing.lg}]}>
          <Text style={styles.headline}>
            {'Scan Cepat.\nData Tepat.\nKerja Tuntas.'}
          </Text>
          <Text style={styles.subHeadline}>
            Posisikan dokumen pada tatakan scanner dan gunakan pedal untuk alur kerja otomatis.
          </Text>

          <View style={styles.waveWrapper}>
            <Svg
              width={SCREEN_WIDTH}
              height={36}
              viewBox="0 0 400 36"
              preserveAspectRatio="none">
              <Path
                d="M 0 36 L 0 20 Q 25 0, 50 20 Q 75 0, 100 20 Q 125 0, 150 20 Q 175 0, 200 20 Q 225 0, 250 20 Q 275 0, 300 20 Q 325 0, 350 20 Q 375 0, 400 20 L 400 36 Z"
                fill={Colors.surface}
              />
            </Svg>
          </View>
        </View>

        <View style={styles.bodyContainer}>
          <View style={styles.heroWrapper}>
            <View style={styles.orbitRow}>
              <View style={[styles.satelliteCard, styles.cardLeft]}>
                <View style={[styles.badgeIconBox, {backgroundColor: Colors.badgeStarBg}]}>
                  <StarIcon size={18} color={Colors.badgeStar} />
                </View>
                <Text style={styles.cardTitle}>Pedal Cepat</Text>
                <Text style={styles.cardDesc}>Hands-free</Text>
              </View>

              <View style={[styles.satelliteCard, styles.cardRight]}>
                <View style={[styles.badgeIconBox, {backgroundColor: Colors.badgeShieldBg}]}>
                  <ShieldCheckIcon size={18} color={Colors.badgeShield} />
                </View>
                <Text style={styles.cardTitle}>Validasi</Text>
                <Text style={styles.cardDesc}>Stok unit</Text>
              </View>
            </View>

            <View style={styles.mascotContainer}>
              <Image
                source={Images.scannerMascot}
                style={styles.mascotImage}
                resizeMode="cover"
              />
            </View>

            <View style={styles.orbitRow}>
              <View style={[styles.satelliteCard, styles.cardLeft]}>
                <View style={[styles.badgeIconBox, {backgroundColor: Colors.badgeLeafBg}]}>
                  <LeafIcon size={18} color={Colors.badgeLeaf} />
                </View>
                <Text style={styles.cardTitle}>Auto Crop</Text>
                <Text style={styles.cardDesc}>Presisi BPKB</Text>
              </View>

              <View style={[styles.satelliteCard, styles.cardRight]}>
                <View style={[styles.badgeIconBox, {backgroundColor: Colors.badgeChartBg}]}>
                  <ChartBarIcon size={18} color={Colors.badgeChart} />
                </View>
                <Text style={styles.cardTitle}>Berkas PDF</Text>
                <Text style={styles.cardDesc}>Otomatis</Text>
              </View>
            </View>
          </View>

          <View style={styles.tipBox}>
            <Text style={styles.tipText}>
              <Text style={styles.tipBold}>Tip: </Text>
              Pastikan sudut dokumen masuk ke dalam garis panduan scanner.
            </Text>
          </View>

          <TouchableOpacity
            style={styles.ctaButton}
            onPress={handleStart}
            activeOpacity={0.88}>
            <View style={styles.ctaIconContainer}>
              <ScannerButtonIcon size={20} color={Colors.emerald} />
            </View>
            <Text style={styles.ctaText}>Mulai Bekerja</Text>
            <ArrowRightIcon size={20} color={Colors.surface} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={handleStart}
            activeOpacity={0.7}>
            <Text style={styles.secondaryText}>Langsung ke Dashboard {'>'}</Text>
          </TouchableOpacity>

          <View style={[styles.paginationRow, {paddingBottom: insets.bottom + Spacing.md}]}>
            <View style={styles.dotActive} />
            <View style={styles.dotInactive} />
            <View style={styles.dotInactive} />
            <View style={styles.dotInactive} />
            <View style={styles.dotInactive} />
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.surface,
  },
  scrollContent: {
    flexGrow: 1,
    backgroundColor: Colors.surface,
  },
  headerContainer: {
    backgroundColor: Colors.emerald,
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    paddingBottom: 48,
    position: 'relative',
  },
  headline: {
    ...Typography.h1,
    fontSize: 28,
    lineHeight: 34,
    color: Colors.neutral,
    textAlign: 'center',
    fontFamily: 'Inter-Black',
    letterSpacing: -0.5,
  },
  subHeadline: {
    ...Typography.bodySmall,
    fontSize: 13,
    lineHeight: 18,
    color: Colors.neutral,
    opacity: 0.78,
    textAlign: 'center',
    marginTop: Spacing.sm,
    paddingHorizontal: Spacing.md,
  },
  waveWrapper: {
    position: 'absolute',
    bottom: -1,
    left: 0,
    right: 0,
    width: '100%',
  },
  bodyContainer: {
    flex: 1,
    backgroundColor: Colors.surface,
    paddingHorizontal: Spacing.xl,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Spacing.sm,
  },
  heroWrapper: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: Spacing.md,
  },
  orbitRow: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    zIndex: 2,
  },
  mascotContainer: {
    width: 136,
    height: 136,
    borderRadius: 30,
    borderWidth: 3,
    borderColor: Colors.emeraldLight,
    overflow: 'hidden',
    backgroundColor: Colors.surface,
    elevation: 6,
    shadowColor: Colors.neutral,
    shadowOffset: {width: 0, height: 6},
    shadowOpacity: 0.1,
    shadowRadius: 16,
    marginVertical: -16,
    zIndex: 1,
  },
  mascotImage: {
    width: '100%',
    height: '100%',
  },
  satelliteCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    paddingVertical: 10,
    paddingHorizontal: Spacing.md,
    alignItems: 'center',
    minWidth: 100,
    elevation: 4,
    shadowColor: Colors.neutral,
    shadowOffset: {width: 0, height: 6},
    shadowOpacity: 0.08,
    shadowRadius: 12,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  cardLeft: {
    alignSelf: 'flex-start',
  },
  cardRight: {
    alignSelf: 'flex-end',
  },
  badgeIconBox: {
    width: 32,
    height: 32,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  cardTitle: {
    ...Typography.labelSmall,
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textPrimary,
    fontFamily: 'Inter-Bold',
  },
  cardDesc: {
    fontSize: 10,
    color: Colors.textSecondary,
    fontFamily: 'Inter-Medium',
  },
  tipBox: {
    marginVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
  },
  tipText: {
    ...Typography.bodySmall,
    fontSize: 12,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  tipBold: {
    color: Colors.emerald,
    fontWeight: '700',
  },
  ctaButton: {
    width: '100%',
    height: 56,
    backgroundColor: Colors.emerald,
    borderRadius: Radius.full,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    elevation: 6,
    shadowColor: Colors.emerald,
    shadowOffset: {width: 0, height: 8},
    shadowOpacity: 0.35,
    shadowRadius: 16,
    marginTop: Spacing.sm,
  },
  ctaIconContainer: {
    width: 38,
    height: 38,
    borderRadius: Radius.md,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaText: {
    ...Typography.button,
    fontSize: 16,
    fontWeight: '700',
    color: Colors.onPrimary,
    fontFamily: 'Inter-Bold',
  },
  secondaryButton: {
    paddingVertical: Spacing.sm,
    marginTop: Spacing.xs,
  },
  secondaryText: {
    ...Typography.labelSmall,
    fontSize: 13,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  paginationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: Spacing.sm,
  },
  dotActive: {
    width: 22,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.emerald,
  },
  dotInactive: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.paginationInactive,
  },
});
