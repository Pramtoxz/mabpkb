import React, {useCallback} from 'react';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import type {ScanStackParamList} from '../../navigation/types';
import {useScan} from '../../contexts/ScanContext';
import PhotoCaptureStep from '../../components/PhotoCaptureStep';

type Props = NativeStackScreenProps<ScanStackParamList, 'ScanStep2'>;

export default function ScanStep2Screen({navigation, route}: Props) {
  const {setPhoto2} = useScan();

  const handleNext = useCallback(() => {
    if (route.params?.returnToReview) {
      navigation.navigate('ScanReview');
      return;
    }
    navigation.navigate('ScanStep3');
  }, [navigation, route.params]);

  return (
    <PhotoCaptureStep
      step={2}
      totalSteps={5}
      title="Identitas Kendaraan"
      filename="hal2.jpg"
      onCaptured={setPhoto2}
      onNext={handleNext}
    />
  );
}
