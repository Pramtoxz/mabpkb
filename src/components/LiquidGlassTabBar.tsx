import React, {useCallback, useEffect, useState} from 'react';
import {View, TouchableOpacity, StyleSheet, LayoutChangeEvent} from 'react-native';
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

const TAB_BAR_HEIGHT = 72;
const CENTER_BUTTON_SIZE = 68;
const CENTER_BUTTON_LIFT = 28;

interface TabItem {
  key: string;
  icon: React.ReactNode;
  iconActive: React.ReactNode;
  onPress: () => void;
}

interface LiquidGlassTabBarProps {
  tabs: [TabItem, TabItem, TabItem];
  activeIndex: number;
  hidden?: boolean;
}

function CenterButton({icon, onPress, isActive, left}: {icon: React.ReactNode; onPress: () => void; isActive: boolean; left: number}) {
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
    <Animated.View
      style={[
        styles.centerButtonWrap,
        {left},
        animatedStyle,
        isActive && styles.centerButtonActive,
      ]}>
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

export default function LiquidGlassTabBar({tabs, activeIndex, hidden}: LiquidGlassTabBarProps) {
  const insets = useSafeAreaInsets();
  const [containerWidth, setContainerWidth] = useState(0);
  const slideDown = useSharedValue(0);

  useEffect(() => {
    slideDown.value = withTiming(hidden ? 1 : 0, {
      duration: 300,
      easing: Easing.out(Easing.cubic),
    });
  }, [hidden, slideDown]);

  const onContainerLayout = useCallback((e: LayoutChangeEvent) => {
    setContainerWidth(e.nativeEvent.layout.width);
  }, []);

  const centerLeft = containerWidth / 2 - CENTER_BUTTON_SIZE / 2;

  const animatedContainerStyle = useAnimatedStyle(() => ({
    transform: [{translateY: interpolate(slideDown.value, [0, 1], [0, 200])}],
    opacity: interpolate(slideDown.value, [0, 1], [1, 0]),
  }));

  return (
    <Animated.View
      style={[
        styles.container,
        {paddingBottom: insets.bottom + 8},
        animatedContainerStyle,
      ]}
      onLayout={onContainerLayout}>
      <View style={styles.glass}>
        <View style={styles.tabRow}>
          <TabButton
            item={tabs[0]}
            isActive={activeIndex === 0}
          />
          <View style={{width: CENTER_BUTTON_SIZE}} />
          <TabButton
            item={tabs[2]}
            isActive={activeIndex === 2}
          />
        </View>
      </View>
      {containerWidth > 0 && (
        <CenterButton
          icon={tabs[1].iconActive}
          onPress={tabs[1].onPress}
          isActive={activeIndex === 1}
          left={centerLeft}
        />
      )}
    </Animated.View>
  );
}

function TabButton({item, isActive}: {item: TabItem; isActive: boolean}) {
  return (
    <TouchableOpacity
      style={styles.tabButton}
      onPress={item.onPress}
      activeOpacity={0.7}>
      {isActive ? (
        <View style={styles.activePill}>
          {item.iconActive}
        </View>
      ) : (
        <View style={styles.tabIconWrap}>
          {item.icon}
        </View>
      )}
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
    alignItems: 'center',
  },
  glass: {
    width: '100%',
    backgroundColor: Colors.background,
    borderRadius: 28,
    height: TAB_BAR_HEIGHT,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.7)',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 8},
    shadowOpacity: 0.1,
    shadowRadius: 24,
    elevation: 16,
    overflow: 'hidden',
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
    gap: 2,
  },
  tabIconWrap: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 22,
  },
  activePill: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.accent,
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 10,
    gap: 6,
    shadowColor: Colors.shadow,
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 1,
    shadowRadius: 6,
    elevation: 4,
  },
  centerButtonWrap: {
    position: 'absolute',
    top: -CENTER_BUTTON_LIFT,
    width: CENTER_BUTTON_SIZE,
    height: CENTER_BUTTON_SIZE,
    zIndex: 10,
  },
  centerButtonActive: {
    shadowColor: Colors.shadow,
    shadowOffset: {width: 0, height: 0},
    shadowOpacity: 1,
    shadowRadius: 16,
    elevation: 20,
  },
  centerButton: {
    width: CENTER_BUTTON_SIZE,
    height: CENTER_BUTTON_SIZE,
    borderRadius: CENTER_BUTTON_SIZE / 2,
    backgroundColor: Colors.accent,
    shadowColor: Colors.shadow,
    shadowOffset: {width: 0, height: 6},
    shadowOpacity: 1,
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
