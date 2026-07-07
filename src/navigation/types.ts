import type {NavigatorScreenParams} from '@react-navigation/native';

export type HomeStackParamList = {
  HomeMain: undefined;
};

export type ScanStackParamList = {
  ScanIdentity: undefined;
  ScanNoMesin: undefined;
  ScanBarcode: undefined;
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
