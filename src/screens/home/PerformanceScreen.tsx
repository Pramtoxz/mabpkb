import React, {useCallback, useState, useMemo} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
} from 'react-native';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import Svg, {Path} from 'react-native-svg';
import dayjs from 'dayjs';
import 'dayjs/locale/id';
import {Colors, Spacing, Radius} from '../../constants';
import {useTabNav} from '../../contexts/TabNavContext';
import DateFilterModal, {DateRange} from '../../components/DateFilterModal';
import perfData from '../../mock/performance.json';

dayjs.locale('id');

export default function PerformanceScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const {setIsTabBarHidden} = useTabNav();

  const [showDateFilter, setShowDateFilter] = useState(false);
  const [dateRange, setDateRange] = useState<DateRange>({
    startDate: undefined,
    endDate: undefined,
  });
  const [appliedRange, setAppliedRange] = useState<DateRange>({
    startDate: undefined,
    endDate: undefined,
  });

  useFocusEffect(
    useCallback(() => {
      setIsTabBarHidden(true);
      return () => {
        setIsTabBarHidden(false);
      };
    }, [setIsTabBarHidden]),
  );

  const {summary, weekly, monthly} = perfData;

  const onDateRangeChange = (params: any) => {
    setDateRange({
      startDate: params.startDate,
      endDate: params.endDate,
    });
  };

  const handleApplyFilter = () => {
    setAppliedRange(dateRange);
    setShowDateFilter(false);
  };

  const handleClearFilter = () => {
    setDateRange({
      startDate: undefined,
      endDate: undefined,
    });
    setAppliedRange({
      startDate: undefined,
      endDate: undefined,
    });
    setShowDateFilter(false);
  };

  const formattedPeriod = useMemo(() => {
    if (!appliedRange.startDate) {
      return null;
    }
    const start = dayjs(appliedRange.startDate).format('D MMM YYYY');
    if (!appliedRange.endDate || appliedRange.startDate === appliedRange.endDate) {
      return start;
    }
    const end = dayjs(appliedRange.endDate).format('D MMM YYYY');
    return `${start} - ${end}`;
  }, [appliedRange]);

  const displayedSummary = useMemo(() => {
    if (!appliedRange.startDate) {
      return summary;
    }
    return {
      totalThisMonth: 486,
      targetThisMonth: 550,
      achievementPercentage: 88,
      avgScanSeconds: summary.avgScanSeconds,
      accuracyRate: summary.accuracyRate,
    };
  }, [appliedRange.startDate, summary]);

  return (
    <View style={styles.screen}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor={Colors.background}
        translucent
      />
      <View
        style={[
          styles.topBar,
          {paddingTop: Math.max(insets.top, 16) + Spacing.xs},
        ]}>
        <TouchableOpacity
          style={styles.backButton}
          activeOpacity={0.7}
          onPress={() => navigation.goBack()}
          hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}>
          <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
            <Path
              d="M19 12H5M12 19l-7-7 7-7"
              stroke={Colors.textHeadline}
              strokeWidth={2.2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </Svg>
        </TouchableOpacity>
        <View style={styles.topBarTitleBox}>
          <Text style={styles.topBarSubtitle}>Statistik Operator 08:00 - 16:00</Text>
          <Text style={styles.topBarTitle}>Grafik Performa</Text>
        </View>
        <TouchableOpacity
          style={[
            styles.calendarButton,
            Boolean(appliedRange.startDate) && styles.calendarButtonActive,
          ]}
          activeOpacity={0.7}
          onPress={() => setShowDateFilter(true)}
          hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}>
          <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
            <Path
              d="M19 4H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2zM16 2v4M8 2v4M3 10h18"
              stroke={appliedRange.startDate ? Colors.primary : Colors.textHeadline}
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </Svg>
          {Boolean(appliedRange.startDate) && <View style={styles.calendarDot} />}
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          {paddingBottom: Spacing.huge + insets.bottom},
        ]}
        showsVerticalScrollIndicator={false}>
        {formattedPeriod ? (
          <View style={styles.filterBanner}>
            <View style={styles.filterBannerLeft}>
              <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
                <Path
                  d="M19 4H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2zM16 2v4M8 2v4M3 10h18"
                  stroke={Colors.primary}
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </Svg>
              <Text style={styles.filterBannerText}>
                Filter: {formattedPeriod}
              </Text>
            </View>
            <TouchableOpacity
              onPress={handleClearFilter}
              activeOpacity={0.7}
              hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}
              style={styles.filterBannerClose}>
              <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
                <Path
                  d="M18 6L6 18M6 6l12 12"
                  stroke={Colors.textSecondary}
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </Svg>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity
            style={styles.filterTriggerBar}
            activeOpacity={0.8}
            onPress={() => setShowDateFilter(true)}>
            <View style={styles.filterTriggerLeft}>
              <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
                <Path
                  d="M19 4H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2zM16 2v4M8 2v4M3 10h18"
                  stroke={Colors.primary}
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </Svg>
              <Text style={styles.filterTriggerText}>
                Periode: Bulan Berjalan (Default)
              </Text>
            </View>
            <Text style={styles.filterTriggerAction}>Ubah</Text>
          </TouchableOpacity>
        )}

        <View style={styles.heroMetricCard}>
          <Text style={styles.heroMetricLabel}>
            {formattedPeriod
              ? `Total BPKB (${formattedPeriod})`
              : 'Total BPKB Bulan Ini'}
          </Text>
          <View style={styles.heroNumberRow}>
            <Text style={styles.heroMetricNumber}>
              {displayedSummary.totalThisMonth}
            </Text>
            <Text style={styles.heroMetricTarget}>
              / {displayedSummary.targetThisMonth} Target
            </Text>
          </View>
          <View style={styles.progressBarBg}>
            <View
              style={[
                styles.progressBarFill,
                {width: `${displayedSummary.achievementPercentage}%`},
              ]}
            />
          </View>
          <Text style={styles.heroAchievementText}>
            {displayedSummary.achievementPercentage}% Target Telah Tercapai
          </Text>
        </View>

        <View style={styles.kpiRow}>
          <View style={styles.kpiBox}>
            <Text style={styles.kpiBoxLabel}>Kecepatan Rata-rata</Text>
            <Text style={styles.kpiBoxValue}>{displayedSummary.avgScanSeconds} Detik</Text>
            <Text style={styles.kpiBoxSub}>per dokumen BPKB</Text>
          </View>
          <View style={styles.kpiBox}>
            <Text style={styles.kpiBoxLabel}>Akurasi OCR</Text>
            <Text style={styles.kpiBoxValue}>{displayedSummary.accuracyRate}%</Text>
            <Text style={styles.kpiBoxSub}>validasi nomor rangka</Text>
          </View>
        </View>

        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Pencapaian Mingguan (Senin - Sabtu)</Text>
          <View style={styles.barChartRow}>
            {weekly.map(item => {
              const heightPercent = Math.min((item.completed / 100) * 100, 100);
              return (
                <View key={item.day} style={styles.barCol}>
                  <Text style={styles.barValText}>{item.completed}</Text>
                  <View style={styles.barTrack}>
                    <View
                      style={[styles.barFill, {height: `${heightPercent}%`}]}
                    />
                  </View>
                  <Text style={styles.barDayText}>{item.day}</Text>
                </View>
              );
            })}
          </View>
        </View>

        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Tren 6 Bulan Terakhir</Text>
          <View style={styles.monthlyList}>
            {monthly.map(m => (
              <View key={m.month} style={styles.monthlyRow}>
                <Text style={styles.monthName}>{m.month}</Text>
                <View style={styles.monthTrack}>
                  <View
                    style={[
                      styles.monthFill,
                      {width: `${Math.min((m.total / 2400) * 100, 100)}%`},
                    ]}
                  />
                </View>
                <Text style={styles.monthTotal}>{m.total} BPKB</Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      <DateFilterModal
        visible={showDateFilter}
        dateRange={dateRange}
        onClose={() => setShowDateFilter(false)}
        onDateRangeChange={onDateRangeChange}
        onApply={handleApplyFilter}
        onClear={handleClearFilter}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.md,
    backgroundColor: Colors.background,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: Radius.full,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: Colors.shadowDark,
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  topBarTitleBox: {
    alignItems: 'center',
    flex: 1,
  },
  topBarSubtitle: {
    fontFamily: 'Poppins-Bold',
    fontSize: 10,
    color: Colors.primary,
    letterSpacing: 0.5,
  },
  topBarTitle: {
    fontFamily: 'Poppins-Bold',
    fontSize: 16,
    color: Colors.textHeadline,
  },
  calendarButton: {
    width: 40,
    height: 40,
    borderRadius: Radius.full,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: Colors.shadowDark,
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
    position: 'relative',
  },
  calendarButtonActive: {
    borderColor: Colors.primary,
    backgroundColor: Colors.secondary,
  },
  calendarDot: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 7,
    height: 7,
    borderRadius: Radius.full,
    backgroundColor: Colors.primary,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.md,
    gap: 14,
  },
  filterBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.secondary,
    borderWidth: 1,
    borderColor: Colors.secondary,
    paddingHorizontal: Spacing.md,
    paddingVertical: 10,
    borderRadius: Radius.lg,
  },
  filterBannerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  filterBannerText: {
    fontFamily: 'Poppins-Bold',
    fontSize: 11.5,
    color: Colors.primary,
  },
  filterBannerClose: {
    padding: 4,
  },
  filterTriggerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    paddingHorizontal: Spacing.md,
    paddingVertical: 10,
    borderRadius: Radius.lg,
  },
  filterTriggerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  filterTriggerText: {
    fontFamily: 'Poppins-Medium',
    fontSize: 11.5,
    color: Colors.textSecondary,
  },
  filterTriggerAction: {
    fontFamily: 'Poppins-Bold',
    fontSize: 11.5,
    color: Colors.primary,
  },
  heroMetricCard: {
    backgroundColor: Colors.surface,
    padding: Spacing.lg,
    borderRadius: Radius.xxl,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    shadowColor: Colors.shadowDark,
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  heroMetricLabel: {
    fontFamily: 'Poppins-Medium',
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  heroNumberRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
    marginBottom: Spacing.sm,
  },
  heroMetricNumber: {
    fontFamily: 'Poppins-Bold',
    fontSize: 32,
    color: Colors.primary,
  },
  heroMetricTarget: {
    fontFamily: 'Poppins-Regular',
    fontSize: 13,
    color: Colors.textTertiary,
  },
  progressBarBg: {
    height: 8,
    borderRadius: Radius.full,
    backgroundColor: Colors.surfaceAlt,
    overflow: 'hidden',
    marginBottom: 6,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: Colors.emeraldMint,
    borderRadius: Radius.full,
  },
  heroAchievementText: {
    fontFamily: 'Poppins-Medium',
    fontSize: 11,
    color: Colors.textSecondary,
  },
  kpiRow: {
    flexDirection: 'row',
    gap: 12,
  },
  kpiBox: {
    flex: 1,
    backgroundColor: Colors.surface,
    padding: Spacing.md,
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    alignItems: 'center',
    shadowColor: Colors.shadowDark,
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  kpiBoxLabel: {
    fontFamily: 'Poppins-Medium',
    fontSize: 11,
    color: Colors.textSecondary,
    marginBottom: 2,
    textAlign: 'center',
  },
  kpiBoxValue: {
    fontFamily: 'Poppins-Bold',
    fontSize: 18,
    color: Colors.textHeadline,
    marginBottom: 2,
  },
  kpiBoxSub: {
    fontFamily: 'Poppins-Regular',
    fontSize: 10,
    color: Colors.textTertiary,
  },
  sectionCard: {
    backgroundColor: Colors.surface,
    padding: Spacing.lg,
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    shadowColor: Colors.shadowDark,
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  sectionTitle: {
    fontFamily: 'Poppins-Bold',
    fontSize: 13,
    color: Colors.textHeadline,
    marginBottom: Spacing.md,
  },
  barChartRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 120,
    paddingTop: 10,
  },
  barCol: {
    flex: 1,
    alignItems: 'center',
    height: '100%',
    justifyContent: 'flex-end',
  },
  barValText: {
    fontFamily: 'Poppins-Medium',
    fontSize: 10,
    color: Colors.textTertiary,
    marginBottom: 4,
  },
  barTrack: {
    width: 20,
    height: 80,
    backgroundColor: Colors.surfaceAlt,
    borderRadius: Radius.sm,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  barFill: {
    width: '100%',
    backgroundColor: Colors.primary,
    borderRadius: Radius.sm,
  },
  barDayText: {
    fontFamily: 'Poppins-Bold',
    fontSize: 11,
    color: Colors.textHeadline,
    marginTop: 6,
  },
  monthlyList: {
    gap: 8,
  },
  monthlyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  monthName: {
    width: 32,
    fontFamily: 'Poppins-Medium',
    fontSize: 11.5,
    color: Colors.textSecondary,
  },
  monthTrack: {
    flex: 1,
    height: 8,
    backgroundColor: Colors.surfaceAlt,
    borderRadius: Radius.full,
    overflow: 'hidden',
  },
  monthFill: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: Radius.full,
  },
  monthTotal: {
    width: 65,
    fontFamily: 'Poppins-Bold',
    fontSize: 11,
    color: Colors.textHeadline,
    textAlign: 'right',
  },
});
