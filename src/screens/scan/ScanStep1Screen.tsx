import React, {useCallback} from 'react';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import type {ScanStackParamList} from '../../navigation/types';
import {useScan} from '../../contexts/ScanContext';
import PhotoCaptureStep from '../../components/PhotoCaptureStep';

type Props = NativeStackScreenProps<ScanStackParamList, 'ScanStep1'>;

export default function ScanStep1Screen({navigation}: Props) {
  const {setPhoto1} = useScan();

  const handleNext = useCallback(
    () => navigation.navigate('ScanStep2'),
    [navigation],
  );

  return (
    <PhotoCaptureStep
      step={1}
      totalSteps={5}
      title="Foto Halaman 1"
      filename="hal1.jpg"
      onCaptured={setPhoto1}
      onNext={handleNext}
    />
  );
}
