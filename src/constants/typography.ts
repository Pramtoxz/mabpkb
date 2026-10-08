import {Platform, TextStyle} from 'react-native';

const font = (family: string, weight: Platform['OS'] extends 'ios' ? string : never) => {
  if (Platform.OS === 'ios') {
    return {fontFamily: family, fontWeight: weight};
  }
  return {fontFamily: family};
};

export const Typography = {
  hero: {
    fontFamily: 'JetBrainsMono-Medium',
    fontSize: 64,
    lineHeight: 72,
    color: '#1A1A1A',
  } as TextStyle,

  dataLarge: {
    fontFamily: 'JetBrainsMono-Medium',
    fontSize: 32,
    lineHeight: 40,
    color: '#1A1A1A',
  } as TextStyle,

  dataMedium: {
    fontFamily: 'JetBrainsMono-Regular',
    fontSize: 18,
    lineHeight: 26,
    color: '#1A1A1A',
  } as TextStyle,

  dataSmall: {
    fontFamily: 'JetBrainsMono-Regular',
    fontSize: 14,
    lineHeight: 20,
    color: '#78716C',
  } as TextStyle,

  h1: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 28,
    lineHeight: 36,
    color: '#1A1A1A',
  } as TextStyle,

  h2: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 22,
    lineHeight: 30,
    color: '#1A1A1A',
  } as TextStyle,

  h3: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 18,
    lineHeight: 26,
    color: '#1A1A1A',
  } as TextStyle,

  body: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    lineHeight: 24,
    color: '#1A1A1A',
  } as TextStyle,

  bodySmall: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    lineHeight: 20,
    color: '#78716C',
  } as TextStyle,

  label: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    lineHeight: 20,
    color: '#78716C',
  } as TextStyle,

  labelSmall: {
    fontFamily: 'Inter-Medium',
    fontSize: 12,
    lineHeight: 16,
    color: '#78716C',
  } as TextStyle,

  button: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 18,
    lineHeight: 24,
    color: '#FFFFFF',
  } as TextStyle,
} as const;