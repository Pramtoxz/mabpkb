import React, {useCallback, useEffect} from 'react';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import {Mat, DataTypes} from 'react-native-fast-opencv';
import type {ScanStackParamList} from '../../navigation/types';
import {useScan} from '../../contexts/ScanContext';
import PhotoCaptureStep from '../../components/PhotoCaptureStep';

type Props = NativeStackScreenProps<ScanStackParamList, 'ScanStep1'>;

export default function ScanStep1Screen({navigation, route}: Props) {
  const {setPhoto1} = useScan();

  useEffect(() => {
    try {
      const dummy = Mat.create(1, 1, DataTypes.CV_8UC1);
      dummy.release();
    } catch {}
  }, []);

  const handleNext = useCallback(() => {
    if (route.params?.returnToReview) {
      navigation.navigate('ScanReview');
      return;
    }
    if (route.params?.returnToStep) {
      navigation.navigate(`ScanStep${route.params.returnToStep}` as any);
      return;
    }
    navigation.navigate('ScanStep2');
  }, [navigation, route.params]);

  return (
    <PhotoCaptureStep
      step={1}
      totalSteps={5}
      title="Identitas Pemilik"
      filename="hal1.jpg"
      onCaptured={setPhoto1}
      onNext={handleNext}
    />
  );
}
