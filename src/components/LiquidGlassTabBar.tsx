import React, {useEffect} from 'react';
import {View, TouchableOpacity, StyleSheet, Dimensions} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  Easing,
  interpolate,
} from 'react-native-reanimated';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {Colors} from '../constants';

const {width: SCREEN_WIDTH} = Dimensions.get('window');
const TAB_BAR_HEIGHT = 72;
const CENTER_BUTTON_SIZE = 68;
const CENTER_BUTTON_OFFSET = -28;

interface TabItem {
  key: string;
  icon: React.ReactNode;
  iconActive: React.ReactNode;
  onPress: () => void;
}

interface LiquidGlassTabBarProps {
  tabs: [TabItem, TabItem, TabItem];
  activeIndex: number;
}

function CenterButton({icon, onPress}: {icon: React.ReactNode; onPress: () => void}) {
  const pulse = useSharedValue(0);
  const sway = useSharedValue(0);

  useEffect(() => {
    pulse.value = withRepeat(
      withSequence(
        withTiming(1, {duration: 1500, easing: Easing.inOut(Easing.ease)}),
        withTiming(0, {duration: 1500, easing: Easing.inOut(Easing.ease)}),
      ),
      -1,
      true,
    );

    sway.value = withRepeat(
      withSequence(
        withTiming(1, {duration: 2000, easing: Easing.inOut(Easing.ease)}),
        withTiming(-1, {duration: 2000, easing: Easing.inOut(Easing.ease)}),
        withTiming(0, {duration: 1000, easing: Easing.inOut(Easing.ease)}),
      ),
      -1,
      true,
    );
  }, [pulse, sway]);

  const animatedStyle = useAnimatedStyle(() => {
    const scale = interpolate(pulse.value, [0, 1], [1, 1.06]);
    const translateX = interpolate(sway.value, [-1, 0, 1], [-2, 0, 2]);
    return {
      transform: [{scale}, {translateX}],
    };
  });

  return (
    <Animated.View style={[styles.centerButtonWrap, animatedStyle]}>
      <TouchableOpacity
        style={styles.centerButton}
        onPress={onPress}
        activeOpacity={0.85}>
        <View style={styles.centerButtonInner}>
          {icon}
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

export default function LiquidGlassTabBar({tabs, activeIndex}: LiquidGlassTabBarProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, {paddingBottom: insets.bottom + 8}]}>
      <View style={styles.glass}>
        <View style={styles.tabRow}>
          <TabButton
            item={tabs[0]}
            isActive={activeIndex === 0}
          />
          <View style={styles.centerSpace} />
          <TabButton
            item={tabs[2]}
            isActive={activeIndex === 2}
          />
        </View>
        <CenterButton
          icon={tabs[1].iconActive}
          onPress={tabs[1].onPress}
        />
      </View>
    </View>
  );
}

function TabButton({item, isActive}: {item: TabItem; isActive: boolean}) {
  return (
    <TouchableOpacity
      style={styles.tabButton}
      onPress={item.onPress}
      activeOpacity={0.7}>
      <View style={styles.tabIconWrap}>
        {isActive ? item.iconActive : item.icon}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
  },
  glass: {
    backgroundColor: 'rgba(255, 255, 255, 0.55)',
    borderRadius: 28,
    height: TAB_BAR_HEIGHT,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.7)',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 8},
    shadowOpacity: 0.1,
    shadowRadius: 24,
    elevation: 16,
    overflow: 'visible',
    position: 'relative',
  },
  tabRow: {
    flexDirection: 'row',
    alignItems: 'center',
    height: '100%',
    paddingHorizontal: 12,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
  },
  tabIconWrap: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 22,
  },
  centerSpace: {
    width: CENTER_BUTTON_SIZE,
  },
  centerButtonWrap: {
    position: 'absolute',
    top: CENTER_BUTTON_OFFSET,
    left: SCREEN_WIDTH / 2 - 16 - CENTER_BUTTON_SIZE / 2,
    width: CENTER_BUTTON_SIZE,
    height: CENTER_BUTTON_SIZE,
    zIndex: 10,
  },
  centerButton: {
    width: CENTER_BUTTON_SIZE,
    height: CENTER_BUTTON_SIZE,
    borderRadius: CENTER_BUTTON_SIZE / 2,
    backgroundColor: Colors.primary,
    shadowColor: Colors.primary,
    shadowOffset: {width: 0, height: 6},
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 12,
  },
  centerButtonInner: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: CENTER_BUTTON_SIZE / 2,
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
});
