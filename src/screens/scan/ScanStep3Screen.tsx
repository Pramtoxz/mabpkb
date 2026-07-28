import React, {useCallback} from 'react';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import type {ScanStackParamList} from '../../navigation/types';
import {useScan} from '../../contexts/ScanContext';
import PhotoCaptureStep from '../../components/PhotoCaptureStep';

type Props = NativeStackScreenProps<ScanStackParamList, 'ScanStep3'>;

export default function ScanStep3Screen({navigation}: Props) {
  const {setPhoto3} = useScan();

  const handleNext = useCallback(
    () => navigation.navigate('ScanStep4'),
    [navigation],
  );

  return (
    <PhotoCaptureStep
      step={3}
      totalSteps={5}
      title="Foto Halaman 3"
      filename="hal3.jpg"
      onCaptured={setPhoto3}
      onNext={handleNext}
    />
  );
}
