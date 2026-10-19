import React, {useCallback, useRef} from 'react';
import {View, StyleSheet} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {Colors, Spacing, Radius} from '../constants';
import {useScan, type ScanImage} from '../contexts/ScanContext';
import {useHardwareKey} from '../hooks/useHardwareKey';
import {scanQueue} from '../utils/scanQueue';
import PedalCamera from './PedalCamera';
import ScanStepIndicator from './ScanStepIndicator';
import ThumbnailStrip from './ThumbnailStrip';
import ScanTopDealerAlert from './ScanTopDealerAlert';

interface PhotoCaptureStepProps {
  step: number;
  totalSteps: number;
  title: string;
  filename: string;
  onCaptured: (img: ScanImage) => void;
  onNext: () => void;
}

export default function PhotoCaptureStep({
  step,
  totalSteps,
  filename,
  onCaptured,
  onNext,
}: PhotoCaptureStepProps) {
  const insets = useSafeAreaInsets();
  const {state} = useScan();
  const nextTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleCapture = useCallback(
    (img: ScanImage, layout?: {width: number; height: number}) => {
      onCaptured(img);
      scanQueue.enqueue({
        step: step as any,
        rawUri: img.uri,
        filename,
        viewWidth: layout?.width,
        viewHeight: layout?.height,
        onDone: processed => {
          onCaptured(processed);
        },
      });
      nextTimerRef.current = setTimeout(onNext, 120);
    },
    [filename, onCaptured, onNext, step],
  );

  const handleRetake = useCallback(() => {
    if (nextTimerRef.current) {
      clearTimeout(nextTimerRef.current);
    }
  }, []);

  useHardwareKey(handleRetake, true, 'volumeUp');

  return (
    <View style={[styles.container, {paddingBottom: insets.bottom + Spacing.sm}]}>
      <ScanStepIndicator currentStep={step} totalSteps={totalSteps} />

      {state.dealer ? (
        <ScanTopDealerAlert
          dealerName={state.dealer.nm_dealer}
          paymentType={state.dealer.payment_type}
        />
      ) : null}

      <View style={styles.cameraArea}>
        <PedalCamera
          filename={filename}
          onCapture={handleCapture}
          isActive={true}
        />
      </View>

      <ThumbnailStrip currentStep={step} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    paddingHorizontal: Spacing.lg,
  },
  cameraArea: {
    flex: 1,
    borderRadius: Radius.lg,
    overflow: 'hidden',
    marginBottom: Spacing.sm,
  },
});