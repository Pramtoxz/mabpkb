import React, {useCallback} from 'react';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import type {ScanStackParamList} from '../../navigation/types';
import {useScan} from '../../contexts/ScanContext';
import PhotoCaptureStep from '../../components/PhotoCaptureStep';

type Props = NativeStackScreenProps<ScanStackParamList, 'ScanStep4'>;

export default function ScanStep4Screen({navigation, route}: Props) {
  const {setPhoto4} = useScan();

  const handleNext = useCallback(() => {
    if (route.params?.returnToReview) {
      navigation.navigate('ScanReview');
      return;
    }
    if (route.params?.returnToStep) {
      navigation.navigate(`ScanStep${route.params.returnToStep}` as any);
      return;
    }
    navigation.navigate('ScanStep5');
  }, [navigation, route.params]);

  return (
    <PhotoCaptureStep
      step={4}
      totalSteps={5}
      title="Dokumen Persyaratan"
      filename="hal4.jpg"
      onCaptured={setPhoto4}
      onNext={handleNext}
    />
  );
}
