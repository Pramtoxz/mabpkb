import {Platform, TextStyle} from 'react-native';
import {Colors} from './colors';

const font = (family: string, weight: Platform['OS'] extends 'ios' ? string : never) => {
  if (Platform.OS === 'ios') {
    return {fontFamily: family, fontWeight: weight};
  }
  return {fontFamily: family};
};

export const Typography = {
  displayBold: {
    fontFamily: 'Poppins-Bold',
    fontSize: 32,
    lineHeight: 38,
    color: Colors.textPrimary,
  } as TextStyle,

  displaySemiBold: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 22,
    lineHeight: 30,
    color: Colors.textPrimary,
  } as TextStyle,

  displayMedium: {
    fontFamily: 'Poppins-Medium',
    fontSize: 16,
    lineHeight: 24,
    color: Colors.textPrimary,
  } as TextStyle,

  displayRegular: {
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
    lineHeight: 20,
    color: Colors.textSecondary,
  } as TextStyle,

  poppinsBold: {
    fontFamily: 'Poppins-Bold',
  } as TextStyle,

  poppinsSemiBold: {
    fontFamily: 'Poppins-SemiBold',
  } as TextStyle,

  poppinsMedium: {
    fontFamily: 'Poppins-Medium',
  } as TextStyle,

  poppinsRegular: {
    fontFamily: 'Poppins-Regular',
  } as TextStyle,

  hero: {
    fontFamily: 'JetBrainsMono-Medium',
    fontSize: 64,
    lineHeight: 72,
    color: Colors.textCharcoal,
  } as TextStyle,

  dataLarge: {
    fontFamily: 'JetBrainsMono-Medium',
    fontSize: 32,
    lineHeight: 40,
    color: Colors.textCharcoal,
  } as TextStyle,

  dataMedium: {
    fontFamily: 'JetBrainsMono-Regular',
    fontSize: 18,
    lineHeight: 26,
    color: Colors.textCharcoal,
  } as TextStyle,

  dataSmall: {
    fontFamily: 'JetBrainsMono-Regular',
    fontSize: 14,
    lineHeight: 20,
    color: Colors.textMuted,
  } as TextStyle,

  h1: {
    fontFamily: 'Poppins-Bold',
    fontSize: 28,
    lineHeight: 36,
    color: Colors.textPrimary,
  } as TextStyle,

  h2: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 22,
    lineHeight: 30,
    color: Colors.textPrimary,
  } as TextStyle,

  h3: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 18,
    lineHeight: 26,
    color: Colors.textPrimary,
  } as TextStyle,

  body: {
    fontFamily: 'Poppins-Regular',
    fontSize: 16,
    lineHeight: 24,
    color: Colors.textPrimary,
  } as TextStyle,

  bodySmall: {
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
    lineHeight: 20,
    color: Colors.textSecondary,
  } as TextStyle,

  label: {
    fontFamily: 'Poppins-Medium',
    fontSize: 14,
    lineHeight: 20,
    color: Colors.textSecondary,
  } as TextStyle,

  labelSmall: {
    fontFamily: 'Poppins-Medium',
    fontSize: 12,
    lineHeight: 16,
    color: Colors.textSecondary,
  } as TextStyle,

  button: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 16,
    lineHeight: 22,
    color: Colors.white,
  } as TextStyle,
} as const;