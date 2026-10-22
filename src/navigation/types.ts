import type {NavigatorScreenParams} from '@react-navigation/native';

export type HomeStackParamList = {
  HomeMain: undefined;
  TeamDetail: undefined;
  DealerList: undefined;
  SopGuide: undefined;
  PedalTest: undefined;
  TrackStatus: {trackId?: string} | undefined;
  Handover: undefined;
  Revision: undefined;
  Performance: undefined;
};

export type ScanStackParamList = {
  ScanStep1: {returnToReview?: boolean; returnToStep?: number} | undefined;
  ScanStep2: {returnToReview?: boolean; returnToStep?: number} | undefined;
  ScanStep3: {returnToReview?: boolean; returnToStep?: number} | undefined;
  ScanStep4: {returnToReview?: boolean; returnToStep?: number} | undefined;
  ScanStep5: undefined;
  ScanReview: undefined;
};

export type BatchStackParamList = {
  TrackStatus: {trackId?: string};
};

export type RootTabParamList = {
  HomeTab: NavigatorScreenParams<HomeStackParamList>;
  ScanTab: NavigatorScreenParams<ScanStackParamList>;
  BatchTab: NavigatorScreenParams<BatchStackParamList>;
};
