import React, {useCallback, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
} from 'react-native';
import {useFocusEffect, useIsFocused, useNavigation} from '@react-navigation/native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import Svg, {Path} from 'react-native-svg';
import {Colors, Spacing, Radius} from '../../constants';
import {useTabNav} from '../../contexts/TabNavContext';
import {useHardwareKey} from '../../hooks/useHardwareKey';
import {useSound} from '../../hooks/useSound';
import {useHaptic} from '../../hooks/useHaptic';
import {usePedalStatus} from '../../hooks/usePedalStatus';

export default function PedalTestScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const isFocused = useIsFocused();
  const {setIsTabBarHidden, setIsPedalIntercepted} = useTabNav();
  const {isConnected} = usePedalStatus();

  const [pressCount, setPressCount] = useState(0);
  const [lastPressTime, setLastPressTime] = useState<string | null>(null);

  const {play: playSound} = useSound();
  const {trigger: haptic} = useHaptic();

  useFocusEffect(
    useCallback(() => {
      setIsTabBarHidden(true);
      setIsPedalIntercepted(true);
      return () => {
        setIsTabBarHidden(false);
        setIsPedalIntercepted(false);
      };
    }, [setIsTabBarHidden, setIsPedalIntercepted]),
  );

  const handlePedalTrigger = useCallback(() => {
    if (!isFocused) {
      return;
    }
    haptic('capture');
    playSound('tick');
    setPressCount(prev => prev + 1);

    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now
      .getMinutes()
      .toString()
      .padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
    setLastPressTime(timeStr);
  }, [isFocused, haptic, playSound]);

  useHardwareKey(handlePedalTrigger, isFocused, 'volumeDown');

  const handleReset = () => {
    setPressCount(0);
    setLastPressTime(null);
  };

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
          <Text style={styles.topBarSubtitle}>Diagnostik Perangkat Keras</Text>
          <Text style={styles.topBarTitle}>Uji Respons Pedal Bluetooth</Text>
        </View>
        <View style={styles.topBarRightSlot} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          {paddingBottom: Spacing.huge + insets.bottom},
        ]}
        showsVerticalScrollIndicator={false}>
        <View
          style={[
            styles.connectionCard,
            isConnected
              ? styles.connectionCardConnected
              : styles.connectionCardDisconnected,
          ]}>
          <View style={styles.connectionIconWrap}>
            <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
              <Path
                d="M6.5 6.5l11 11L12 23V1l5.5 5.5-11 11"
                stroke={isConnected ? Colors.primary : Colors.textTertiary}
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </Svg>
          </View>
          <View style={styles.connectionMeta}>
            <Text
              style={[
                styles.connectionStatusText,
                isConnected
                  ? styles.connectionStatusTextConnected
                  : styles.connectionStatusTextDisconnected,
              ]}>
              {isConnected
                ? 'Pedal Bluetooth Terhubung'
                : 'Pedal Belum Tersambung'}
            </Text>
            <Text style={styles.connectionSubText}>
              {isConnected
                ? 'Hardware input siap menerima injakan pemicu'
                : 'Injak pedal 1x di lantai untuk membangunkan'}
            </Text>
          </View>
          <View
            style={[
              styles.connectionIndicatorDot,
              isConnected
                ? styles.connectionIndicatorDotConnected
                : styles.connectionIndicatorDotDisconnected,
            ]}
          />
        </View>

        <View
          style={[
            styles.signalCard,
            pressCount > 0 && styles.signalCardActive,
          ]}>
          <View
            style={[
              styles.iconCircle,
              pressCount > 0 && styles.iconCircleActive,
            ]}>
            <Svg width={36} height={36} viewBox="0 0 24 24" fill="none">
              <Path
                d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"
                stroke={pressCount > 0 ? Colors.white : Colors.primary}
                strokeWidth={2.2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </Svg>
          </View>
          <Text style={styles.signalTitle}>
            {pressCount > 0
              ? 'Sinyal Volume Bawah Terdeteksi'
              : 'Injak Pedal di Lantai Sekarang'}
          </Text>
          <Text style={styles.signalSub}>
            {pressCount > 0
              ? `Total Injakan: ${pressCount} kali (Terakhir: ${lastPressTime})`
              : 'Sistem sedang mendengarkan pemicu tombol hardware.'}
          </Text>
        </View>

        <View style={styles.counterCard}>
          <View style={styles.counterRow}>
            <View style={styles.counterBox}>
              <Text style={styles.counterLabel}>Total Deteksi</Text>
              <Text style={styles.counterValue}>{pressCount}</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.counterBox}>
              <Text style={styles.counterLabel}>Waktu Terakhir</Text>
              <Text style={styles.counterValueSmall}>
                {lastPressTime ?? '--:--:--'}
              </Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.resetButton}
            activeOpacity={0.8}
            onPress={handleReset}>
            <Text style={styles.resetButtonText}>Reset Hitungan</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>Karakteristik Pedal Bluetooth:</Text>
          <View style={styles.infoItem}>
            <View style={styles.bulletDot} />
            <Text style={styles.infoItemText}>
              Pedal mengirimkan sinyal tombol volume bawah ke smartphone melalui koneksi Bluetooth HID.
            </Text>
          </View>
          <View style={styles.infoItem}>
            <View style={styles.bulletDot} />
            <Text style={styles.infoItemText}>
              Jika pedal lama tidak diinjak, alat otomatis masuk ke mode tidur (auto-sleep) untuk menghemat daya baterai.
            </Text>
          </View>
          <View style={styles.infoItem}>
            <View style={styles.bulletDot} />
            <Text style={styles.infoItemText}>
              Injak pedal 1 kali untuk membangunkan alat. Bluetooth HP akan otomatis tersambung kembali dalam 1-2 detik.
            </Text>
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
  topBarRightSlot: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.md,
    gap: 14,
  },
  signalCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.xxl,
    padding: Spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: Colors.borderLight,
    shadowColor: Colors.shadowDark,
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
  },
  signalCardActive: {
    borderColor: Colors.primary,
    backgroundColor: Colors.secondary,
  },
  iconCircle: {
    width: 68,
    height: 68,
    borderRadius: Radius.full,
    backgroundColor: Colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  iconCircleActive: {
    backgroundColor: Colors.primary,
  },
  signalTitle: {
    fontFamily: 'Poppins-Bold',
    fontSize: 15,
    color: Colors.textHeadline,
    marginBottom: 4,
    textAlign: 'center',
  },
  signalSub: {
    fontFamily: 'Poppins-Regular',
    fontSize: 12,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  counterCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.xl,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    shadowColor: Colors.shadowDark,
    shadowOffset: {width: 0, height: 3},
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  counterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  counterBox: {
    flex: 1,
    alignItems: 'center',
  },
  divider: {
    width: 1,
    height: 38,
    backgroundColor: Colors.border,
  },
  counterLabel: {
    fontFamily: 'Poppins-Medium',
    fontSize: 11,
    color: Colors.textSecondary,
    marginBottom: 2,
  },
  counterValue: {
    fontFamily: 'Poppins-Bold',
    fontSize: 26,
    color: Colors.primary,
  },
  counterValueSmall: {
    fontFamily: 'Poppins-Bold',
    fontSize: 18,
    color: Colors.textHeadline,
  },
  resetButton: {
    height: 44,
    borderRadius: Radius.full,
    backgroundColor: Colors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  resetButtonText: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 12.5,
    color: Colors.textHeadline,
  },
  infoCard: {
    backgroundColor: Colors.surfaceAlt,
    padding: Spacing.lg,
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    gap: 8,
  },
  infoTitle: {
    fontFamily: 'Poppins-Bold',
    fontSize: 12.5,
    color: Colors.textHeadline,
    marginBottom: 2,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  bulletDot: {
    width: 6,
    height: 6,
    borderRadius: Radius.full,
    backgroundColor: Colors.primary,
    marginTop: 6,
  },
  infoItemText: {
    flex: 1,
    fontFamily: 'Poppins-Regular',
    fontSize: 11.5,
    lineHeight: 17,
    color: Colors.textSecondary,
  },
  connectionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: Radius.xl,
    borderWidth: 1,
    gap: 12,
  },
  connectionCardConnected: {
    backgroundColor: Colors.secondary,
    borderColor: Colors.primary,
  },
  connectionCardDisconnected: {
    backgroundColor: Colors.surfaceAlt,
    borderColor: Colors.borderLight,
  },
  connectionIconWrap: {
    width: 36,
    height: 36,
    borderRadius: Radius.full,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  connectionMeta: {
    flex: 1,
  },
  connectionStatusText: {
    fontFamily: 'Poppins-Bold',
    fontSize: 13,
  },
  connectionStatusTextConnected: {
    color: Colors.primary,
  },
  connectionStatusTextDisconnected: {
    color: Colors.textHeadline,
  },
  connectionSubText: {
    fontFamily: 'Poppins-Regular',
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 1,
  },
  connectionIndicatorDot: {
    width: 10,
    height: 10,
    borderRadius: Radius.full,
  },
  connectionIndicatorDotConnected: {
    backgroundColor: Colors.emeraldMint,
  },
  connectionIndicatorDotDisconnected: {
    backgroundColor: Colors.textTertiary,
  },
});
