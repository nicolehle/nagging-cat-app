/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import { Platform } from 'react-native';

const tintColorLight = "#F48331"; // primary
const tintColorDark = "#FFC83D";  // accent works well on dark

export const Colors = {
  light: {
    text: "#403C3D",
    background: "#FBF6EF",
    tint: tintColorLight,
    icon: "rgba(64,60,61,0.60)",
    tabIconDefault: "rgba(64,60,61,0.45)",
    tabIconSelected: tintColorLight,
  },
  dark: {
    text: "#FFF7EE",
    background: "#151718",
    tint: tintColorDark,
    icon: "rgba(255,247,238,0.75)",
    tabIconDefault: "rgba(255,247,238,0.60)",
    tabIconSelected: tintColorDark,
  },
};

export const nagTheme = {
  colors: {
    // --- Warm Sunset Mischief core ---
    primary: "#F48331",       // Burnt Orange
    secondary: "#FFA56A",     // Soft Coral
    accent: "#FFC83D",        // Mustard Gold
    anchor: "#403C3D",        // Warm Charcoal

    // --- Backgrounds (warm paper) ---
    bg: "#F6F1EA",
    bgTexture: "#F4EDE4",

    // --- Card surfaces ---
    card: "#FFFCF7",
    cardInner: "#FFF7EE",

    // --- Text / ink ---
    ink: "#403C3D",           // use anchor as main ink to match mock
    inkSoft: "rgba(64,60,61,0.75)",
    inkFaint: "rgba(64,60,61,0.55)",

    // --- UI helpers ---
    border: "rgba(64,60,61,0.12)",
    divider: "rgba(64,60,61,0.10)",

    // --- Chips / badges ---
    chipBg: "rgba(244,131,49,0.14)",  // subtle orange wash
    chipText: "#403C3D",

    // --- States ---
    success: "#6FAF6A",       // warm green (for checkmarks)
    warning: "#FFC83D",
    danger: "#E86A5B",

    // --- On-colors (text/icons on top of fills) ---
    onPrimary: "#FFFFFF",
    onAccent: "#403C3D",
  },

  radii: { xl: 22, lg: 18, md: 14, pill: 999 },
  space: { xs: 6, sm: 10, md: 14, lg: 18, xl: 24 },
  text: { title: 22, cardTitle: 18, body: 14, meta: 12 },

  shadow: Platform.select({
    ios: {
      shadowColor: "#403C3D",
      shadowOpacity: 0.08,
      shadowRadius: 14,
      shadowOffset: { width: 0, height: 8 },
    },
    android: { elevation: 3 },
    default: {},
  }),

  fonts: {
    regular: "NunitoRegular",
    semibold: "NunitoSemiBold",
    bold: "NunitoBold",
  },
} as const;

