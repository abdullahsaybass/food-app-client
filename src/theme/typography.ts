import { Platform } from 'react-native';

export const FontFamily = {
  regular: Platform.select({ ios: 'System', android: 'sans-serif' })!,
  medium: Platform.select({ ios: 'System', android: 'sans-serif-medium' })!,
  semiBold: Platform.select({ ios: 'System', android: 'sans-serif-medium' })!,
  bold: Platform.select({ ios: 'System', android: 'sans-serif-bold' })!,
  // After adding custom font (e.g. Nunito / Poppins):
  // regular: 'Poppins-Regular',
  // medium: 'Poppins-Medium',
  // semiBold: 'Poppins-SemiBold',
  // bold: 'Poppins-Bold',
};

export const FontSize = {
  xs: 11,
  sm: 13,
  md: 15,
  lg: 17,
  xl: 20,
  '2xl': 24,
  '3xl': 30,
  '4xl': 38,
} as const;

export const Typography = {
  displayLarge:  { fontFamily: FontFamily.bold,     fontSize: FontSize['4xl'], lineHeight: 46, letterSpacing: -0.5 },
  displayMedium: { fontFamily: FontFamily.bold,     fontSize: FontSize['3xl'], lineHeight: 38, letterSpacing: -0.3 },
  headingLarge:  { fontFamily: FontFamily.bold,     fontSize: FontSize['2xl'], lineHeight: 32 },
  headingMedium: { fontFamily: FontFamily.semiBold, fontSize: FontSize.xl,    lineHeight: 28 },
  titleLarge:    { fontFamily: FontFamily.semiBold, fontSize: FontSize.lg,    lineHeight: 24 },
  titleMedium:   { fontFamily: FontFamily.medium,   fontSize: FontSize.md,    lineHeight: 22 },
  bodyLarge:     { fontFamily: FontFamily.regular,  fontSize: FontSize.md,    lineHeight: 24 },
  bodyMedium:    { fontFamily: FontFamily.regular,  fontSize: FontSize.sm,    lineHeight: 20 },
  bodySmall:     { fontFamily: FontFamily.regular,  fontSize: FontSize.xs,    lineHeight: 16 },
  labelLarge:    { fontFamily: FontFamily.semiBold, fontSize: FontSize.md,    lineHeight: 20, letterSpacing: 0.2 },
  labelSmall:    { fontFamily: FontFamily.medium,   fontSize: FontSize.xs,    lineHeight: 16, letterSpacing: 0.6, textTransform: 'uppercase' as const },
} as const;