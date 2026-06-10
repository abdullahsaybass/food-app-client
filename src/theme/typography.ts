export const FontFamily = {
  light:     'DMSans_300Light',
  regular:   'DMSans_400Regular',
  medium:    'DMSans_500Medium',
  semiBold:  'DMSans_600SemiBold',
  bold:      'DMSans_700Bold',
  extraBold: 'DMSans_800ExtraBold',
  black:     'DMSans_900Black',
};

export const FontSize = {
  xs:    12,
  sm:    14,
  md:    16,
  lg:    18,
  xl:    22,
  '2xl': 28,
  '3xl': 34,
  '4xl': 42,
} as const;

export const Typography = {
  // Hero / Big Titles
  displayLarge: {
    fontFamily: FontFamily.extraBold,
    fontSize: FontSize['4xl'],
    lineHeight: 50,
    letterSpacing: -1,
  },

  displayMedium: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize['3xl'],
    lineHeight: 40,
    letterSpacing: -0.8,
  },

  // Screen Headings
  headingLarge: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize['2xl'],
    lineHeight: 34,
    letterSpacing: -0.5,
  },

  headingMedium: {
    fontFamily: FontFamily.semiBold,
    fontSize: FontSize.xl,
    lineHeight: 30,
    letterSpacing: -0.3,
  },

  // Product Titles
  titleLarge: {
    fontFamily: FontFamily.semiBold,
    fontSize: FontSize.lg,
    lineHeight: 26,
  },

  titleMedium: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.md,
    lineHeight: 24,
  },

  // Main Body
  bodyLarge: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.md,
    lineHeight: 26,
  },

  bodyMedium: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    lineHeight: 22,
  },

  bodySmall: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.xs,
    lineHeight: 18,
  },

  // Buttons / Labels
  labelLarge: {
    fontFamily: FontFamily.semiBold,
    fontSize: FontSize.md,
    lineHeight: 22,
    letterSpacing: 0.3,
  },

  labelSmall: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.xs,
    lineHeight: 18,
    letterSpacing: 1,
    textTransform: 'uppercase' as const,
  },

  // Price Text
  priceLarge: {
    fontFamily: FontFamily.extraBold,
    fontSize: 30,
    lineHeight: 34,
    letterSpacing: -0.5,
  },

  priceMedium: {
    fontFamily: FontFamily.bold,
    fontSize: 22,
    lineHeight: 28,
  },

  // Caption
  caption: {
    fontFamily: FontFamily.medium,
    fontSize: 13,
    lineHeight: 18,
    opacity: 0.8,
  },
} as const;