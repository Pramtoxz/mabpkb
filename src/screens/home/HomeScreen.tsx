import React, {useCallback, useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Dimensions,
  Image,
  StatusBar,
} from 'react-native';
import {useFocusEffect} from '@react-navigation/native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import Svg, {Path, Circle} from 'react-native-svg';
import {Colors, Typography, Spacing, Radius, Images} from '../../constants';
import {useTabNav} from '../../contexts/TabNavContext';
import {getActivity, type ActivityResponse} from '../../api/endpoints';
import {
  StarIcon,
  ShieldCheckIcon,
  LeafIcon,
  ChartBarIcon,
  HeartIcon,
  ClockIcon,
  FlameIcon,
  CrownIcon,
  ScannerButtonIcon,
} from '../../components/WelcomeIcons';

const {width: SCREEN_WIDTH} = Dimensions.get('window');

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const {setActiveTab, setIsTabBarHidden} = useTabNav();

  const [activity, setActivity] = useState<ActivityResponse | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchActivity = useCallback(async () => {
    try {
      const data = await getActivity();
      setActivity(data);
    } catch {
      setActivity({target_bpkb: 100, completed_bpkb: 78, pending_bpkb: 22});
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      setIsTabBarHidden(false);
      fetchActivity();
    }, [fetchActivity, setIsTabBarHidden]),
  );

  useEffect(() => {
    setIsTabBarHidden(false);
    fetchActivity();
  }, [fetchActivity, setIsTabBarHidden]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchActivity();
    setRefreshing(false);
  }, [fetchActivity]);

  const target = activity?.target_bpkb ?? 100;
  const completed = activity?.completed_bpkb ?? 78;
  const pending = activity?.pending_bpkb ?? 22;
  const pct = target > 0 ? Math.round((completed / target) * 100) : 78;

  return (
    <View style={styles.screen}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={Colors.emerald}
        translucent
      />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          {paddingBottom: 96 + Math.max(insets.bottom, 12)},
        ]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={Colors.emerald}
          />
        }>
        {/* 1. TOP EMERALD HEADER WITH CLOUD WAVE CUTOUT */}
        <View style={[styles.headerContainer, {paddingTop: Math.max(insets.top, 16) + Spacing.sm}]}>
          <View style={styles.topBarRow}>
            <View style={styles.appTitleBox}>
              <Text style={styles.appTitleText}>MABPKB</Text>
            </View>
            <TouchableOpacity
              style={styles.notificationBtn}
              activeOpacity={0.8}
              onPress={() => {}}>
              <View style={styles.notificationDot} />
              <ClockIcon size={18} color={Colors.white} />
            </TouchableOpacity>
          </View>

          {/* Cloud Scalloped Divider */}
          <View style={styles.waveWrapper}>
            <Svg
              width={SCREEN_WIDTH}
              height={44}
              viewBox="0 0 400 44"
              preserveAspectRatio="none">
              <Path
                d="M 0 44 L 0 28 C 30 10, 70 10, 100 24 C 130 6, 170 6, 200 22 C 230 4, 270 4, 300 22 C 330 10, 370 10, 400 26 L 400 44 Z"
                fill={Colors.dividerWave}
              />
            </Svg>
          </View>
        </View>

        {/* 2. AVATAR & OPERATOR PROFILE SECTION */}
        <View style={styles.profileSection}>
          {/* Overlapping Mascot Avatar */}
          <View style={styles.avatarContainer}>
            <Image
              source={Images.scannerMascot}
              style={styles.avatarImage}
              resizeMode="cover"
            />
          </View>

          <Text style={styles.profileName}>ACIAX</Text>

          {/* 3 Status Pill Tags */}
          <View style={styles.tagRow}>
            <View style={[styles.tagPill, {backgroundColor: Colors.badgeChartBg}]}>
              <View style={[styles.tagDot, {backgroundColor: Colors.badgeChart}]} />
              <Text style={[styles.tagText, {color: Colors.badgeChart}]}>
                Health Explorer
              </Text>
            </View>

            <View style={[styles.tagPill, {backgroundColor: Colors.badgeOrangeBg}]}>
              <FlameIcon size={12} color={Colors.badgeOrange} />
              <Text style={[styles.tagText, {color: Colors.badgeOrange}]}>
                12 Days Streak
              </Text>
            </View>

            <View style={[styles.tagPill, {backgroundColor: Colors.badgeShieldBg}]}>
              <ShieldCheckIcon size={12} color={Colors.badgeShield} />
              <Text style={[styles.tagText, {color: Colors.badgeShield}]}>
                Level 7
              </Text>
            </View>
          </View>
        </View>

        {/* 3. 4 QUICK STATS CARDS IN A ROW */}
        <View style={styles.quickStatsRow}>
          <View style={styles.quickStatCard}>
            <View style={[styles.quickStatIconBox, {backgroundColor: Colors.emeraldLight}]}>
              <ScannerButtonIcon size={16} color={Colors.emerald} />
            </View>
            <Text style={styles.quickStatNumber}>{completed}</Text>
            <Text style={styles.quickStatLabel}>Prod Scanned</Text>
          </View>

          <View style={styles.quickStatCard}>
            <View style={[styles.quickStatIconBox, {backgroundColor: Colors.badgeStarBg}]}>
              <StarIcon size={16} color={Colors.badgeStar} />
            </View>
            <Text style={styles.quickStatNumber}>32</Text>
            <Text style={styles.quickStatLabel}>Good Choices</Text>
          </View>

          <View style={styles.quickStatCard}>
            <View style={[styles.quickStatIconBox, {backgroundColor: Colors.badgePinkBg}]}>
              <HeartIcon size={16} color={Colors.badgePink} />
            </View>
            <Text style={styles.quickStatNumber}>10</Text>
            <Text style={styles.quickStatLabel}>Favorites</Text>
          </View>

          <View style={styles.quickStatCard}>
            <View style={[styles.quickStatIconBox, {backgroundColor: Colors.badgeChartBg}]}>
              <ChartBarIcon size={16} color={Colors.badgeChart} />
            </View>
            <Text style={styles.quickStatNumber}>{pct}</Text>
            <Text style={styles.quickStatLabel}>Health Score</Text>
          </View>
        </View>

        {/* 4. MY ACHIEVEMENTS SECTION */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>My Achievements</Text>
            <TouchableOpacity activeOpacity={0.7}>
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.achievementsRow}>
            {/* Achievement 1 */}
            <View style={styles.achievementCard}>
              <View style={[styles.achievementCircle, {backgroundColor: Colors.badgeLeafBg}]}>
                <LeafIcon size={18} color={Colors.badgeLeaf} />
              </View>
              <Text style={styles.achievementTitle}>First Scan</Text>
              <Text style={styles.achievementSub}>Scanned your first product</Text>
              <View style={[styles.statusIndicatorPill, {backgroundColor: Colors.badgeLeafBg}]}>
                <View style={[styles.statusMiniCheck, {backgroundColor: Colors.badgeLeaf}]} />
              </View>
            </View>

            {/* Achievement 2 */}
            <View style={styles.achievementCard}>
              <View style={[styles.achievementCircle, {backgroundColor: Colors.badgeOrangeBg}]}>
                <Text style={styles.achievementBadgeNumber}>10</Text>
              </View>
              <Text style={styles.achievementTitle}>Curious one</Text>
              <Text style={styles.achievementSub}>Scanned 10 products</Text>
              <View style={styles.progressBarSmall}>
                <View style={[styles.progressFillSmall, {width: '65%', backgroundColor: Colors.badgeOrange}]} />
              </View>
            </View>

            {/* Achievement 3 */}
            <View style={styles.achievementCard}>
              <View style={[styles.achievementCircle, {backgroundColor: Colors.badgeShieldBg}]}>
                <ShieldCheckIcon size={18} color={Colors.badgeShield} />
              </View>
              <Text style={styles.achievementTitle}>Healthy Habits</Text>
              <Text style={styles.achievementSub}>Scanned 25 products</Text>
              <View style={[styles.statusIndicatorPill, {backgroundColor: Colors.badgeShieldBg}]}>
                <View style={[styles.statusMiniCheck, {backgroundColor: Colors.badgeShield}]} />
              </View>
            </View>

            {/* Achievement 4 */}
            <View style={styles.achievementCard}>
              <View style={[styles.achievementCircle, {backgroundColor: Colors.badgeChartBg}]}>
                <CrownIcon size={18} color={Colors.badgeChart} />
              </View>
              <Text style={styles.achievementTitle}>Top Explorer</Text>
              <Text style={styles.achievementSub}>Scanned 50 products</Text>
              <View style={styles.progressBarSmall}>
                <View style={[styles.progressFillSmall, {width: '80%', backgroundColor: Colors.badgeChart}]} />
              </View>
            </View>
          </View>
        </View>

        {/* 5. YOUR INSIGHTS SECTION (SEMI-CIRCULAR GAUGE) */}
        <View style={styles.sectionContainer}>
          <View style={styles.insightCard}>
            <View style={styles.insightTextCol}>
              <Text style={styles.insightTitle}>Your Insights</Text>
              <Text style={styles.insightDesc}>
                You're making healthier choices than {pct}% of other users!
              </Text>
            </View>

            <View style={styles.gaugeContainer}>
              <Svg width={96} height={60} viewBox="0 0 100 60">
                <Path
                  d="M 15 50 A 35 35 0 0 1 85 50"
                  fill="none"
                  stroke={Colors.gaugeTrack}
                  strokeWidth="10"
                  strokeLinecap="round"
                />
                <Path
                  d="M 15 50 A 35 35 0 0 1 85 50"
                  fill="none"
                  stroke={Colors.emerald}
                  strokeWidth="10"
                  strokeDasharray="110"
                  strokeDashoffset={110 - (110 * pct) / 100}
                  strokeLinecap="round"
                />
              </Svg>
              <View style={styles.gaugeCenterText}>
                <Text style={styles.gaugePctText}>{pct}%</Text>
                <Text style={styles.gaugeSubText}>Better than others</Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    backgroundColor: Colors.background,
  },

  // 1. Header
  headerContainer: {
    backgroundColor: Colors.emerald,
    paddingHorizontal: Spacing.xl,
    paddingBottom: 48,
    position: 'relative',
  },
  topBarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  appTitleBox: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: Radius.full,
    backgroundColor: Colors.whiteTranslucent20,
  },
  appTitleText: {
    fontFamily: 'Poppins-Bold',
    fontSize: 14,
    color: Colors.white,
    letterSpacing: 0.5,
  },
  notificationBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.whiteTranslucent20,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  notificationDot: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.notificationBadge,
  },
  waveWrapper: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 44,
  },

  // 2. Profile Section
  profileSection: {
    backgroundColor: Colors.surface,
    alignItems: 'center',
    paddingBottom: Spacing.lg,
    marginTop: -22,
    zIndex: 2,
  },
  avatarContainer: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: Colors.surface,
    borderWidth: 3,
    borderColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    shadowColor: Colors.shadowDark,
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 4,
    marginBottom: 6,
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  profileName: {
    fontFamily: 'Poppins-Bold',
    fontSize: 18,
    color: Colors.textPrimary,
    marginBottom: 6,
  },
  tagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  tagPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radius.full,
    gap: 4,
  },
  tagDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  tagText: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 10,
  },

  // 3. Quick Stats 4 Cards Row
  quickStatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    marginTop: Spacing.md,
    marginBottom: Spacing.md,
  },
  quickStatCard: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    paddingVertical: 12,
    paddingHorizontal: 4,
    alignItems: 'center',
    marginHorizontal: 3,
    shadowColor: Colors.shadowDark,
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  quickStatIconBox: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  quickStatNumber: {
    fontFamily: 'Poppins-Bold',
    fontSize: 16,
    color: Colors.textPrimary,
  },
  quickStatLabel: {
    fontFamily: 'Poppins-Medium',
    fontSize: 9,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 2,
  },

  // 4. Section Container & Achievements
  sectionContainer: {
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  sectionTitle: {
    fontFamily: 'Poppins-Bold',
    fontSize: 15,
    color: Colors.textPrimary,
  },
  viewAllText: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 12,
    color: Colors.badgeChart,
  },
  achievementsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  achievementCard: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    paddingVertical: 10,
    paddingHorizontal: 4,
    alignItems: 'center',
    marginHorizontal: 3,
    shadowColor: Colors.shadowDark,
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  achievementCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  achievementBadgeNumber: {
    fontFamily: 'Poppins-Bold',
    fontSize: 14,
    color: Colors.badgeOrange,
  },
  achievementTitle: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 10,
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  achievementSub: {
    fontFamily: 'Poppins-Regular',
    fontSize: 7.5,
    color: Colors.textTertiary,
    textAlign: 'center',
    marginTop: 2,
    lineHeight: 10,
    minHeight: 20,
  },
  statusIndicatorPill: {
    width: 22,
    height: 12,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 6,
  },
  statusMiniCheck: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  progressBarSmall: {
    width: 30,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.borderLight,
    marginTop: 10,
    overflow: 'hidden',
  },
  progressFillSmall: {
    height: '100%',
    borderRadius: 2,
  },

  // 5. Your Insights Card
  insightCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.xl,
    padding: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: Colors.shadowDark,
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  insightTextCol: {
    flex: 1,
    paddingRight: Spacing.sm,
  },
  insightTitle: {
    fontFamily: 'Poppins-Bold',
    fontSize: 15,
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  insightDesc: {
    fontFamily: 'Poppins-Regular',
    fontSize: 12,
    lineHeight: 18,
    color: Colors.textSecondary,
  },
  gaugeContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    width: 96,
    height: 60,
  },
  gaugeCenterText: {
    position: 'absolute',
    bottom: 2,
    alignItems: 'center',
  },
  gaugePctText: {
    fontFamily: 'Poppins-Bold',
    fontSize: 15,
    color: Colors.textPrimary,
  },
  gaugeSubText: {
    fontFamily: 'Poppins-Regular',
    fontSize: 7.5,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
});