import React, {useCallback} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Dimensions,
  ScrollView,
  StatusBar,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import Svg, {Path} from 'react-native-svg';
import {Colors, Images, Spacing, Radius} from '../../constants';
import {useSound} from '../../hooks/useSound';
import {useHaptic} from '../../hooks/useHaptic';
import {useHardwareKey} from '../../hooks/useHardwareKey';
import {useTabNav} from '../../contexts/TabNavContext';
import {
  StarIcon,
  ShieldCheckIcon,
  LeafIcon,
  ChartBarIcon,
  ScannerButtonIcon,
  ArrowRightIcon,
} from '../../components/WelcomeIcons';

const {width: SCREEN_WIDTH} = Dimensions.get('window');

export default function WelcomeScreen() {
  const insets = useSafeAreaInsets();
  const {play: playSound} = useSound();
  const {trigger: haptic} = useHaptic();
  const {setShowWelcome, setActiveTab} = useTabNav();

  const handleStart = useCallback(() => {
    haptic('capture');
    playSound('tick');
    setShowWelcome(false);
    setActiveTab(0);
  }, [haptic, playSound, setShowWelcome, setActiveTab]);

  useHardwareKey(handleStart, true, 'volumeDown');

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={Colors.emerald}
        translucent
      />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        bounces={false}
        showsVerticalScrollIndicator={false}>
        <View style={[styles.headerContainer, {paddingTop: Math.max(insets.top, 16) + Spacing.sm}]}>
          <View style={styles.topBarRow}>
            <View style={styles.appBrandPill}>
              <Image
                source={Images.appLauncher}
                style={styles.appBrandIcon}
                resizeMode="contain"
              />
              <Text style={styles.appBrandText}>MABPKB</Text>
            </View>

            <View style={styles.partnerPill}>
              <Image
                source={Images.logoMD}
                style={styles.partnerLogo}
                resizeMode="contain"
              />
            </View>
          </View>

          <View style={styles.headlineContainer}>
            <View style={styles.sparkleRow}>
              <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
                <Path
                  d="M12 2L14.2 8.8L21 11L14.2 13.2L12 20L9.8 13.2L3 11L9.8 8.8L12 2Z"
                  fill={Colors.emeraldMint}
                />
              </Svg>
            </View>
            <Text style={styles.headline}>
              {'ACIAX\nSmart Scanning\nExperience'}
            </Text>
            <View style={styles.bylineBadge}>
              <Text style={styles.bylineText}>By IT MA</Text>
            </View>
          </View>

          <Text style={styles.subHeadline}>
            Posisikan dokumen BPKB pada scanner dan biarkan ACIAX memproses secara otomatis!
          </Text>

          <View style={styles.waveWrapper}>
            <Svg
              width={SCREEN_WIDTH}
              height={50}
              viewBox="0 0 400 50"
              preserveAspectRatio="none">
              <Path
                d="M 0 50 L 0 28 C 25 8, 75 8, 100 28 C 125 8, 175 8, 200 28 C 225 8, 275 8, 300 28 C 325 8, 375 8, 400 28 L 400 50 Z"
                fill={Colors.dividerWave}
              />
            </Svg>
          </View>
        </View>

        <View style={[styles.bodyContainer, {paddingBottom: Spacing.xxxl + Math.max(insets.bottom, 12)}]}>
          <View style={styles.heroCluster}>
            <View style={[styles.satelliteCard, styles.satTopLeft]}>
              <View style={[styles.badgeIconCircle, {backgroundColor: Colors.badgeStarBg}]}>
                <StarIcon size={16} color={Colors.badgeStar} />
              </View>
              <Text style={styles.cardTitle}>Quick{'\n'}Scan</Text>
            </View>

            <View style={[styles.satelliteCard, styles.satTopRight]}>
              <View style={[styles.badgeIconCircle, {backgroundColor: Colors.badgeShieldBg}]}>
                <ShieldCheckIcon size={16} color={Colors.badgeShield} />
              </View>
              <Text style={styles.cardTitle}>Smart{'\n'}Results</Text>
            </View>

            <View style={styles.mascotCard}>
              <Image
                source={Images.scannerMascot}
                style={styles.mascotImage}
                resizeMode="cover"
              />
            </View>

            <View style={[styles.satelliteCard, styles.satBottomLeft]}>
              <View style={[styles.badgeIconCircle, {backgroundColor: Colors.badgeLeafBg}]}>
                <LeafIcon size={16} color={Colors.badgeLeaf} />
              </View>
              <Text style={styles.cardTitle}>Better{'\n'}You</Text>
            </View>

            <View style={[styles.satelliteCard, styles.satBottomRight]}>
              <View style={[styles.badgeIconCircle, {backgroundColor: Colors.badgeChartBg}]}>
                <ChartBarIcon size={16} color={Colors.badgeChart} />
              </View>
              <Text style={styles.cardTitle}>Smarter{'\n'}Choice</Text>
            </View>
          </View>

          <View style={styles.tipBox}>
            <Text style={styles.tipText}>
              <Text style={styles.tipBold}>Tip: </Text>
              Injak pedal kaki untuk memindai otomatis{'\n'}tanpa perlu menyentuh layar smartphone.
            </Text>
          </View>

          <TouchableOpacity
            style={styles.ctaButton}
            onPress={handleStart}
            activeOpacity={0.88}>
            <View style={styles.ctaIconContainer}>
              <ScannerButtonIcon size={18} color={Colors.emerald} />
            </View>
            <Text style={styles.ctaText}>Let's Scan!</Text>
            <ArrowRightIcon size={18} color={Colors.white} />
          </TouchableOpacity>
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
    paddingHorizontal: Spacing.xl + 4,
    position: 'relative',
    paddingBottom: 48,
  },
  topBarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.lg,
  },
  appBrandPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.whiteTranslucent20,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: Radius.full,
    gap: 6,
  },
  appBrandIcon: {
    width: 20,
    height: 20,
    borderRadius: 4,
  },
  appBrandText: {
    fontFamily: 'Poppins-Bold',
    fontSize: 12,
    color: Colors.white,
    letterSpacing: 0.5,
  },
  partnerPill: {
    backgroundColor: Colors.white,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: Radius.full,
    shadowColor: Colors.shadowDark,
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  partnerLogo: {
    width: 68,
    height: 16,
  },
  headlineContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    marginVertical: Spacing.xs,
  },
  sparkleRow: {
    position: 'absolute',
    top: -6,
    right: '22%',
  },
  headline: {
    fontFamily: 'Poppins-Bold',
    fontSize: 30,
    lineHeight: 38,
    color: Colors.textHeadline,
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  bylineBadge: {
    backgroundColor: Colors.whiteTranslucent20,
    paddingHorizontal: 12,
    paddingVertical: 3,
    borderRadius: Radius.full,
    marginTop: 6,
    marginBottom: Spacing.xs,
    alignSelf: 'center',
  },
  bylineText: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 11,
    color: Colors.textHeadline,
    letterSpacing: 0.5,
    textAlign: 'center',
  },
  subHeadline: {
    fontFamily: 'Poppins-Regular',
    fontSize: 13,
    lineHeight: 18,
    color: Colors.textHeadline,
    opacity: 0.88,
    textAlign: 'center',
    alignSelf: 'center',
    maxWidth: '92%',
  },
  waveWrapper: {
    position: 'absolute',
    bottom: -1,
    left: 0,
    right: 0,
    height: 50,
  },
  bodyContainer: {
    backgroundColor: Colors.surface,
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.sm,
    alignItems: 'center',
  },
  heroCluster: {
    width: '100%',
    maxWidth: 340,
    height: 230,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    marginVertical: Spacing.md,
  },
  mascotCard: {
    width: 148,
    height: 148,
    borderRadius: 34,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
    shadowColor: Colors.emerald,
    shadowOffset: {width: 0, height: 10},
    shadowOpacity: 0.22,
    shadowRadius: 22,
    elevation: 8,
    overflow: 'hidden',
  },
  mascotImage: {
    width: '100%',
    height: '100%',
  },
  satelliteCard: {
    position: 'absolute',
    width: 82,
    minHeight: 88,
    backgroundColor: Colors.surface,
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 4,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.shadowDark,
    shadowOffset: {width: 0, height: 6},
    shadowOpacity: 0.08,
    shadowRadius: 14,
    elevation: 4,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    zIndex: 5,
  },
  satTopLeft: {
    top: 4,
    left: 12,
    transform: [{rotate: '-3deg'}],
  },
  satTopRight: {
    top: 4,
    right: 12,
    transform: [{rotate: '3deg'}],
  },
  satBottomLeft: {
    bottom: 4,
    left: 12,
    transform: [{rotate: '2deg'}],
  },
  satBottomRight: {
    bottom: 4,
    right: 12,
    transform: [{rotate: '-2deg'}],
  },
  badgeIconCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  cardTitle: {
    fontFamily: 'Poppins-Bold',
    fontSize: 10.5,
    lineHeight: 14,
    color: Colors.textSlateDark,
    textAlign: 'center',
  },
  tipBox: {
    width: '100%',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.xs,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.xs,
    marginBottom: Spacing.lg,
  },
  tipText: {
    fontFamily: 'Poppins-Regular',
    fontSize: 12,
    lineHeight: 18,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  tipBold: {
    fontFamily: 'Poppins-Bold',
    color: Colors.emeraldDark,
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
    shadowColor: Colors.emerald,
    shadowOffset: {width: 0, height: 8},
    shadowOpacity: 0.38,
    shadowRadius: 16,
    elevation: 6,
  },
  ctaIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaText: {
    fontFamily: 'Poppins-Bold',
    fontSize: 16,
    color: Colors.white,
    letterSpacing: 0.3,
  },
});
