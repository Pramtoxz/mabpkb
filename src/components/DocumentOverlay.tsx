import React, {useEffect, useState} from 'react';
import {View, Text, StyleSheet, useWindowDimensions} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import {
  Colors,
  DOCUMENT_ASPECT_RATIO,
  DOCUMENT_VIEWPORT_WIDTH_PERCENT,
  BARCODE_ASPECT_RATIO,
  BARCODE_VIEWPORT_WIDTH_PERCENT,
} from '../constants';

type OverlayVariant = 'document' | 'barcode';

interface DocumentOverlayProps {
  variant?: OverlayVariant;
  label?: string;
}

const CORNER_LENGTH = 36;
const CORNER_THICKNESS = 3.5;
const CORNER_COLOR = Colors.emeraldMint;
const CORNER_RADIUS = 6;

function CornerMarkers() {
  return (
    <>
      <View style={[cornerStyles.corner, cornerStyles.topLeft]}>
        <View style={[cornerStyles.horizontal, cornerStyles.topLeftH]} />
        <View style={[cornerStyles.vertical, cornerStyles.topLeftV]} />
      </View>
      <View style={[cornerStyles.corner, cornerStyles.topRight]}>
        <View style={[cornerStyles.horizontal, cornerStyles.topRightH]} />
        <View style={[cornerStyles.vertical, cornerStyles.topRightV]} />
      </View>
      <View style={[cornerStyles.corner, cornerStyles.bottomLeft]}>
        <View style={[cornerStyles.horizontal, cornerStyles.bottomLeftH]} />
        <View style={[cornerStyles.vertical, cornerStyles.bottomLeftV]} />
      </View>
      <View style={[cornerStyles.corner, cornerStyles.bottomRight]}>
        <View style={[cornerStyles.horizontal, cornerStyles.bottomRightH]} />
        <View style={[cornerStyles.vertical, cornerStyles.bottomRightV]} />
      </View>
    </>
  );
}

export default function DocumentOverlay({
  variant = 'document',
  label,
}: DocumentOverlayProps) {
  const {width: screenWidth} = useWindowDimensions();
  const [containerWidth, setContainerWidth] = useState(screenWidth);

  const pulseOpacity = useSharedValue(1);
  const laserProgress = useSharedValue(0);

  useEffect(() => {
    pulseOpacity.value = withRepeat(
      withSequence(
        withTiming(0.65, {duration: 1200, easing: Easing.inOut(Easing.ease)}),
        withTiming(1, {duration: 1200, easing: Easing.inOut(Easing.ease)}),
      ),
      -1,
      false,
    );

    laserProgress.value = withRepeat(
      withTiming(1, {duration: 2600, easing: Easing.inOut(Easing.quad)}),
      -1,
      true,
    );
  }, [pulseOpacity, laserProgress]);

  const pulseStyle = useAnimatedStyle(() => ({
    opacity: pulseOpacity.value,
  }));

  const isBarcode = variant === 'barcode';
  const widthPercent = isBarcode
    ? BARCODE_VIEWPORT_WIDTH_PERCENT
    : DOCUMENT_VIEWPORT_WIDTH_PERCENT;
  const ratio = isBarcode ? BARCODE_ASPECT_RATIO : DOCUMENT_ASPECT_RATIO;

  const baseWidth = containerWidth > 0 ? containerWidth : screenWidth;
  const cutoutWidth = baseWidth * widthPercent;
  const cutoutHeight = cutoutWidth * ratio;

  const laserStyle = useAnimatedStyle(() => ({
    transform: [{translateY: laserProgress.value * (cutoutHeight - 6)}],
  }));

  const defaultLabel = isBarcode
    ? 'Posisikan barcode BPKB di dalam area ini'
    : 'Posisikan berkas fisik BPKB di dalam bingkai';
  const displayLabel = label ?? defaultLabel;

  return (
    <View
      style={styles.overlay}
      pointerEvents="none"
      onLayout={e => {
        const w = e.nativeEvent.layout.width;
        if (w > 0) {
          setContainerWidth(w);
        }
      }}>
      <View style={styles.dimTop} />

      <View style={styles.middleRow}>
        <View style={styles.dimSide} />
        <View style={[styles.cutout, {width: cutoutWidth, height: cutoutHeight}]}>
          <Animated.View style={[styles.cornerFrame, pulseStyle]}>
            <CornerMarkers />
          </Animated.View>
          <Animated.View
            style={[styles.laserLine, {width: cutoutWidth - 12}, laserStyle]}
          />
        </View>
        <View style={styles.dimSide} />
      </View>

      <View style={styles.dimBottom}>
        <View style={styles.labelPill}>
          <Text style={styles.label}>{displayLabel}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...(StyleSheet.absoluteFill as object),
    zIndex: 100,
  },
  dimTop: {
    flex: 1,
    backgroundColor: Colors.cameraMaskDark,
  },
  middleRow: {
    flexDirection: 'row',
  },
  dimSide: {
    flex: 1,
    backgroundColor: Colors.cameraMaskDark,
  },
  cutout: {
    backgroundColor: Colors.transparent,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: Colors.cutoutBorder,
    borderRadius: 8,
  },
  cornerFrame: {
    ...(StyleSheet.absoluteFill as object),
  },
  laserLine: {
    position: 'absolute',
    left: 6,
    top: 3,
    height: 2,
    backgroundColor: Colors.emeraldMint,
    borderRadius: 1,
    shadowColor: Colors.emeraldMint,
    shadowOffset: {width: 0, height: 0},
    shadowOpacity: 0.9,
    shadowRadius: 8,
    elevation: 4,
  },
  dimBottom: {
    flex: 1,
    backgroundColor: Colors.cameraMaskDark,
    alignItems: 'center',
    paddingTop: 16,
  },
  labelPill: {
    backgroundColor: Colors.dimDark,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.cutoutBorderSubtle,
  },
  label: {
    fontFamily: 'Poppins-Medium',
    fontSize: 12.5,
    color: Colors.white,
    textAlign: 'center',
    letterSpacing: 0.3,
  },
});

const cornerStyles = StyleSheet.create({
  corner: {
    position: 'absolute',
    width: CORNER_LENGTH,
    height: CORNER_LENGTH,
  },
  horizontal: {
    position: 'absolute',
    width: CORNER_LENGTH,
    height: CORNER_THICKNESS,
    backgroundColor: CORNER_COLOR,
  },
  vertical: {
    position: 'absolute',
    width: CORNER_THICKNESS,
    height: CORNER_LENGTH,
    backgroundColor: CORNER_COLOR,
  },
  topLeft: {top: -1, left: -1},
  topLeftH: {top: 0, left: 0, borderTopLeftRadius: CORNER_RADIUS},
  topLeftV: {top: 0, left: 0, borderTopLeftRadius: CORNER_RADIUS},

  topRight: {top: -1, right: -1},
  topRightH: {top: 0, right: 0, borderTopRightRadius: CORNER_RADIUS},
  topRightV: {top: 0, right: 0, borderTopRightRadius: CORNER_RADIUS},

  bottomLeft: {bottom: -1, left: -1},
  bottomLeftH: {bottom: 0, left: 0, borderBottomLeftRadius: CORNER_RADIUS},
  bottomLeftV: {bottom: 0, left: 0, borderBottomLeftRadius: CORNER_RADIUS},

  bottomRight: {bottom: -1, right: -1},
  bottomRightH: {bottom: 0, right: 0, borderBottomRightRadius: CORNER_RADIUS},
  bottomRightV: {bottom: 0, right: 0, borderBottomRightRadius: CORNER_RADIUS},
});