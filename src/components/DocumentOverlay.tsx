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
import {Fonts} from '../constants';

type OverlayVariant = 'document' | 'barcode';

interface DocumentOverlayProps {
  variant?: OverlayVariant;
  label?: string;
}

const CORNER_LENGTH = 28;
const CORNER_THICKNESS = 3;
const CORNER_COLOR = '#FFFFFF';
const CORNER_RADIUS = 4;
const DIM_COLOR = 'rgba(0,0,0,0.50)';

const DOCUMENT_RATIO = 1.414;
const DOCUMENT_WIDTH_PERCENT = 0.82;

const BARCODE_RATIO = 0.35;
const BARCODE_WIDTH_PERCENT = 0.75;

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
        withTiming(0.5, {duration: 1200, easing: Easing.inOut(Easing.ease)}),
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
  const widthPercent = isBarcode ? BARCODE_WIDTH_PERCENT : DOCUMENT_WIDTH_PERCENT;
  const ratio = isBarcode ? BARCODE_RATIO : DOCUMENT_RATIO;

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
          <Animated.View style={[styles.borderFrame, pulseStyle]}>
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
    backgroundColor: DIM_COLOR,
  },
  middleRow: {
    flexDirection: 'row',
  },
  dimSide: {
    flex: 1,
    backgroundColor: DIM_COLOR,
  },
  cutout: {
    backgroundColor: 'transparent',
  },
  borderFrame: {
    ...(StyleSheet.absoluteFill as object),
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.35)',
    borderRadius: 8,
  },
  dimBottom: {
    flex: 1,
    backgroundColor: DIM_COLOR,
    alignItems: 'center',
    paddingTop: 20,
  },
  label: {
    fontFamily: Fonts.body.medium,
    fontSize: 13,
    color: 'rgba(255,255,255,0.85)',
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
