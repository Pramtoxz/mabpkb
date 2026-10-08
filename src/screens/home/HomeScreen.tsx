import React, {useCallback, useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  Easing,
  interpolate,
  Extrapolation,
} from 'react-native-reanimated';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import CollapsibleTopAppBar, {
  useCollapsibleHeader,
  EXPANDED_HEIGHT,
} from '../../components/CollapsibleTopAppBar';
import {NotificationIcon, MoreIcon, CameraIcon} from '../../components/TabIcons';
import {useTabNav} from '../../contexts/TabNavContext';
import {getActivity, type ActivityResponse} from '../../api/endpoints';
import {Colors, Typography, Spacing, Radius} from '../../constants';

const PROGRESS_BAR_HEIGHT = 8;

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const {scrollY, onScroll} = useCollapsibleHeader();
  const {setActiveTab} = useTabNav();

  const [activity, setActivity] = useState<ActivityResponse | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const progressFill = useSharedValue(0);
  const contentOpacity = useSharedValue(0);

  const fetchActivity = useCallback(async () => {
    try {
      const data = await getActivity();
      setActivity(data);
      const pct = data.target_bpkb > 0 ? data.completed_bpkb / data.target_bpkb : 0;
      progressFill.value = withDelay(
        300,
        withTiming(pct, {duration: 1200, easing: Easing.out(Easing.cubic)}),
      );
    } catch {
      setActivity({target_bpkb: 0, completed_bpkb: 0, pending_bpkb: 0});
    }
  }, [progressFill]);

  useEffect(() => {
    contentOpacity.value = withTiming(1, {duration: 400, easing: Easing.out(Easing.cubic)});
    fetchActivity();
  }, [fetchActivity, contentOpacity]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    progressFill.value = 0;
    await fetchActivity();
    setRefreshing(false);
  }, [fetchActivity, progressFill]);

  const contentFade = useAnimatedStyle(() => ({
    opacity: contentOpacity.value,
    transform: [{translateY: interpolate(contentOpacity.value, [0, 1], [12, 0], Extrapolation.CLAMP)}],
  }));

  const progressWidth = useAnimatedStyle(() => ({
    width: `${interpolate(progressFill.value, [0, 1], [0, 100], Extrapolation.CLAMP)}%`,
  }));

  const percentage = useAnimatedStyle(() => ({
    opacity: interpolate(progressFill.value, [0, 0.05], [0, 1], Extrapolation.CLAMP),
  }));

  const target = activity?.target_bpkb ?? 0;
  const completed = activity?.completed_bpkb ?? 0;
  const pending = activity?.pending_bpkb ?? 0;
  const pct = target > 0 ? Math.round((completed / target) * 100) : 0;

  return (
    <View style={styles.screen}>
      <CollapsibleTopAppBar
        title="ACIAX"
        subtitle="BPKB Scanner"
        scrollY={scrollY}
        actions={[
          {icon: <NotificationIcon color={Colors.textPrimary} />, onPress: () => {}, accessibilityLabel: 'Notifikasi'},
          {icon: <MoreIcon color={Colors.textPrimary} />, onPress: () => {}, accessibilityLabel: 'Menu'},
        ]}
      />

      <Animated.ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, {paddingTop: EXPANDED_HEIGHT + insets.top}]}
        onScroll={onScroll}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={Colors.accent} />
        }>
        <Animated.View style={[styles.content, contentFade]}>
          <View style={styles.heroSection}>
            <Text style={styles.heroNumber}>{completed}</Text>
            <Text style={styles.heroLabel}>dari {target} BPKB hari ini</Text>
          </View>

          <View style={styles.progressTrack}>
            <Animated.View style={[styles.progressFill, progressWidth]} />
          </View>
          <Animated.Text style={[styles.progressPct, percentage]}>
            {pct}%
          </Animated.Text>

          <View style={styles.statsRow}>
            <View style={[styles.statCard, styles.statCardSuccess]}>
              <Text style={[styles.statNumber, styles.statNumberSuccess]}>{completed}</Text>
              <Text style={styles.statLabel}>Selesai</Text>
            </View>

            <View style={[styles.statCard, pending > 0 ? styles.statCardAccent : null]}>
              <Text style={[styles.statNumber, pending > 0 ? styles.statNumberAccent : null]}>
                {pending}
              </Text>
              <Text style={styles.statLabel}>Pending</Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.ctaButton}
            activeOpacity={0.9}
            onPress={() => setActiveTab(1)}>
            <CameraIcon size={22} color={Colors.textOnAccent} />
            <Text style={styles.ctaText}>Mulai Scan BPKB</Text>
          </TouchableOpacity>
        </Animated.View>
      </Animated.ScrollView>
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
  content: {
    paddingHorizontal: Spacing.xl,
    gap: Spacing.lg,
  },
  scrollContent: {
    paddingBottom: 120,
  },
  heroSection: {
    alignItems: 'center',
    paddingTop: Spacing.xxxl,
  },
  heroNumber: {
    fontFamily: 'JetBrainsMono-Medium',
    fontSize: 64,
    lineHeight: 72,
    color: Colors.textPrimary,
  },
  heroLabel: {
    ...Typography.body,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
  },
  progressTrack: {
    height: PROGRESS_BAR_HEIGHT,
    borderRadius: PROGRESS_BAR_HEIGHT / 2,
    backgroundColor: Colors.borderLight,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: PROGRESS_BAR_HEIGHT / 2,
    backgroundColor: Colors.accent,
  },
  progressPct: {
    fontFamily: 'JetBrainsMono-Medium',
    fontSize: 14,
    color: Colors.accent,
    textAlign: 'right',
  },
  statsRow: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    padding: Spacing.xl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 1,
  },
  statCardSuccess: {
    borderLeftWidth: 3,
    borderLeftColor: Colors.success,
  },
  statCardAccent: {
    borderLeftWidth: 3,
    borderLeftColor: Colors.accent,
  },
  statNumber: {
    fontFamily: 'JetBrainsMono-Medium',
    fontSize: 28,
    lineHeight: 36,
    color: Colors.textPrimary,
  },
  statNumberSuccess: {
    color: Colors.success,
  },
  statNumberAccent: {
    color: Colors.accent,
  },
  statLabel: {
    ...Typography.label,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  ctaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.accent,
    borderRadius: Radius.lg,
    paddingVertical: Spacing.xxl,
    gap: 10,
    shadowColor: Colors.shadow,
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 1,
    shadowRadius: 16,
    elevation: 6,
    marginTop: Spacing.md,
  },
  ctaText: {
    ...Typography.button,
    color: Colors.textOnAccent,
  },
});