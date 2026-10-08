import React from 'react';
import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  useAnimatedScrollHandler,
  interpolate,
  Extrapolation,
  type SharedValue,
} from 'react-native-reanimated';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {Path, Svg} from 'react-native-svg';
import {Colors, Fonts, Typography} from '../constants';

export const COLLAPSED_HEIGHT = 56;
export const EXPANDED_HEIGHT = 140;
const SCROLL_THRESHOLD = EXPANDED_HEIGHT - COLLAPSED_HEIGHT;
const TOOLBAR_ICON_SIZE = 40;
const BACK_ICON_SIZE = 20;

interface ActionItem {
  icon: React.ReactNode;
  onPress: () => void;
  accessibilityLabel?: string;
}

interface CollapsibleTopAppBarProps {
  title: string;
  subtitle?: string;
  scrollY: SharedValue<number>;
  onBack?: () => void;
  actions?: ActionItem[];
}

export function useCollapsibleHeader() {
  const scrollY: SharedValue<number> = useSharedValue(0);
  const onScroll = useAnimatedScrollHandler({
    onScroll: event => {
      'worklet';
      scrollY.value = event.contentOffset.y;
    },
  });
  return {scrollY, onScroll};
}

function M3BackButton({onPress}: {onPress: () => void}) {
  return (
    <TouchableOpacity
      style={styles.backButton}
      onPress={onPress}
      activeOpacity={0.7}
      hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}
      accessibilityRole="button"
      accessibilityLabel="Kembali">
      <Svg width={BACK_ICON_SIZE} height={BACK_ICON_SIZE} viewBox="0 0 24 24" fill="none">
        <Path
          d="M15 18l-6-6 6-6"
          stroke={Colors.primary}
          strokeWidth={2.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </Svg>
    </TouchableOpacity>
  );
}

function M3ActionButton({icon, onPress, accessibilityLabel}: ActionItem) {
  return (
    <TouchableOpacity
      style={styles.actionButton}
      onPress={onPress}
      activeOpacity={0.7}
      hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}>
      {icon}
    </TouchableOpacity>
  );
}

export default function CollapsibleTopAppBar({
  title,
  subtitle,
  scrollY,
  onBack,
  actions,
}: CollapsibleTopAppBarProps) {
  const insets = useSafeAreaInsets();

  const headerHeight = useAnimatedStyle(() => ({
    height: interpolate(
      scrollY.value,
      [0, SCROLL_THRESHOLD],
      [EXPANDED_HEIGHT + insets.top, COLLAPSED_HEIGHT + insets.top],
      Extrapolation.CLAMP,
    ),
  }));

  const surfaceTint = useAnimatedStyle(() => {
    const progress = interpolate(
      scrollY.value,
      [0, SCROLL_THRESHOLD * 0.5, SCROLL_THRESHOLD],
      [0, 0.6, 1],
      Extrapolation.CLAMP,
    );
    return {
      backgroundColor: `rgba(247, 244, 239, ${progress})`,
      borderBottomWidth: progress > 0.8 ? StyleSheet.hairlineWidth : 0,
      borderBottomColor: `rgba(232, 226, 216, ${progress})`,
    };
  });

  const elevationShadow = useAnimatedStyle(() => {
    const progress = interpolate(
      scrollY.value,
      [0, SCROLL_THRESHOLD],
      [0, 1],
      Extrapolation.CLAMP,
    );
    return {
      shadowOpacity: progress * 0.06,
      elevation: progress * 2,
    };
  });

  const collapsedTitleStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      scrollY.value,
      [SCROLL_THRESHOLD * 0.3, SCROLL_THRESHOLD * 0.8],
      [0, 1],
      Extrapolation.CLAMP,
    ),
  }));

  const expandedAreaStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      scrollY.value,
      [0, SCROLL_THRESHOLD * 0.6],
      [1, 0],
      Extrapolation.CLAMP,
    ),
    height: interpolate(
      scrollY.value,
      [0, SCROLL_THRESHOLD],
      [EXPANDED_HEIGHT - COLLAPSED_HEIGHT, 0],
      Extrapolation.CLAMP,
    ),
  }));

  return (
    <Animated.View style={[styles.header, headerHeight]}>
      <Animated.View style={[styles.surface, surfaceTint, elevationShadow]}>
        <View style={{height: insets.top}} />

        <View style={styles.toolbar}>
          {onBack ? (
            <M3BackButton onPress={onBack} />
          ) : (
            <View style={styles.toolbarSpacer} />
          )}

          <Animated.Text
            style={[styles.collapsedTitle, collapsedTitleStyle]}
            numberOfLines={1}>
            {title}
          </Animated.Text>

          <View style={styles.actionsRow}>
            {actions?.map((action, index) => (
              <M3ActionButton key={index} {...action} />
            ))}
          </View>
        </View>

        <Animated.View style={[styles.expandedContent, expandedAreaStyle]}>
          <Text style={styles.expandedTitle} numberOfLines={1}>
            {title}
          </Text>
          {subtitle ? (
            <Text style={styles.subtitle} numberOfLines={1}>
              {subtitle}
            </Text>
          ) : null}
        </Animated.View>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
    overflow: 'hidden',
  },
  surface: {
    flex: 1,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowRadius: 8,
  },
  toolbar: {
    height: COLLAPSED_HEIGHT,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  toolbarSpacer: {
    width: 16,
  },
  collapsedTitle: {
    flex: 1,
    fontFamily: Fonts.heading.semiBold,
    fontSize: 18,
    color: Colors.textPrimary,
    textAlign: 'center',
    marginHorizontal: 8,
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  expandedContent: {
    paddingHorizontal: 24,
    justifyContent: 'flex-end',
    paddingBottom: 12,
    overflow: 'hidden',
  },
  expandedTitle: {
    fontFamily: Fonts.heading.bold,
    fontSize: 28,
    color: Colors.primary,
  },
  subtitle: {
    fontFamily: Fonts.body.regular,
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  backButton: {
    width: TOOLBAR_ICON_SIZE,
    height: TOOLBAR_ICON_SIZE,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(212, 165, 74, 0.12)',
  },
  actionButton: {
    width: TOOLBAR_ICON_SIZE,
    height: TOOLBAR_ICON_SIZE,
    borderRadius: TOOLBAR_ICON_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
