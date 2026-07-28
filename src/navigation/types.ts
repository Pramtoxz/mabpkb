import type {NavigatorScreenParams} from '@react-navigation/native';

export type HomeStackParamList = {
  HomeMain: undefined;
};

export type ScanStackParamList = {
  ScanStep1: undefined;
  ScanStep2: undefined;
  ScanStep3: undefined;
  ScanStep4: undefined;
  ScanStep5: undefined;
  Review: undefined;
};

export type BatchStackParamList = {
  TrackStatus: {trackId?: string};
};

export type RootTabParamList = {
  HomeTab: NavigatorScreenParams<HomeStackParamList>;
  ScanTab: NavigatorScreenParams<ScanStackParamList>;
  BatchTab: NavigatorScreenParams<BatchStackParamList>;
};
