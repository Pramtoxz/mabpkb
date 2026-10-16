import React from 'react';
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
  Typography,
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

const CORNER_LENGTH = 32;
const CORNER_THICKNESS = 3;
const CORNER_COLOR = Colors.accent;
const CORNER_RADIUS = 4;

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

export default function DocumentOverlay({variant = 'document', label}: DocumentOverlayProps) {
  const {width: screenWidth} = useWindowDimensions();

  const pulseOpacity = useSharedValue(1);
  React.useEffect(() => {
    pulseOpacity.value = withRepeat(
      withSequence(
        withTiming(0.6, {duration: 1200, easing: Easing.inOut(Easing.ease)}),
        withTiming(1, {duration: 1200, easing: Easing.inOut(Easing.ease)}),
      ),
      -1,
      false,
    );
  }, [pulseOpacity]);

  const pulseStyle = useAnimatedStyle(() => ({
    opacity: pulseOpacity.value,
  }));

  const isBarcode = variant === 'barcode';
  const widthPercent = isBarcode
    ? BARCODE_VIEWPORT_WIDTH_PERCENT
    : DOCUMENT_VIEWPORT_WIDTH_PERCENT;
  const ratio = isBarcode ? BARCODE_ASPECT_RATIO : DOCUMENT_ASPECT_RATIO;

  const cutoutWidth = screenWidth * widthPercent;
  const cutoutHeight = cutoutWidth * ratio;

  const defaultLabel = isBarcode ? 'Posisikan barcode di area ini' : 'Posisikan dokumen BPKB di area ini';
  const displayLabel = label ?? defaultLabel;

  return (
    <View style={styles.overlay} pointerEvents="none">
      <View style={styles.dimTop} />

      <View style={styles.middleRow}>
        <View style={styles.dimSide} />
        <View style={[styles.cutout, {width: cutoutWidth, height: cutoutHeight}]}>
          <Animated.View style={[styles.cornerFrame, pulseStyle]}>
            <CornerMarkers />
          </Animated.View>
        </View>
        <View style={styles.dimSide} />
      </View>

      <View style={styles.dimBottom}>
        <Text style={styles.label}>{displayLabel}</Text>
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
    backgroundColor: Colors.dim,
  },
  middleRow: {
    flexDirection: 'row',
  },
  dimSide: {
    flex: 1,
    backgroundColor: Colors.dim,
  },
  cutout: {
    backgroundColor: 'transparent',
  },
  cornerFrame: {
    ...(StyleSheet.absoluteFill as object),
  },
  dimBottom: {
    flex: 1,
    backgroundColor: Colors.dim,
    alignItems: 'center',
    paddingTop: 20,
  },
  label: {
    ...Typography.label,
    fontSize: 14,
    color: Colors.whiteTranslucent85,
    textAlign: 'center',
    paddingHorizontal: 24,
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