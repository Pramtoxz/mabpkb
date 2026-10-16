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

const TAB_BAR_HEIGHT = 68;
const CENTER_BUTTON_SIZE = 64;
const CENTER_BUTTON_LIFT = 24;

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

function CenterButton({
  icon,
  onPress,
  isActive,
  left,
}: {
  icon: React.ReactNode;
  onPress: () => void;
  isActive: boolean;
  left: number;
}) {
  const pulse = useSharedValue(0);

  useEffect(() => {
    pulse.value = withRepeat(
      withSequence(
        withTiming(1, {duration: 1600, easing: Easing.inOut(Easing.ease)}),
        withTiming(0, {duration: 1600, easing: Easing.inOut(Easing.ease)}),
      ),
      -1,
      true,
    );
  }, [pulse]);

  const animatedGlow = useAnimatedStyle(() => {
    const scale = interpolate(pulse.value, [0, 1], [1, 1.08]);
    const opacity = interpolate(pulse.value, [0, 1], [0.6, 1]);
    return {
      transform: [{scale}],
      opacity,
    };
  });

  return (
    <View style={[styles.centerButtonWrap, {left}]}>
      {/* Outer Emerald Glow Ring */}
      <Animated.View style={[styles.glowRing, animatedGlow]} />

      <TouchableOpacity
        style={[styles.centerButton, isActive && styles.centerButtonActive]}
        onPress={onPress}
        activeOpacity={0.88}>
        <View style={styles.centerButtonInner}>
          {icon}
        </View>
      </TouchableOpacity>
    </View>
  );
}

export default function LiquidGlassTabBar({
  tabs,
  activeIndex,
  hidden,
}: LiquidGlassTabBarProps) {
  const insets = useSafeAreaInsets();
  const [containerWidth, setContainerWidth] = useState(0);
  const slideDown = useSharedValue(0);

  useEffect(() => {
    slideDown.value = withTiming(hidden ? 1 : 0, {
      duration: 250,
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
        {paddingBottom: Math.max(insets.bottom, 12)},
        animatedContainerStyle,
      ]}
      onLayout={onContainerLayout}>
      <View style={styles.darkBar}>
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
      activeOpacity={0.75}>
      <View style={styles.tabIconWrap}>
        {isActive ? item.iconActive : item.icon}
        {isActive && <View style={styles.activeDot} />}
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
    alignItems: 'center',
    zIndex: 100,
  },
  darkBar: {
    width: '100%',
    backgroundColor: Colors.darkNavBar,
    borderRadius: 34,
    height: TAB_BAR_HEIGHT,
    borderWidth: 1,
    borderColor: Colors.darkNavBarBorder,
    shadowColor: Colors.shadowDark,
    shadowOffset: {width: 0, height: 10},
    shadowOpacity: 0.35,
    shadowRadius: 24,
    elevation: 20,
    overflow: 'visible',
  },
  tabRow: {
    flexDirection: 'row',
    alignItems: 'center',
    height: '100%',
    paddingHorizontal: 16,
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
    position: 'relative',
  },
  activeDot: {
    position: 'absolute',
    bottom: 2,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.emerald,
  },
  centerButtonWrap: {
    position: 'absolute',
    top: -CENTER_BUTTON_LIFT,
    width: CENTER_BUTTON_SIZE,
    height: CENTER_BUTTON_SIZE,
    zIndex: 120,
    alignItems: 'center',
    justifyContent: 'center',
  },
  glowRing: {
    position: 'absolute',
    width: CENTER_BUTTON_SIZE + 16,
    height: CENTER_BUTTON_SIZE + 16,
    borderRadius: (CENTER_BUTTON_SIZE + 16) / 2,
    backgroundColor: Colors.emeraldGlow,
  },
  centerButton: {
    width: CENTER_BUTTON_SIZE,
    height: CENTER_BUTTON_SIZE,
    borderRadius: CENTER_BUTTON_SIZE / 2,
    backgroundColor: Colors.emerald,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.emerald,
    shadowOffset: {width: 0, height: 6},
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 14,
    borderWidth: 3,
    borderColor: Colors.darkNavBar,
  },
  centerButtonActive: {
    backgroundColor: Colors.emeraldDark,
  },
  centerButtonInner: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
