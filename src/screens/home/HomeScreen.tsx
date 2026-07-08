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
import {Colors, Fonts} from '../../constants';

const PROGRESS_BAR_HEIGHT = 12;

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
        title="MABPKB"
        subtitle="Scan Dokumen BPKB"
        scrollY={scrollY}
        actions={[
          {icon: <NotificationIcon color={Colors.neutral} />, onPress: () => {}, accessibilityLabel: 'Notifikasi'},
          {icon: <MoreIcon color={Colors.neutral} />, onPress: () => {}, accessibilityLabel: 'Menu'},
        ]}
      />

      <Animated.ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, {paddingTop: EXPANDED_HEIGHT + insets.top}]}
        onScroll={onScroll}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={Colors.primary} />
        }>
        <Animated.View style={[styles.content, contentFade]}>
          <View style={styles.progressCard}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressRatio}>
                {completed} / {target} BPKB
              </Text>
              <Animated.Text style={[styles.progressPct, percentage]}>
                {pct}%
              </Animated.Text>
            </View>

            <View style={styles.progressTrack}>
              <Animated.View style={[styles.progressFill, progressWidth]} />
            </View>

            <Text style={styles.progressCaption}>Target bulan ini tercapai</Text>
          </View>

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
            activeOpacity={0.85}
            onPress={() => setActiveTab(1)}>
            <CameraIcon size={22} color={Colors.onPrimary} />
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
    paddingHorizontal: 20,
    gap: 16,
  },
  scrollContent: {
    paddingBottom: 120,
  },
  progressCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 2,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: 14,
  },
  progressRatio: {
    fontFamily: Fonts.heading.bold,
    fontSize: 22,
    color: Colors.primary,
  },
  progressPct: {
    fontFamily: Fonts.heading.bold,
    fontSize: 28,
    color: Colors.primary,
  },
  progressTrack: {
    height: PROGRESS_BAR_HEIGHT,
    borderRadius: PROGRESS_BAR_HEIGHT / 2,
    backgroundColor: Colors.secondary,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: PROGRESS_BAR_HEIGHT / 2,
    backgroundColor: Colors.primary,
  },
  progressCaption: {
    fontFamily: Fonts.body.regular,
    fontSize: 13,
    color: Colors.neutral,
    opacity: 0.5,
    marginTop: 10,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
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
    borderLeftColor: '#16a34a',
  },
  statCardAccent: {
    borderLeftWidth: 3,
    borderLeftColor: Colors.primary,
  },
  statNumber: {
    fontFamily: Fonts.heading.bold,
    fontSize: 28,
    color: Colors.neutral,
  },
  statNumberSuccess: {
    color: '#16a34a',
  },
  statNumberAccent: {
    color: Colors.primary,
  },
  statLabel: {
    fontFamily: Fonts.body.medium,
    fontSize: 13,
    color: Colors.neutral,
    opacity: 0.6,
    marginTop: 4,
  },
  ctaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    borderRadius: 16,
    paddingVertical: 16,
    gap: 10,
    shadowColor: Colors.primary,
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  ctaText: {
    fontFamily: Fonts.heading.semiBold,
    fontSize: 16,
    color: Colors.onPrimary,
  },
});
