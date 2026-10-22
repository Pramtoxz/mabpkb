import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
} from 'react-native';
import DatePicker from '@amjed-bouhouch/react-native-ui-datepicker';
import dayjs from 'dayjs';
import 'dayjs/locale/id';
import Svg, {Path} from 'react-native-svg';
import {Colors, Spacing, Radius} from '../constants';

dayjs.locale('id');

export interface DateRange {
  startDate: string | undefined;
  endDate: string | undefined;
}

interface DateFilterModalProps {
  visible: boolean;
  dateRange: DateRange;
  onClose: () => void;
  onDateRangeChange: (params: any) => void;
  onApply: () => void;
  onClear: () => void;
}

export default function DateFilterModal({
  visible,
  dateRange,
  onClose,
  onDateRangeChange,
  onApply,
  onClear,
}: DateFilterModalProps) {
  const formatDateDisplay = (date: string | undefined) => {
    if (!date) {
      return 'Pilih tanggal';
    }
    return dayjs(date).format('DD MMMM YYYY');
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Filter Parameter Tanggal</Text>
            <TouchableOpacity
              onPress={onClose}
              hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}
              style={styles.closeBtn}>
              <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
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

          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={styles.dateRangeDisplay}>
              <View style={styles.dateRangeItem}>
                <Text style={styles.dateRangeLabel}>Dari:</Text>
                <Text style={styles.dateRangeValue}>
                  {formatDateDisplay(dateRange.startDate)}
                </Text>
              </View>
              <View style={styles.dateRangeSeparator} />
              <View style={styles.dateRangeItem}>
                <Text style={styles.dateRangeLabel}>Sampai:</Text>
                <Text style={styles.dateRangeValue}>
                  {formatDateDisplay(dateRange.endDate)}
                </Text>
              </View>
            </View>

            <DatePicker
              mode="range"
              startDate={dateRange.startDate}
              endDate={dateRange.endDate}
              onChange={onDateRangeChange}
              selectedItemColor={Colors.primary}
              selectedTextStyle={styles.selectedText}
              todayContainerStyle={styles.todayContainer}
              headerButtonColor={Colors.primary}
              headerTextStyle={styles.headerText}
              weekDaysTextStyle={styles.weekDaysText}
              calendarTextStyle={styles.calendarText}
            />
          </ScrollView>

          <View style={styles.modalActions}>
            <TouchableOpacity
              style={styles.clearButton}
              activeOpacity={0.7}
              onPress={onClear}>
              <Text style={styles.clearButtonText}>Reset</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.applyButton}
              activeOpacity={0.7}
              onPress={onApply}>
              <Text style={styles.applyButtonText}>Terapkan</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: Colors.dim,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.md,
  },
  modalContent: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.xxl,
    padding: Spacing.xl,
    width: '100%',
    maxWidth: 420,
    maxHeight: '85%',
    shadowColor: Colors.shadowDark,
    shadowOffset: {width: 0, height: 8},
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  modalTitle: {
    fontSize: 16,
    fontFamily: 'Poppins-Bold',
    color: Colors.textHeadline,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surfaceAlt,
  },
  dateRangeDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceAlt,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  dateRangeItem: {
    flex: 1,
  },
  dateRangeSeparator: {
    width: 1,
    height: 36,
    backgroundColor: Colors.border,
    marginHorizontal: Spacing.sm,
  },
  dateRangeLabel: {
    fontSize: 10,
    fontFamily: 'Poppins-Medium',
    color: Colors.textTertiary,
    marginBottom: 2,
  },
  dateRangeValue: {
    fontSize: 12.5,
    fontFamily: 'Poppins-SemiBold',
    color: Colors.textHeadline,
  },
  selectedText: {
    fontFamily: 'Poppins-Bold',
    color: Colors.white,
  },
  todayContainer: {
    borderWidth: 1.5,
    borderColor: Colors.primary,
  },
  headerText: {
    fontFamily: 'Poppins-Bold',
    fontSize: 14,
    color: Colors.textHeadline,
  },
  weekDaysText: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 11,
    color: Colors.textSecondary,
  },
  calendarText: {
    fontFamily: 'Poppins-Regular',
    fontSize: 13,
    color: Colors.textHeadline,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: Spacing.md,
    gap: Spacing.sm,
  },
  clearButton: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: Radius.lg,
    paddingVertical: 12,
    alignItems: 'center',
    backgroundColor: Colors.surface,
  },
  clearButtonText: {
    fontSize: 13,
    fontFamily: 'Poppins-SemiBold',
    color: Colors.textSecondary,
  },
  applyButton: {
    flex: 1,
    backgroundColor: Colors.primary,
    borderRadius: Radius.lg,
    paddingVertical: 12,
    alignItems: 'center',
  },
  applyButtonText: {
    fontSize: 13,
    fontFamily: 'Poppins-Bold',
    color: Colors.white,
  },
});
