/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import { Platform } from 'react-native';

const tintColorLight = '#0a7ea4';
const tintColorDark = '#fff';

export const Colors = {
  light: {
    text: '#11181C',
    background: '#fff',
    tint: tintColorLight,
    icon: '#687076',
    tabIconDefault: '#687076',
    tabIconSelected: tintColorLight,
  },
  dark: {
    text: '#ECEDEE',
    background: '#151718',
    tint: tintColorDark,
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: tintColorDark,
  },
};

export const nagTheme = {
  colors: {
    // Backgrounds (warm paper)
    bg: "#FBF6EF",
    bgTexture: "#F4EDE4",

    // Card surfaces
    card: "#FFFCF7",
    cardInner: "#FFF7EE",

    // Ink (emote-like brown instead of black)
    ink: "#3B2A22",
    inkSoft: "#6E5A4E",
    inkFaint: "#9A8579",

    // Accents (muted cocoa / latte)
    cocoa: "#7A4F3A",
    latte: "#E9D7C7",
    sand: "#D9C3B3",

    // Status chips
    chipBg: "#F2E4D8",
    chipText: "#6E5A4E",

    // Dividers
    divider: "rgba(59,42,34,0.10)",
  },

  radii: {
    xl: 22,
    lg: 18,
    md: 14,
    pill: 999,
  },

  space: {
    xs: 6,
    sm: 10,
    md: 14,
    lg: 18,
    xl: 24,
  },

  text: {
    title: 22,
    cardTitle: 18,
    body: 14,
    meta: 12,
  },

  shadow: Platform.select({
    ios: {
      shadowColor: "#3B2A22",
      shadowOpacity: 0.08,
      shadowRadius: 14,
      shadowOffset: { width: 0, height: 8 },
    },
    android: {
      elevation: 3,
    },
    default: {},
  }),

  fonts: {
    regular: "NunitoRegular",
    semibold: "NunitoSemiBold",
    bold: "NunitoBold",
},
} as const;

